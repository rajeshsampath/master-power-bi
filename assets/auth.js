/* ============================================================
   auth.js — boot orchestration + sign-in gate + account menu +
   cloud-sync bridge (window.Auth). Loaded LAST.

   - Not configured  -> local mode (original behaviour, no login).
   - Configured      -> the whole app is gated behind Google sign-in
                        and an approved-email allowlist.
   ============================================================ */
(function () {
"use strict";
const OWNER_KEY = "pbi_owner_v1";
let bootedApp = false, resolving = false, pushTimer = null;
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- gate overlay ---------- */
function gateEl(){
  let g = document.getElementById("authGate");
  if(!g){ g = document.createElement("div"); g.id = "authGate"; document.body.appendChild(g); }
  return g;
}
function hideGate(){ const g = document.getElementById("authGate"); if(g) g.remove(); }

function brandMark(){
  return `<span class="gate-mark"><svg viewBox="0 0 32 32"><rect x="4" y="17" width="5" height="11" rx="1.5"/><rect x="13" y="10" width="5" height="18" rx="1.5"/><rect x="22" y="5" width="5" height="23" rx="1.5"/></svg></span>`;
}
function googleIcon(){
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 2.9 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.7H12z"/><path fill="#34A853" d="M3.9 7.6l3.2 2.3C8 8.1 9.8 6.9 12 6.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 4.3 14.7 3.4 12 3.4 8.4 3.4 5.3 5.1 3.9 7.6z" opacity="0"/></svg>`;
}
function showGate(kind, msg){
  const g = gateEl();
  let body = "";
  if(kind==="loading"){
    body = `<div class="gate-spin" aria-hidden="true"></div><p class="gate-sub">${esc(msg||"Loading…")}</p>`;
  } else if(kind==="signin"){
    body = `<h1>Welcome — let's learn Power BI</h1>
      <p class="gate-sub">Sign in to start. Access is limited to approved faculty at ${esc(Cloud.orgName)}.</p>
      <button class="gate-btn" id="gateSignIn">${googleIcon()} Continue with Google</button>
      <p class="gate-fine">Your progress saves to your cohort so your instructor can support you.</p>`;
  } else if(kind==="denied"){
    body = `<h1>You're not on the access list yet</h1>
      <p class="gate-sub">The email <strong>${esc(Cloud.email())}</strong> isn't approved. Ask your instructor to add you, then sign in again.</p>
      <button class="gate-btn ghost" id="gateSignOut">Sign out</button>`;
  } else if(kind==="offline"){
    body = `<h1>You're offline</h1>
      <p class="gate-sub">You need to be online the first time you sign in. Reconnect and refresh.</p>
      <button class="gate-btn ghost" id="gateRetry">Try again</button>`;
  } else { // error
    body = `<h1>Sign-in hit a snag</h1>
      <p class="gate-sub">${esc(msg||"Something went wrong.")}</p>
      <button class="gate-btn ghost" id="gateRetry">Try again</button>`;
  }
  g.innerHTML = `<div class="gate-card">${brandMark()}<div class="gate-title-row">Master Power BI</div>${body}</div>`;
  const on=(id,fn)=>{ const b=document.getElementById(id); if(b) b.onclick=fn; };
  on("gateSignIn", async ()=>{ try{ showGate("loading","Redirecting to Google…"); await Cloud.signInWithGoogle(); }
    catch(e){ showGate("error", e.message); } });
  on("gateSignOut", async ()=>{ await Cloud.signOut(); showGate("signin"); });
  on("gateRetry", ()=>Auth.start());
}

/* ---------- account chip in topbar ---------- */
function injectAccountChip(){
  const tools = document.querySelector(".topbar-tools");
  if(!tools || document.getElementById("acctWrap")) return;
  const wrap = document.createElement("div");
  wrap.id = "acctWrap"; wrap.className = "acct-wrap";
  const av = Cloud.avatarUrl();
  wrap.innerHTML = `<button class="acct-btn" id="acctBtn" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu">
      ${av? `<img src="${esc(av)}" alt="" class="acct-av" referrerpolicy="no-referrer">` : `<span class="acct-av acct-initial">${esc((Cloud.displayName()[0]||"U").toUpperCase())}</span>`}
    </button>
    <div class="acct-menu" id="acctMenu" role="menu" hidden>
      <div class="acct-head"><b>${esc(Cloud.displayName())}</b><span>${esc(Cloud.email())}</span>${Cloud.isAdmin()?'<span class="tag purple" style="margin-top:6px">Admin</span>':''}</div>
      ${Cloud.isAdmin()?'<a role="menuitem" href="#/admin" class="acct-item">Instructor dashboard</a>':''}
      <button role="menuitem" class="acct-item" id="acctSignOut">Sign out</button>
    </div>`;
  tools.insertBefore(wrap, tools.firstChild);
  const btn=document.getElementById("acctBtn"), menu=document.getElementById("acctMenu");
  const close=()=>{ menu.hidden=true; btn.setAttribute("aria-expanded","false"); };
  btn.onclick=e=>{ e.stopPropagation(); const open=menu.hidden; menu.hidden=!open; btn.setAttribute("aria-expanded",String(open)); };
  document.addEventListener("click",e=>{ if(!wrap.contains(e.target)) close(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
  menu.addEventListener("click",e=>{ if(e.target.closest("a")) close(); });
  document.getElementById("acctSignOut").onclick=async ()=>{
    close(); showGate("loading","Signing out…");
    await Cloud.signOut(); Store.onSave(()=>{}); showGate("signin");
  };
}

/* ---------- cloud sync ---------- */
function schedulePush(now){
  clearTimeout(pushTimer);
  const doPush=async ()=>{ try{ await Cloud.pushState(Store.exportState(), Store.computeMetrics()); }catch(e){} };
  if(now) doPush(); else pushTimer=setTimeout(doPush, 1500);
}

async function onSignedIn(){
  if(resolving) return; resolving = true;
  showGate("loading","Checking your access…");
  let access;
  try{ access = await Cloud.checkAccess(); }
  catch(e){ access = { allowed:false }; }
  if(!access.allowed){ resolving=false; showGate("denied"); return; }

  // Guard against two people sharing one browser: if the local cache
  // belongs to a different user, wipe it (keeping device display prefs)
  // before loading this user's cloud data.
  const email = (Cloud.email()||"").toLowerCase();
  let owner=null; try{ owner=localStorage.getItem(OWNER_KEY); }catch(e){}
  if(owner && owner!==email){
    const keep = Object.assign({}, Store.get().settings);
    Store.reset();
    ["theme","text","motion"].forEach(k=> Store.setSetting(k, keep[k]));
  }
  try{ localStorage.setItem(OWNER_KEY, email); }catch(e){}

  // pull remote, merge (no data loss), then push the merged result up.
  try{ const remote = await Cloud.pullState(); if(remote) Store.mergeRemote(remote); }catch(e){}
  Store.onSave(()=>schedulePush());
  schedulePush(true);

  hideGate();
  injectAccountChip();
  const foot = document.querySelector(".site-foot p");
  if(foot) foot.textContent = "Signed in as "+Cloud.displayName()+". Your progress syncs to your cohort so your instructor can support you.";
  if(!bootedApp){ App.init(); bootedApp=true; }
  else { App.renderNav(); App.router(); }
  resolving = false;
}

const Auth = {
  async start(){
    // LOCAL MODE — Supabase not configured yet: run exactly as before.
    if(!window.Cloud || !Cloud.configured){ App.init(); return; }

    showGate("loading","Starting up…");
    let res;
    try{ res = await Cloud.init(); }catch(e){ res = { session:null, ready:false }; }

    if(!Cloud.enabled){ showGate("offline"); return; }

    // React to OAuth redirect completing / future sign-out.
    Cloud.onAuth((evt, session)=>{
      if(session && !bootedApp) onSignedIn();
      else if(!session && bootedApp){ /* signed out elsewhere */ showGate("signin"); }
    });

    if(res.session) onSignedIn();
    else showGate("signin");
  }
};

window.Auth = Auth;
})();
