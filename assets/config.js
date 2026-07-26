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
  SUPABASE_URL:      "https://mvymkhlzwgeqfubenuof.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eW1raGx6d2dlcWZ1YmVudW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjU0MDMsImV4cCI6MjEwMDY0MTQwM30.NeI4fw1RCc1cmJ3aDtZQsML2amapg9CmebnR7imZgFY",

  // Cosmetic only: shown on the sign-in screen.
  ORG_NAME: "boomtechlms"
};
