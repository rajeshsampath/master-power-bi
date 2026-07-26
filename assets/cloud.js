/* ============================================================
   cloud.js — Supabase data layer (window.Cloud). No DOM here.
   Handles: client init, Google OAuth, allowlist check, profile,
   progress push/pull, and admin queries. Degrades gracefully when
   not configured or offline.
   ============================================================ */
(function () {
"use strict";

const cfg = window.PBI_CONFIG || {};
const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
const ACCESS_FLAG = "pbi_access_granted_v1"; // cached per-email for offline re-entry

let sb = null;         // supabase client
let user = null;       // current auth user
let role = "faculty";  // 'faculty' | 'admin'

function makeClient(){
  if (!configured) return null;
  if (!window.supabase || !window.supabase.createClient) return null;
  try {
    return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  } catch (e) { return null; }
}

const Cloud = {
  configured,
  get enabled(){ return !!sb; },
  get user(){ return user; },
  get role(){ return role; },
  isAdmin(){ return role === "admin"; },
  orgName: cfg.ORG_NAME || "your institution",

  /* Create client and restore any existing session. Returns {session} or {session:null}. */
  async init(){
    sb = makeClient();
    if (!sb) return { session:null, ready:false };
    try {
      const { data } = await sb.auth.getSession();
      user = data && data.session ? data.session.user : null;
      return { session: data ? data.session : null, ready:true };
    } catch (e) {
      return { session:null, ready:false, error:e };
    }
  },

  onAuth(cb){
    if (!sb) return;
    sb.auth.onAuthStateChange((_evt, session) => {
      user = session ? session.user : null;
      cb(_evt, session);
    });
  },

  async signInWithGoogle(){
    if (!sb) throw new Error("Sign-in isn't configured.");
    const redirectTo = location.origin + location.pathname; // strip hash/query
    return sb.auth.signInWithOAuth({ provider:"google", options:{ redirectTo } });
  },

  async signOut(){
    try { localStorage.removeItem(ACCESS_FLAG); } catch(e){}
    if (sb) { try { await sb.auth.signOut(); } catch(e){} }
    user = null; role = "faculty";
  },

  email(){ return user && (user.email || (user.user_metadata && user.user_metadata.email)) || ""; },
  displayName(){
    const m = user && user.user_metadata || {};
    return m.full_name || m.name || (this.email().split("@")[0]) || "Learner";
  },
  avatarUrl(){ const m = user && user.user_metadata || {}; return m.avatar_url || m.picture || ""; },

  /* Is the signed-in user allowed in? Checks admin role + allowlist.
     Falls back to a cached grant when offline. Returns {allowed, role, offline}. */
  async checkAccess(){
    const email = (this.email() || "").toLowerCase();
    if (!email) return { allowed:false, role:"faculty" };
    if (!sb) { // offline / not configured
      const cached = safeGet(ACCESS_FLAG);
      return { allowed: cached === email, role:"faculty", offline:true };
    }
    try {
      // ensure a profile row exists (also returns role)
      await this.ensureProfile();
      const prof = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
      role = (prof.data && prof.data.role) || "faculty";
      if (role === "admin") { cacheGrant(email); return { allowed:true, role }; }
      const al = await sb.from("allowed_faculty").select("email").eq("email", email).maybeSingle();
      const allowed = !!(al.data && al.data.email);
      if (allowed) cacheGrant(email); else safeDel(ACCESS_FLAG);
      return { allowed, role };
    } catch (e) {
      // network error → fall back to cached grant so approved users keep working
      const cached = safeGet(ACCESS_FLAG);
      return { allowed: cached === email, role, offline:true, error:e };
    }
  },

  async ensureProfile(){
    if (!sb || !user) return;
    const payload = { id:user.id, email:(this.email()||"").toLowerCase(), full_name:this.displayName(), last_seen:new Date().toISOString() };
    try { await sb.from("profiles").upsert(payload, { onConflict:"id" }); } catch(e){}
  },

  /* progress ------------------------------------------------ */
  async pullState(){
    if (!sb || !user) return null;
    try {
      const { data } = await sb.from("progress").select("state").eq("user_id", user.id).maybeSingle();
      return data ? data.state : null;
    } catch(e){ return null; }
  },

  async pushState(stateBlob, metrics){
    if (!sb || !user) return { ok:false, offline:true };
    const row = Object.assign({
      user_id:user.id, state:stateBlob, updated_at:new Date().toISOString()
    }, metrics || {});
    try { const { error } = await sb.from("progress").upsert(row, { onConflict:"user_id" });
      return { ok:!error, error }; }
    catch(e){ return { ok:false, error:e, offline:true }; }
  },

  /* admin --------------------------------------------------- */
  async listCohort(){
    if (!sb) return [];
    // join-ish: read profiles + their progress metrics
    const profs = await sb.from("profiles").select("id,email,full_name,role,last_seen").order("full_name");
    const prog  = await sb.from("progress").select("user_id,pct,lessons_done,avg_quiz,readiness,streak,updated_at");
    const pm = {}; (prog.data||[]).forEach(r=>pm[r.user_id]=r);
    return (profs.data||[]).map(p=>Object.assign({
      id:p.id, email:p.email, name:p.full_name||p.email, role:p.role, last_seen:p.last_seen,
      pct:0, lessons_done:0, avg_quiz:0, readiness:0, streak:0, updated_at:null
    }, pm[p.id]||{}));
  },
  async listAllowed(){
    if (!sb) return [];
    const { data } = await sb.from("allowed_faculty").select("email,added_at").order("added_at",{ascending:false});
    return data || [];
  },
  async addAllowed(email){
    if (!sb) throw new Error("Not connected.");
    const e = (email||"").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error("That doesn't look like an email address.");
    const { error } = await sb.from("allowed_faculty").upsert({ email:e }, { onConflict:"email" });
    if (error) throw error; return e;
  },
  async removeAllowed(email){
    if (!sb) throw new Error("Not connected.");
    const { error } = await sb.from("allowed_faculty").delete().eq("email",(email||"").toLowerCase());
    if (error) throw error;
  }
};

function cacheGrant(email){ safeSet(ACCESS_FLAG, email); }
function safeGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function safeSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function safeDel(k){ try{ localStorage.removeItem(k); }catch(e){} }

window.Cloud = Cloud;
})();
