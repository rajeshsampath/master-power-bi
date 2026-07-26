# Multi-Stream LMS + Data Science "Zero to Master" — Design

**Date:** 2026-07-26
**Status:** Approved in principle (stream-switcher model, full 23-module build)
**Builds on:** the existing Power BI stream + faculty auth/tracking.

## 1. Purpose

Convert the single-subject Power BI toolkit into a **multi-stream LMS** and add a full
**Data Science: Zero to Master** stream. Faculty pick a stream, learn within it, and their
progress is tracked **per stream**. Admins see progress across both streams.

## 2. Approved decisions

| Decision | Choice |
| --- | --- |
| Stream model | **Stream switcher + picker** — content scoped to the active stream |
| Progress | Tracked **per stream** |
| Admin view | Shows **both** streams |
| Data Science scope | **Full curriculum — all 23 modules**, authored over delivery waves |
| Auth/allowlist | Unchanged — one login gates the whole LMS; streams are inside |

## 3. Architecture

### 3.1 Stream registry (content layer)

`window.PBI` becomes a thin **active-stream view**. content.js defines:

```
PBI.streams = { powerbi: {...}, datascience: {...} }
PBI.streamId                      // active stream id
PBI.setStream(id)                 // swaps active fields onto PBI, rebuilds lesson index
```

Each stream object carries everything subject-specific:

```
{ id, name, emoji, tagline, unifyingAnalogy,
  paths, diagnostic, analogies, modules,
  caseStudy, miniProjects,
  glossary, reference (code/dax snippets), shortcuts, flashcards, faq,
  toolkit, badges }
```

`setStream(id)` assigns the active stream's `modules/paths/diagnostic/analogies/caseStudy/
miniProjects/glossary/reference/shortcuts/flashcards/faq/toolkit/badges` onto `PBI` and
recomputes `PBI.allLessons` + `PBI.lessonById`. Cross-stream globals (`nav`, `icons`) stay
shared. This keeps most of app.js reading `PBI.modules` etc. unchanged.

### 3.2 Global uniqueness & scoped keys

To let one flat progress store hold both streams without collisions:

- **Lesson IDs are stream-prefixed:** Power BI keeps `m1l1…`; Data Science uses `ds1l1…`.
  (Power BI IDs are left as-is to preserve existing users' saved progress.)
- **Assessment / case / checklist keys are stream-scoped:** e.g. quiz key becomes
  `"<streamId>:module-<n>"`, case steps `"<streamId>:case-<i>"`, checklist
  `"<streamId>:<key>"`. app.js is updated at the few sites that build these keys.

### 3.3 Per-stream progress

`Store.overallProgress()`, `moduleProgress()`, `earnedBadges()`, `facultyReadiness()`
already derive from `PBI.allLessons` / `PBI.modules`, which point at the **active stream**
after `setStream`. So per-stream progress falls out naturally. `Store` gains:

- `Store.stream` (active id), `Store.setStream(id)` (persists last-used stream).
- Progress metrics pushed to the cloud include the stream id so the admin table can show
  each learner's progress **per stream** (a `stream` column, or one row per user+stream).

Cloud change: `progress` becomes keyed by `(user_id, stream)` instead of just `user_id`.
Schema migration provided; existing Power BI rows migrate to `stream='powerbi'`.

### 3.4 Stream picker & switcher (UI)

- **First run / no stream chosen:** a full-width **stream picker** (two big cards: Power BI,
  Data Science) after sign-in, before the app chrome.
- **Persistent switcher:** a control in the top bar (or sidebar header) showing the current
  stream with a dropdown to switch. Switching calls `PBI.setStream`, `Store.setStream`,
  re-renders nav + current route, and re-scopes progress.
- Home, My Learning, Modules, Paths, Case Studies, Assessments, Reference, Progress all read
  the active stream. The URL gains an optional stream segment or the app relies on
  `Store.stream` (kept simple: `Store.stream` drives it; deep links default to it).

### 3.5 Stream-aware views (the real refactor cost)

Two views are currently Power BI-specific and must generalize:

- **Case Study:** today it hard-codes the Sunshine dataset (₹, branches, sales bars). Refactor
  to render from `stream.caseStudy` — a generic shape (brief, questions, dataset, computed
  "evidence" panels, 12 steps, sample insights/actions). Power BI keeps its supermarket
  dashboard; Data Science renders its own evidence panels (e.g. class-balance bar, feature
  importance list, confusion-matrix grid) computed from the student dataset.
- **Reference Library:** the "DAX reference" tab becomes a generic **"Formula/Code reference"**
  driven by `stream.reference` (Power BI → DAX; Data Science → Python/pandas/scikit-learn
  snippets). Glossary, shortcuts, flashcards, FAQ already generalize as data.

### 3.6 Admin dashboard

- Add a **Stream** column; a stream filter (All / Power BI / Data Science).
- Cohort query returns per-(user,stream) rows; CSV export includes stream.

## 4. Data Science curriculum (content spec)

**Unifying analogy — the Data Detective:** raw data = clues; cleaning = organising evidence;
EDA = examining the scene; statistics = weighing reasonable doubt; a model = the theory of
whodunit; training = past solved cases; test set = a fresh case; overfitting = memorising one
case; deployment = handing the method to the whole force.

**Tooling:** Python via **Google Colab** (zero install), pandas, NumPy, matplotlib/seaborn,
scikit-learn — all free. Every lesson keeps the 10-step journey and all required elements.

### 4.1 Learning paths

| Path | For | Modules | Time |
| --- | --- | --- | --- |
| Data Explorer (Beginner) | No coding/maths confidence | 1–11 | 12–16 h |
| ML Practitioner (Intermediate) | Comfortable with data basics | 8–16 | 18–22 h |
| Faculty Mastery | Preparing to teach DS | 1–23 | 30–40 h |

A 6-question diagnostic recommends a path.

### 4.2 Modules & learning outcomes

**Phase A — Foundations**
1. **Understanding Data Science** — define DS in a sentence; name the DS workflow; explain it
   with the detective analogy.
2. **Your Toolkit (Google Colab)** — open a Colab notebook; run a cell; save work; no install.
3. **Python Foundations I** — variables, types, operators, print/input.
4. **Python Foundations II** — lists, dicts, loops, conditionals, functions.

**Phase B — Working with Data**
5. **NumPy** — create arrays; vectorised maths; why arrays beat loops.
6. **pandas I** — DataFrames; read_csv/Excel; select, filter, sort.
7. **pandas II — Cleaning** — missing values, dtypes, duplicates, `apply`/`map`.
8. **Data Visualization** — matplotlib/seaborn; choose the chart for the question.

**Phase C — Making Sense of Data**
9. **Statistics & Probability Essentials** — mean/median/spread, distributions, correlation.
10. **Exploratory Data Analysis (EDA)** — question-led exploration; outliers; grouping.
11. **Feature Engineering** — create/encode/scale features; train-ready data.

**Phase D — Machine Learning**
12. **ML Foundations** — supervised vs unsupervised; features/labels; train/test split.
13. **Regression** — linear regression; predict numbers; RMSE & R².
14. **Classification** — logistic regression, decision trees, kNN; predict categories.
15. **Model Evaluation & Trust** — overfitting; cross-validation; confusion matrix;
    precision/recall/accuracy; when accuracy lies.
16. **Unsupervised Learning** — k-means clustering; PCA for dimensionality reduction.

**Phase E — Going Further**
17. **A Gentle Intro to Deep Learning** — neuron → network; when to reach for it (concept + tiny demo).
18. **Working with Text (NLP Basics)** — tokens, bag-of-words/TF-IDF; sentiment.

**Phase F — Applied & Professional**
19. **Capstone Project** — Bright Future College student-success predictor, end-to-end.
20. **Communicating Results** — notebook → report; storytelling; avoid misleading charts.
21. **Ethics, Bias & Responsible AI** — fairness across groups, data leakage, privacy.
22. **Sharing & Deploying** — save a model (`joblib`); a simple app/API (intro).

**Phase G — Teaching**
23. **Teaching Data Science to Students** — analogies, live-coding, teach-backs, common errors.

### 4.3 Main case study — Bright Future College (Student Success Predictor)

Fictional, anonymous data (~300 students): attendance %, prior score, weekly study hours,
LMS engagement, support flags, outcome (pass/at-risk). Questions: which factors predict
success? can we flag at-risk students by week 4? is the model fair across groups? what should
support staff do? Twelve guided steps mirror the Power BI case (understand → data → clean →
EDA → features → model → evaluate → interpret → recommend → present → teach), ending in
insights + actions. Evidence panels computed live: class balance, top feature weights, a
confusion-matrix grid, accuracy/precision/recall.

**Mini-projects:** Penguins classification · House-Price regression · Customer Segmentation
(clustering) · Movie-Review sentiment (NLP).

### 4.4 Reference & badges

- **Reference:** Python/pandas/scikit-learn snippet library, DS glossary (~35 terms),
  Colab/Jupyter shortcuts, flashcards (~15), FAQ (~10).
- **Badges:** DS-specific (e.g. First Notebook, Data Wrangler, EDA Explorer, Model Builder,
  Fair & Square (ethics), Capstone Complete, Ready to Teach DS).

## 5. Delivery waves

Full content is large; ship working increments, each tested + committed:

- **Wave 1 — Architecture.** Stream registry + `setStream`, per-stream progress + scoped keys,
  stream picker + switcher, stream-aware Case Study & Reference views, admin stream column,
  cloud schema migration. Data Science stream present with **Phase A (1–4) authored**.
  End state: both streams fully switchable; PBI unchanged for existing users.
- **Wave 2 — DS Phases B–C** (modules 5–11) → completes the Beginner path.
- **Wave 3 — DS Phase D** (12–16) → completes the Intermediate path.
- **Wave 4 — DS Phases E–F** (17–22) + capstone case study + mini-projects.
- **Wave 5 — DS Phase G** (23) + DS teaching toolkit, badges, reference polish → Faculty path.

Each wave: headless-tested (routes render, 0 console errors, interactions work, per-stream
progress isolates correctly), committed, and deployed only when green.

## 6. Testing strategy

- Regression: Power BI stream unchanged (existing suite must stay green; saved progress intact).
- Multi-stream: switch streams → nav/home/modules/progress re-scope; progress in one stream
  doesn't leak into the other; quiz/case/checklist keys don't collide.
- Auth: cloud progress rows carry stream; admin table shows per-stream rows; migration keeps
  existing Power BI rows.
- Each authored module: lesson renders all 10 stages; practice grading works.

## 7. Risks

- **app.js churn** (case study + reference generalization, scoped keys) → do Wave 1 behind the
  existing suite; snapshot-test both streams before deploy.
- **Cloud schema migration** (progress keyed by user+stream) → provide idempotent SQL;
  migrate existing rows to `stream='powerbi'`.
- **Content volume** (23 modules) → waves; each is independently shippable.
- **Scope creep** (live model training in-browser) → the capstone shows *computed evidence*
  from precomputed results, not live scikit-learn in the browser (out of scope).

## 8. Out of scope

Running real Python/scikit-learn in the browser; auto-grading uploaded notebooks; more than
two streams; per-class cohorts. (Learners run code in Colab; the platform teaches, guides,
assesses conceptually, and tracks progress.)
