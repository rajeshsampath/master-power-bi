# Setup: faculty login + progress tracking (free)

This connects the app to a free **Supabase** project so that:

- only **approved faculty** can sign in (Google) and learn,
- each person's progress is saved to the cloud and follows them across devices,
- **you (admin)** see everyone's progress in an in-app dashboard.

It takes about **15 minutes**, once. Until you finish, the app keeps working in
**local mode** (no login, progress saved only in the browser).

> You'll need: a Google account, and your published site URL
> (`https://rajeshsampath.github.io/master-power-bi/`).

---

## 1. Create a free Supabase project

1. Go to <https://supabase.com> → **Start your project** → sign in.
2. **New project.** Pick any name (e.g. `master-power-bi`), set a database password
   (save it somewhere), choose the nearest region, and create it. Wait ~2 minutes.

## 2. Create the database tables & security

1. In your project, open **SQL Editor** → **New query**.
2. Open [`docs/supabase-schema.sql`](supabase-schema.sql) from this repo, copy **all**
   of it, paste into the editor, and click **Run**. You should see "Success".
   (This creates the tables, row-level security, and anti-tampering rules. Don't run the
   commented-out admin seed at the bottom yet.)

## 3. Turn on Google sign-in

1. In Supabase: **Authentication → Providers → Google → Enable**. Leave this tab open —
   you'll paste a Client ID/secret here in a moment. Note the **callback URL** it shows
   (looks like `https://<your-project>.supabase.co/auth/v1/callback`).
2. In a new tab, open **Google Cloud Console** → <https://console.cloud.google.com>:
   - Create (or pick) a project.
   - **APIs & Services → OAuth consent screen** → choose **External** → fill the app name
     and your email → save. (You can leave it in "Testing" and add faculty as test users,
     or Publish it.)
   - **APIs & Services → Credentials → Create credentials → OAuth client ID** →
     **Web application**.
   - Under **Authorized redirect URIs**, add the Supabase **callback URL** from step 3.1.
   - Under **Authorized JavaScript origins**, add your site origin:
     `https://rajeshsampath.github.io`
   - Create it, then copy the **Client ID** and **Client secret**.
3. Back in the Supabase Google provider tab: paste the **Client ID** and **Client secret**,
   and **Save**.

## 4. Connect the app to Supabase

1. In Supabase: **Project Settings → API**. Copy the **Project URL** and the
   **`anon` `public`** key.
2. In this repo, edit [`assets/config.js`](../assets/config.js) and paste them in:

   ```js
   window.PBI_CONFIG = {
     SUPABASE_URL:      "https://YOUR-PROJECT.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...your anon key...",
     ORG_NAME: "Your College Name"
   };
   ```

   > The anon key is **public and safe to commit** — the database is protected by the
   > row-level security you ran in step 2, not by hiding this key.
3. Commit and push. GitHub Pages redeploys in ~1 minute. The site now shows a
   **sign-in screen**.

## 5. Make yourself the admin

1. Open the site and **sign in with Google once** (you'll see "not on the access list" —
   that's expected).
2. In Supabase **SQL Editor**, run these two lines with **your** Google email:

   ```sql
   insert into public.allowed_faculty(email) values ('you@example.com') on conflict do nothing;
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Refresh the site. You're in, and an **Admin** item appears in the left menu.

## 6. Add your faculty

- In the app, open **Admin → Approved faculty allowlist**, type each faculty email, and
  **Add**. (If your Google consent screen is still in "Testing", also add them as *test
  users* in Google Cloud, or publish the consent screen.)
- Share the site link. Approved faculty sign in with Google and start learning; their
  progress appears on your Admin dashboard automatically.

---

## Notes & troubleshooting

- **"redirect_uri_mismatch"** → the redirect URI in Google Cloud must exactly match the
  Supabase callback URL from step 3.1.
- **Signed in but "not on the access list"** → the email isn't on the allowlist. Add it in
  Admin (or via SQL) and sign in again.
- **Free project pauses after ~7 days idle** → it resumes automatically on the next visit
  (first load may be slow).
- **Privacy** → each learner's progress is visible only to themselves and to admins, enforced
  by the database. Faculty cannot see each other's data.
- **Going back to local mode** → blank out the two values in `config.js` and push; the app
  reverts to no-login, browser-only progress.
