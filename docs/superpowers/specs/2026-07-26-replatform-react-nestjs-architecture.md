# Replatform: React + NestJS + Supabase — Architecture Plan

**Date:** 2026-07-26
**Status:** Approved in principle; awaiting spec review before scaffolding.
**Supersedes:** the vanilla-JS delivery of the multi-stream work (curriculum *content* is
reused; the vanilla UI/runtime is retired at cut-over).

## 1. Decisions (locked)

| Area | Choice | Why |
| --- | --- | --- |
| Backend style | **Modular monolith in NestJS, service-ready** | One deployable, cheap to run/build; module boundaries drawn as future services so it can be split later without rewrites. Right size for an LMS. |
| Hosting | **~Free tier** | Frontend on Vercel/Netlify/Cloudflare Pages (free); NestJS on Render/Railway/Fly.io free tier (sleeps on idle); Supabase free. |
| Migration | **Full replatform** | React+NestJS becomes the product; vanilla app retired at parity. |
| Auth | **Supabase Auth (Google)** | Reuse the working Google OAuth; NestJS *verifies* the Supabase JWT and owns profiles/roles/allowlist. |
| DB | **Supabase Postgres** | Managed Postgres + Auth; backend owns the `public` schema via Prisma. |

> **Note on "microservices":** the request was a microservice architecture. For this app's
> scale and the ~free-hosting constraint, a **modular monolith with service-ready seams** is
> the professionally correct call — same domains, one process now, split into services only if
> load demands it. The module boundaries below *are* the future service boundaries.

## 2. High-level architecture

```mermaid
flowchart LR
  subgraph Client
    W[React SPA (Vite + TS)]
  end
  subgraph Edge
    CDN[Static host: Vercel/Netlify/CF Pages]
  end
  subgraph Backend[NestJS modular monolith]
    GW[HTTP layer + Guards]
    A[Auth module]
    U[Users module]
    C[Catalog module]
    P[Progress module]
    S[Assessment module]
    AD[Admin module]
  end
  subgraph Supabase
    AU[(Auth / Google OAuth)]
    DB[(Postgres)]
  end

  W -->|"OAuth (supabase-js)"| AU
  W -->|"HTTPS + JWT Bearer"| GW
  CDN --- W
  GW --> A --> U
  GW --> C
  GW --> P
  GW --> S
  GW --> AD
  A -->|verify JWT| AU
  U & C & P & S & AD -->|Prisma| DB
```

Data flow: React authenticates with Supabase (Google) and receives a JWT → sends it as a
Bearer token to NestJS → an `AuthGuard` verifies the token against Supabase's signing key and
attaches `{ userId, email }` → an `AllowlistGuard`/`RolesGuard` authorizes → the module reads/
writes Postgres via Prisma → JSON back to React (cached by TanStack Query).

## 3. Monorepo layout

```
master-power-bi/                 (pnpm workspaces + Turborepo)
├─ apps/
│  ├─ web/                       React SPA (Vite + TS)
│  └─ api/                       NestJS modular monolith
├─ packages/
│  ├─ contracts/                 Shared DTOs / API types (used by web + api)
│  └─ content/                   Ported curriculum data (Power BI + Data Science) + seed
├─ infra/
│  ├─ Dockerfile.api
│  ├─ docker-compose.yml         local dev
│  └─ github-actions/            CI (lint, test, build)
└─ docs/
```

`packages/contracts` is the shared source of truth for request/response types — the frontend
and backend both import it, so the API contract can't silently drift.

## 4. Backend — NestJS modules (service-ready boundaries)

| Module | Responsibility | Key endpoints |
| --- | --- | --- |
| **Auth** | Verify Supabase JWT; expose `@CurrentUser()`; `AllowlistGuard`, `RolesGuard`. | `GET /me` |
| **Users** | Profiles, roles; allowlist management (admin). | `GET /me`, `GET/POST/DELETE /admin/allowlist` |
| **Catalog** | Streams, modules, lessons, reference, glossary, flashcards, FAQ, toolkit. Read-heavy, cached. | `GET /streams`, `GET /streams/:id/modules`, `GET /lessons/:id`, `GET /streams/:id/reference` |
| **Progress** | Per-user, per-stream: completions, notes, bookmarks, reflections, streak, resume. | `GET /progress/:stream`, `PUT /progress/:stream`, `POST /progress/:stream/lessons/:id/complete` |
| **Assessment** | Diagnostic, quizzes, attempts, scoring, mastery bands. | `POST /assess/diagnostic`, `POST /assess/:stream/module/:n/attempt`, `GET /assess/:stream/results` |
| **Admin** | Cohort analytics per stream, CSV export. | `GET /admin/cohort?stream=`, `GET /admin/cohort.csv` |
| **Common** | Prisma provider, config, logging, error filter, DTO validation (class-validator), health. | `GET /health` |

**Service-ready rules:** modules never touch another module's tables directly — they call the
other module's service. Extracting a module into its own Nest microservice later = swap the
in-process provider for a `ClientProxy` (NATS/Redis transport). No business-logic rewrite.

**DB access:** **Prisma** against Supabase Postgres (type-safe, migrations). Backend uses the
Supabase **service role** connection, so authorization is enforced in NestJS guards; RLS kept
as optional defense-in-depth. Prisma owns the `public` schema; Supabase owns `auth.users`.

**Auth verification:** `AuthGuard` validates the Supabase JWT (HS256 shared secret or the
project's JWKS for asymmetric keys), extracts `sub`→userId and `email`. `AllowlistGuard`
checks `allowed_faculty`; `RolesGuard` checks `profiles.role='admin'`. Same rules as today,
moved server-side.

## 5. Frontend — React SPA

- **Stack:** Vite + React + TypeScript, React Router, **TanStack Query** (server state),
  lightweight **Zustand**/Context for UI (stream selection, theme, a11y), `@supabase/supabase-js`
  for Google OAuth only.
- **Design system:** port the existing tokens/CSS into a small component library —
  `Button, Card, Tag, ProgressBar/Ring, LessonJourney, DemoPlayer, HintLadder, Quiz, DnD,
  Flashcard, Accordion, StreamSwitcher, AuthGate, AccountMenu, AdminTable`. Keep the Power BI
  visual identity + light/dark + a11y controls already built.
- **Routing:** mirrors today — `/`, `/learning`, `/paths`, `/modules`, `/module/:n`,
  `/lesson/:id`, `/lab`, `/cases`, `/case/:id`, `/assess`, `/teach`, `/reference`, `/progress`,
  `/help`, `/admin` — all under an active-stream context; `ProtectedRoute` enforces auth.
- **Auth:** `AuthProvider` (Supabase session) → sign-in gate → allowlist check via `GET /me`.
- **Data:** all content/progress/assessment via typed hooks over the NestJS API
  (`packages/contracts`), with optimistic updates + offline cache for progress.

## 6. Data model (Supabase Postgres, owned by Prisma)

```
profiles(id uuid pk = auth.users.id, email, full_name, role, last_seen, created_at)
allowed_faculty(email pk, added_at)
-- content (seeded from packages/content; can also stay in-code and be served)
streams(id pk, name, emoji, tagline, ord)
modules(id pk, stream_id fk, n, title, emoji, blurb, ord)
lessons(id pk, module_id fk, stream_id fk, title, minutes, body jsonb, ord)
-- learner data (per user + stream)
progress(user_id, stream_id, state jsonb, pct, lessons_done, avg_quiz, readiness, streak,
         updated_at, pk(user_id, stream_id))
assessment_attempts(id pk, user_id, stream_id, key, best int, attempts int, last int, updated_at)
badges(user_id, stream_id, badge_id, earned_at, pk(user_id,stream_id,badge_id))
```

Content may live as **seed data** (from `packages/content`) rather than authored in the DB UI —
authoring stays in code review, and Catalog serves it. Migration from the current Supabase:
existing `progress` rows map to `stream_id='powerbi'`.

## 7. Deployment (~free)

- **Web:** Vercel/Netlify/Cloudflare Pages — free, global CDN, auto-deploy on push.
- **API:** Render/Railway/Fly.io free tier — one NestJS container (`infra/Dockerfile.api`).
  Free tiers sleep on idle → first request is slow; acceptable for a pilot. A tiny always-on
  plan (~$5–7/mo) removes cold starts later.
- **DB/Auth:** existing Supabase project (add API env: `SUPABASE_URL`, service role key, JWT
  secret, `DATABASE_URL`).
- **CI:** GitHub Actions — lint + unit + build on PR; deploy on merge to `main`.

## 8. Testing

- **API:** Jest unit tests per service; Nest e2e (supertest) per module with a test Postgres.
- **Web:** Vitest + React Testing Library for components/hooks.
- **End-to-end:** Playwright across the running stack (login → learn a lesson → quiz →
  progress → admin), including per-stream isolation.
- **Contract:** `packages/contracts` types shared, so web/api can't drift; optional schema tests.

## 9. Phased delivery (each phase = its own PR, tested + deployable)

1. **Foundation:** monorepo (pnpm+Turborepo), `apps/api` (Nest + Prisma + Supabase JWT auth +
   `/me` + allowlist), `apps/web` (Vite shell + AuthProvider + sign-in gate). Login works
   end-to-end.
2. **Catalog + shell:** port curriculum to `packages/content`; Catalog read APIs; React design
   system + module/lesson rendering (Power BI stream first).
3. **Progress + Assessment:** sync + quizzes + mastery; React progress/quiz UIs; migrate
   existing Supabase progress to `stream_id='powerbi'`.
4. **Multi-stream + Admin:** stream switcher; Data Science stream content; Admin cohort
   dashboard (per stream) + CSV.
5. **Parity + cut-over:** e2e parity pass, deploy web+api, point the link to the new app,
   retire the vanilla version.

## 10. Interaction with in-flight work

- **PR #2 (vanilla multi-stream):** the *curriculum content* (Data Science, all 23 modules)
  is stack-agnostic and still needed — it becomes `packages/content`. The **vanilla UI waves
  are dropped** in favour of building multi-stream natively in React. Recommend: keep
  authoring DS content as portable data; do not invest further in the vanilla runtime.
- The current live vanilla site keeps running until the React app reaches parity (§9.5).

## 11. Risks & mitigations

- **Free-tier cold starts** → accept for pilot; cheap always-on upgrade path noted.
- **Supabase JWT verification** (HS256 vs asymmetric/JWKS) → detect the project's key type at
  setup; guard supports both.
- **Replatform is large** → phased PRs; vanilla app stays live until parity.
- **Content re-authoring risk** → port data 1:1 into `packages/content`; snapshot-compare
  rendered lessons against the vanilla version.
- **Scope creep to real microservices** → resist; module seams make a later split cheap if
  ever needed.

## 12. Out of scope (YAGNI, for now)

Message broker / multiple services / Kubernetes; running Python or scikit-learn in the browser;
auto-grading uploaded notebooks; per-class cohorts; SSR/Next.js (SPA is sufficient).
