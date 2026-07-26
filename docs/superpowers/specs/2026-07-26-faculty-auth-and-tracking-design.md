# Faculty Auth-Gated Learning + Admin Progress Tracking — Design

**Date:** 2026-07-26
**Status:** Approved (design)
**Repo:** `master-power-bi` (static site on GitHub Pages)

## 1. Purpose

Turn the currently backendless, per-browser Power BI toolkit into a **login-gated**
platform where:

- Only **approved faculty** can access the learning content (Google sign-in + allowlist).
- Each faculty member's progress is **stored centrally** and follows them across devices.
- An **admin** (the trainer) sees a **cohort dashboard** of everyone's progress.

Hosting stays **free** (GitHub Pages + Supabase free tier). The Supabase **anon key is
committed** to the public repo — this is safe by design; data is protected by Row-Level
Security, not by hiding the key.

## 2. Decisions (locked)

| Decision | Choice |
| --- | --- |
| Login | **Mandatory** — the whole app is behind a sign-in gate |
| Sign-in method | **Google** (OAuth via Supabase) |
| Backend | **Supabase** (Postgres + Auth + RLS) |
| Who may enter | **Approved email allowlist** (managed in-app by admin) |
| Tracking view | **Admin dashboard** — admin sees all faculty |
| Anon key in repo | **Committed** (public-safe) |

## 3. User-facing behaviour

### 3.1 Auth gate (states)

1. **No session** → full-screen "Sign in with Google to start learning" screen. Nothing
   else in the app is reachable (router refuses all routes until authed).
2. **Signed in + on allowlist (or admin)** → the full app loads; progress syncs.
3. **Signed in + NOT on allowlist** → "You're not on the access list yet — ask your
   admin." screen, with a **Sign out** button. No `progress` row is created.
4. **Auth/cloud unreachable (offline, first ever use)** → "You need to be online to sign
   in the first time." message.
5. **Previously-approved, now offline** → cached valid session + cached `accessGranted`
   flag lets them **re-enter and keep learning offline**; sync resumes when back online.

### 3.2 Account control

Topbar shows the signed-in user's avatar/name with a menu: **Sign out**, and (admins only)
a link to **Admin**. Replaces the current footer "nothing leaves your device" line with:
*"Signed in as X. Your progress is saved to your cohort so your instructor can support
you."*

### 3.3 Admin dashboard (`#/admin`, admins only)

- Sortable table: **Name · Email · % complete · Lessons done · Avg quiz · Faculty
  readiness · Streak · Last active**.
- **CSV export** of the table.
- **Allowlist manager**: list of approved emails; add (input + button) / remove.
- Empty, loading, and error states for each panel.

Non-admins navigating to `#/admin` are redirected home.

## 4. Data model (Supabase Postgres)

### 4.1 Tables

```
profiles
  id          uuid  primary key references auth.users(id) on delete cascade
  email       text  not null
  full_name   text
  role        text  not null default 'faculty'   -- 'faculty' | 'admin'
  last_seen   timestamptz default now()
  created_at  timestamptz default now()

progress
  user_id      uuid primary key references auth.users(id) on delete cascade
  state        jsonb not null default '{}'::jsonb   -- full client Store blob
  pct          int   not null default 0             -- denormalized for cheap admin reads
  lessons_done int   not null default 0
  avg_quiz     int   not null default 0
  readiness    int   not null default 0
  streak       int   not null default 0
  updated_at   timestamptz default now()

allowed_faculty
  email       text primary key                       -- lower-cased
  added_at    timestamptz default now()
```

### 4.2 Row-Level Security (policies)

- **profiles**: user selects/updates **own** row (`id = auth.uid()`); **admin** selects
  all. Insert own row on first login.
- **progress**: user selects/insert/update **own** row (`user_id = auth.uid()`); **admin**
  selects all. No update of others.
- **allowed_faculty**: any authenticated user may select **only the row matching their own
  email** (`email = lower(auth.jwt()->>'email')`) — enough to self-check access; **admin**
  selects/inserts/deletes all.
- Admin test used by policies: `exists (select 1 from profiles p where p.id = auth.uid()
  and p.role = 'admin')`.

### 4.3 Bootstrapping the first admin

Provided as one-time SQL (run in Supabase SQL editor after the admin's first sign-in):

```sql
insert into allowed_faculty(email) values ('you@example.com')
  on conflict do nothing;
update profiles set role = 'admin' where email = 'you@example.com';
```

## 5. Architecture / components

Existing files are **untouched**. New pieces:

| Unit | Responsibility | Depends on |
| --- | --- | --- |
| `assets/config.js` | Holds `SUPABASE_URL`, `SUPABASE_ANON_KEY` (public). | — |
| `assets/cloud.js` (`window.Cloud`) | Load supabase-js from CDN; Google sign-in/out; session restore; allowlist check; debounced push/pull of progress; expose `onAuthChange`, `pushState`, `pullState`, admin queries (`listCohort`, `listAllowed`, `addAllowed`, `removeAllowed`). Degrades to disabled if CDN/offline. | Supabase JS, `config.js` |
| Auth gate (in `app.js`) | Full-screen sign-in / not-approved / offline screens; blocks router until access resolved. | `Cloud` |
| Account control (in `app.js`) | Topbar avatar + menu (sign out, admin link). | `Cloud` |
| `#/admin` route (in `app.js`) | Cohort table + CSV + allowlist manager. | `Cloud` |
| Sync bridge (in `store.js`/`app.js`) | On `Store.save()` → debounced `Cloud.pushState(blob + denormalized)`; on login → `Cloud.pullState()` then merge. | `Store`, `Cloud` |

### 5.1 Data flow

```
Google OAuth ─▶ Supabase session ─▶ Cloud.checkAccess(email)
   ├─ approved/admin ─▶ ensure profile ─▶ pullState ─▶ merge into Store ─▶ render app
   │                                   ◀─ pushState (debounced) ◀─ Store.save()
   └─ not approved ─▶ show no-access screen ─▶ sign out
```

### 5.2 Sync & merge rules

- **On first-ever login** (no remote `progress` row): push the local Store blob up
  (captures any pre-existing local work).
- **On subsequent login**: pull remote; **merge** conservatively so nothing is lost —
  union of completed lessons, `max` of each quiz best score, `max` streak, longer notes
  win, union of bookmarks/mistakes/caseSteps/teachbacks (max). Remote wins ties on scalars.
- **On save**: recompute denormalized metrics (pct, lessons_done, avg_quiz, readiness,
  streak) client-side and upsert both `state` and those columns (debounced ~1.5s).
- Writes while offline are queued in localStorage and flushed on reconnect.

### 5.3 Offline resilience

- supabase-js persists the session in localStorage; on reload it restores without network.
- A cached `pbi_access_granted` flag (per email) lets a previously-approved user pass the
  gate offline. Access is re-verified against the allowlist on the next successful online
  load; if revoked, they're signed out then.

## 6. Setup steps (documented for the admin)

A `docs/SETUP-SUPABASE.md` will give click-by-click steps:

1. Create a free Supabase project.
2. Run the provided SQL (tables + RLS + policies).
3. Create a Google OAuth client (Google Cloud console); add authorized redirect URIs:
   the Supabase callback and the GitHub Pages origin.
4. In Supabase → Auth → Providers → Google: paste client ID/secret.
5. Paste project URL + anon key into `assets/config.js`.
6. Sign in once, then run the admin-seed SQL for your email.
7. Add faculty emails via the in-app allowlist manager.

## 7. Error / empty / loading states

- **Loading**: gate shows a spinner while resolving session/access; admin panels show
  skeletons.
- **Empty**: admin table with no faculty yet → "No faculty have signed in yet. Add emails
  to the allowlist and share the link." Allowlist empty → prompt to add the first email.
- **Error**: cloud unreachable → non-blocking banner "Cloud sync paused — you can keep
  learning; progress will sync when you're back online." Sign-in failure → retry button.

## 8. Testing strategy

- **Headless (automated, in this repo):**
  - Gate renders the signed-out screen when no Supabase config / mocked no-session.
  - Not-approved screen renders on mocked disallowed email.
  - Admin table + allowlist manager render correctly from **mocked** `Cloud` data;
    CSV export produces a file; sort works.
  - Local-only fallback: with `Cloud` disabled, the existing app still routes and saves
    (regression guard on current behaviour).
  - Merge function unit-checked with crafted local/remote blobs (no data loss).
- **Manual (admin, against live project):** Google sign-in works; approved vs non-approved
  behaviour; cross-device continuity; admin sees a second test account; allowlist add/remove
  takes effect. Delivered as a checklist.

## 9. Scope

**In:** mandatory Google login gate, email allowlist (+ in-app manager), per-user progress
sync, admin cohort table + CSV export, setup docs.

**Out (YAGNI):** passwords, magic links, multiple classes/cohorts, messaging/notifications,
editing another user's progress, analytics beyond the cohort table.

## 10. Risks & mitigations

- **Google OAuth setup friction** → detailed step-by-step doc; the only non-copy-paste part.
- **Supabase free project pauses after 7 days idle** → auto-resumes on next visit; optional
  keep-warm GitHub Action can be added later if needed (out of scope now).
- **Offline-first weakened by mandatory login** → accepted; mitigated by cached session +
  access flag so only the *first* sign-in strictly needs internet.
- **Public anon key** → safe; all access governed by RLS. Verified by policy tests.
