/* ============================================================
   config.js — Supabase connection for faculty auth + tracking.

   These values are PUBLIC and safe to commit. Security is enforced
   by Row-Level Security in the database, not by hiding this key.

   HOW TO FILL THIS IN  (see docs/SETUP-SUPABASE.md for full steps):
     1. Create a free project at https://supabase.com
     2. Project Settings ▸ API ▸ copy the Project URL and the
        "anon / public" key into the two fields below.
     3. Commit & push. That's it.

   Until both fields are filled, the app runs in LOCAL MODE:
   no login, progress saved only in this browser (original behaviour).
   ============================================================ */
window.PBI_CONFIG = {
  SUPABASE_URL:      "",   // e.g. "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "",   // the long "anon public" key

  // Cosmetic only: shown on the sign-in screen.
  ORG_NAME: "your institution"
};
