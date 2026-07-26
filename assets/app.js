/* ============================================================
   app.js — router, views, and all interactive components.
   ============================================================ */
(function () {
"use strict";
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const view = $("#view");
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`(.+?)`/g,"<code>$1</code>");
const pre = s => "<pre class='code'>"+esc(s)+"</pre>";
const money = n => "₹"+Math.round(n).toLocaleString("en-IN");
const kfmt = n => n>=1e6? (n/1e6).toFixed(2)+"M" : n>=1e3? (n/1e3).toFixed(1)+"k" : Math.round(n);

/* ---------- toast ---------- */
function toast(msg, kind="ok"){
  const w=$("#toastWrap"); const t=document.createElement("div"); t.className="toast";
  const ic = kind==="ok" ? "M20 6L9 17l-5-5" : "M12 8v5M12 16h.01";
  t.innerHTML="<svg class='t-ico' viewBox='0 0 24 24' fill='none' stroke='"+(kind==="ok"?"#7CE28A":"#FFD84D")+"' stroke-width='2.5' stroke-linecap='round'><path d='"+ic+"'/></svg>"+esc(msg);
  w.appendChild(t); setTimeout(()=>{ t.style.opacity="0"; t.style.transform="translateY(10px)"; setTimeout(()=>t.remove(),300); }, 2600);
}

/* ============================================================ NAV */
function renderNav(){
  const cur = (location.hash||"#/home").split("/")[1];
  const items = PBI.nav.slice();
  if(window.Cloud && Cloud.enabled && Cloud.isAdmin())
    items.push({ id:"admin", label:"Admin", icon:"trophy" });
  $("#navList").innerHTML = items.map(n=>{
    const active = (n.id===cur) || (cur==="module"&&n.id==="modules") || (cur==="lesson"&&n.id==="modules") || (cur==="case"&&n.id==="cases");
    return `<li><a href="#/${n.id}" class="${active?"active":""}">
      <svg class="nav-ico" viewBox="0 0 24 24"><path d="${PBI.icons[n.icon]}"/></svg>${esc(n.label)}</a></li>`;
  }).join("");
  const p=Store.overallProgress();
  $("#navProgress").innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700"><span>Your progress</span><span>${p.pct}%</span></div>
    <div class="bar" style="margin:8px 0"><i style="width:${p.pct}%"></i></div>
    <div class="muted">${p.done} of ${p.total} lessons · 🔥 ${Store.get().streak.count}-day streak</div>`;
}

/* ============================================================ ROUTER */
const routes = {};
function route(path, fn){ routes[path]=fn; }

function router(){
  const hash = location.hash || "#/home";
  const parts = hash.replace(/^#\//,"").split("/");
  const key = parts[0]||"home";
  window.scrollTo(0,0);
  view.classList.add("fade");
  const fn = routes[key] || routes.home;
  try { fn(parts.slice(1)); }
  catch(e){ view.innerHTML = errorState(e); }
  renderNav();
  // assistant context
  if(key==="lesson") Assistant.setContext("lesson", parts[1]);
  else Assistant.setContext(key);
  closeNavDrawer();
}
window.addEventListener("hashchange", router);

function errorState(e){
  return `<div class="empty"><div class="e-emoji">🧩</div><h2>Something didn't load</h2>
    <p class="muted">This page hit a snag: ${esc(e&&e.message||"unknown")}. Your progress is safe.</p>
    <a class="btn btn-primary" href="#/home">Back to Home</a></div>`;
}
function crumbs(items){
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it,i)=>
    i<items.length-1 ? `<a href="${it[1]}">${esc(it[0])}</a><span>›</span>` : `<span aria-current="page" style="color:var(--ink-3)">${esc(it[0])}</span>`
  ).join("")}</nav>`;
}

/* ============================================================ HOME */
route("home", ()=>{
  const p=Store.overallProgress();
  const last = Store.get().lastLesson ? PBI.lessonById[Store.get().lastLesson] : null;
  const nextLesson = firstIncompleteLesson();
  const path = Store.get().path ? PBI.paths[Store.get().path] : null;
  const nextMilestone = milestone();

  // mini live bars from dataset
  const byBranch = aggregate("Branch","Sales"); const max=Math.max(...byBranch.map(x=>x.v));
  const bars = byBranch.map(b=>`<i style="height:${Math.round(b.v/max*100)}%">${b.v?`<span>${b.k.slice(0,3)}</span>`:""}</i>`).join("");

  view.innerHTML = `
  <section class="hero">
    <div class="hero-grid">
      <div>
        <span class="eyebrow">Self-paced · offline · yours</span>
        <h1>Go from <span class="hl">zero</span> to confidently <span class="hl">teaching</span> Power BI.</h1>
        <p class="hero-lead">A complete toolkit: learn a concept, watch it, do it, get checked, reflect, apply it to a real supermarket, then teach it to someone else.</p>
        <div class="hero-cta">
          ${p.done>0
            ? `<a class="btn btn-primary" href="#/lesson/${(last||nextLesson).id}">▶ Continue learning</a>
               <a class="btn btn-ghost" href="#/paths">Change path</a>`
            : `<a class="btn btn-primary" href="#/paths">Start learning</a>
               <a class="btn btn-ghost" href="#/modules">Browse modules</a>`}
        </div>
        <div class="hero-stats">
          <div><b>12</b><span>modules</span></div>
          <div><b>${PBI.allLessons.length}</b><span>full lessons</span></div>
          <div><b>${p.pct}%</b><span>you've completed</span></div>
          <div><b>3</b><span>learning paths</span></div>
        </div>
      </div>
      <div class="hero-panel" aria-label="Example dashboard preview">
        <div class="hp-head"><span>Sunshine Supermarket · Sales by branch</span><span class="hp-dot" aria-hidden="true"></span></div>
        <div class="mini-bars" role="img" aria-label="Bar chart preview of sales by branch">${bars}</div>
        <div class="hp-kpis">
          <div><b>${money(sum("Sales"))}</b><span>Total sales</span></div>
          <div><b>${money(sum("Profit"))}</b><span>Total profit</span></div>
          <div><b>${Math.round(sum("Profit")/sum("Sales")*100)}%</b><span>Margin</span></div>
        </div>
      </div>
    </div>
  </section>

  <div class="grid cols-4" style="margin-bottom:8px">
    ${answerCard("📚","What will I learn?","Import, clean, model, DAX, dashboards, insights — then how to teach it.","#/modules","See modules")}
    ${answerCard("🧭","Where should I begin?","Take a 2-minute diagnostic and get a recommended path.","#/paths","Find my path")}
    ${answerCard("⏱️","How long will it take?",(path?path.hours:"6–15 hours")+" total, fully self-paced.","#/paths","Choose pace")}
    ${answerCard("✅","What have I done?",p.done+" of "+p.total+" lessons · "+p.pct+"% complete.","#/progress","View progress")}
  </div>

  <div class="grid cols-2">
    <div class="card">
      <span class="eyebrow">Do this next</span>
      <h3 style="margin-bottom:6px">${nextLesson? esc(nextLesson.t) : "You've completed everything 🎉"}</h3>
      <p class="muted">${nextLesson? "Module "+nextLesson.m+" · ~"+nextLesson.min+" min" : "Try a case study or the teaching toolkit."}</p>
      <a class="btn btn-primary btn-sm" href="${nextLesson?("#/lesson/"+nextLesson.id):"#/cases"}">${nextLesson?"Start this lesson":"Open case studies"}</a>
    </div>
    <div class="card">
      <span class="eyebrow">Upcoming milestone</span>
      <h3 style="margin-bottom:6px">${esc(nextMilestone.title)}</h3>
      <p class="muted">${esc(nextMilestone.detail)}</p>
      <div class="bar" style="margin-bottom:6px"><i style="width:${nextMilestone.pct}%"></i></div>
      <small class="muted">${nextMilestone.pct}% there</small>
    </div>
  </div>

  ${Store.get().recent.length ? `
  <div class="sec-head"><div><h2>Recently opened</h2><p>Jump back into where you were.</p></div></div>
  <div class="grid cols-3">${Store.get().recent.map(id=>{ const l=PBI.lessonById[id]; return l? lessonMiniCard(l):""; }).join("")}</div>`:""}

  <div class="sec-head"><div><h2>The 10-step learning journey</h2><p>Every lesson walks the same path, so you always know what's next.</p></div></div>
  <div class="card"><div class="pill-row">${JOURNEY.map((j,i)=>`<span class="tag ${i<3?"yellow":i<7?"blue":"green"}">${i+1}. ${j.label}</span>`).join("")}</div>
    <p class="muted" style="margin-top:12px">Discover → Watch → Follow → Practise → Check → Understand → Reflect → Apply → Teach → Review.</p></div>`;
});
function answerCard(emoji,q,a,href,cta){
  return `<a class="card module-card" href="${href}" style="text-decoration:none">
    <div style="font-size:1.8em">${emoji}</div><h3 style="font-size:1.05em;margin:0">${esc(q)}</h3>
    <p class="muted" style="font-size:.9em;margin:0">${esc(a)}</p>
    <span class="tag yellow" style="align-self:flex-start;margin-top:auto">${esc(cta)} →</span></a>`;
}
function lessonMiniCard(l){
  const done=Store.isDone(l.id);
  return `<a class="lesson-row ${done?"done":""}" href="#/lesson/${l.id}">
    <span class="lr-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
    <span class="lr-main"><b>${esc(l.t)}</b><span class="lr-meta">Module ${l.m} · ${l.min} min</span></span></a>`;
}
function milestone(){
  for(const m of PBI.modules){ const pr=Store.moduleProgress(m.n); if(pr.pct<100)
    return { title:"Finish “"+m.title+"”", detail:pr.done+" of "+pr.total+" lessons done in this module.", pct:pr.pct }; }
  return { title:"Publish the Sunshine dashboard", detail:"You've finished the modules — complete the case study.", pct:Math.round(Object.values(Store.get().caseSteps).filter(Boolean).length/12*100) };
}
function firstIncompleteLesson(){ return PBI.allLessons.find(l=>!Store.isDone(l.id)) || null; }

/* ============================================================ MY LEARNING */
route("learning", ()=>{
  const p=Store.overallProgress(); const s=Store.get();
  const bookmarks=s.bookmarks.map(id=>PBI.lessonById[id]).filter(Boolean);
  view.innerHTML = crumbs([["Home","#/home"],["My Learning"]]) + `
  <div class="sec-head"><div><h1>My Learning</h1><p>Your personal dashboard — progress, streak, bookmarks and notes.</p></div>
    <a class="btn btn-primary" href="${(s.lastLesson?("#/lesson/"+s.lastLesson):(firstIncompleteLesson()?"#/lesson/"+firstIncompleteLesson().id:"#/cases"))}">▶ Resume</a></div>

  <div class="grid cols-3">
    <div class="card center"><div class="ring-wrap"><div class="ring" style="--p:${p.pct}"><b>${p.pct}%</b><span>complete</span></div></div>
      <p class="muted" style="margin-top:12px">${p.done} of ${p.total} lessons</p></div>
    <div class="card"><span class="eyebrow">Streak & activity</span>
      <div style="font-size:2em;font-weight:800">🔥 ${s.streak.count} day${s.streak.count===1?"":"s"}</div>
      <p class="muted">Keep it alive — one lesson a day. Longest recent: ${s.streak.count}.</p>
      <div class="bar"><i style="width:${Math.min(100,s.streak.count/7*100)}%"></i></div>
      <small class="muted">Goal: 7-day streak</small></div>
    <div class="card"><span class="eyebrow">Faculty readiness</span>
      <div style="font-size:2em;font-weight:800">${Store.facultyReadiness()}<span style="font-size:.4em;color:var(--ink-3)"> / 100</span></div>
      <p class="muted">Blends progress, quizzes, teach-backs & case work.</p>
      <a class="linklike" href="#/progress">See your improvement plan →</a></div>
  </div>

  <div class="sec-head"><div><h2>Course roadmap</h2><p>Where you are across all 12 modules.</p></div><a class="linklike" href="#/modules">Open modules →</a></div>
  <div class="grid cols-3">${PBI.modules.map(m=>{ const pr=Store.moduleProgress(m.n);
    return `<a class="card module-card" href="#/module/${m.n}" style="text-decoration:none">
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:1.6em">${m.emoji}</span><span class="tag ${pr.pct===100?"green":pr.pct>0?"yellow":""}">${pr.pct===100?"Done":pr.pct>0?pr.pct+"%":"Not started"}</span></div>
      <div class="module-num">MODULE ${m.n}</div><h3 style="font-size:1.02em;margin:0">${esc(m.title)}</h3>
      <div class="bar" style="margin-top:auto"><i style="width:${pr.pct}%"></i></div></a>`; }).join("")}</div>

  <div class="grid cols-2" style="margin-top:22px">
    <div class="card"><span class="eyebrow">🔖 Bookmarks</span>
      ${bookmarks.length? bookmarks.map(lessonMiniCard).join("") : emptyInline("📑","No bookmarks yet","Bookmark any lesson with the ☆ button to pin it here.")}</div>
    <div class="card"><span class="eyebrow">🗒️ Recent notes</span>
      ${notesList()}</div>
  </div>

  <div class="card" style="margin-top:22px"><span class="eyebrow">📋 Personal learning checklist</span>
    <p class="muted" style="margin-top:0">Tick the habits that make self-learning stick.</p>
    ${CHECKLIST.map((c,i)=>`<label class="opt" style="margin-bottom:6px"><input type="checkbox" data-chk="${i}" ${s.checklist[i]?"checked":""}> <span>${esc(c)}</span></label>`).join("")}</div>`;

  $$("[data-chk]").forEach(cb=>cb.addEventListener("change",e=>{ Store.setCheck(e.target.dataset.chk, e.target.checked); }));
});
function notesList(){
  const s=Store.get(); const ids=Object.keys(s.notes).filter(id=>s.notes[id]&&s.notes[id].trim());
  if(!ids.length) return emptyInline("✍️","No notes yet","Write a private note inside any lesson's Reflect step.");
  return ids.slice(0,5).map(id=>{ const l=PBI.lessonById[id]; if(!l) return "";
    return `<a class="lesson-row" href="#/lesson/${id}" style="margin-bottom:6px"><span class="lr-main"><b>${esc(l.t)}</b><span class="lr-meta">${esc(s.notes[id].slice(0,80))}${s.notes[id].length>80?"…":""}</span></span></a>`; }).join("");
}
function emptyInline(emoji,title,sub){ return `<div class="empty" style="padding:24px 10px"><div class="e-emoji">${emoji}</div><strong>${esc(title)}</strong><p class="muted" style="margin:.3em 0 0">${esc(sub)}</p></div>`; }

/* ============================================================ LEARNING PATHS + DIAGNOSTIC */
route("paths", (a)=>{
  if(a[0]==="diagnostic") return renderDiagnostic();
  const cur=Store.get().path;
  view.innerHTML = crumbs([["Home","#/home"],["Learning Paths"]]) + `
  <div class="sec-head"><div><h1>Choose your learning path</h1><p>Not sure? Take the 2-minute diagnostic and we'll recommend one.</p></div>
    <a class="btn btn-primary" href="#/paths/diagnostic">🧭 Take the diagnostic</a></div>
  ${Store.get().diagnostic ? `<div class="callout good" style="margin-bottom:18px">Based on your diagnostic, we recommend the <strong>${esc(PBI.paths[Store.get().diagnostic.recommended].name)}</strong> path. You can still pick any path below.</div>`:""}
  <div class="grid cols-3">${Object.values(PBI.paths).map(pth=>`
    <div class="card module-card ${cur===pth.id?"":""}" style="${cur===pth.id?"border-color:var(--yellow);box-shadow:0 0 0 2px var(--yellow-soft)":""}">
      <div style="font-size:2.2em">${pth.emoji}</div>
      <h3>${esc(pth.name)} path ${cur===pth.id?'<span class="tag yellow">Current</span>':""}</h3>
      <p class="muted" style="margin:0">${esc(pth.tagline)}</p>
      <p style="font-size:.9em"><strong>For you if:</strong> ${esc(pth.forWho)}</p>
      <div class="pill-row"><span class="tag">⏱️ ${esc(pth.hours)}</span><span class="tag">${pth.modules.length} modules</span></div>
      <p style="font-size:.88em;color:var(--ink-2)">🎯 ${esc(pth.promise)}</p>
      <button class="btn ${cur===pth.id?"btn-ghost":"btn-primary"} btn-sm" data-path="${pth.id}" style="margin-top:auto">${cur===pth.id?"Selected":"Choose this path"}</button>
    </div>`).join("")}</div>
  <div class="card" style="margin-top:22px"><span class="eyebrow">What's inside each path</span>
    <div class="table-scroll"><table class="tbl"><thead><tr><th>Module</th><th>Beginner</th><th>Intermediate</th><th>Faculty</th></tr></thead><tbody>
    ${PBI.modules.map(m=>`<tr><td>${m.n}. ${esc(m.title)}</td>
      <td>${PBI.paths.beginner.modules.includes(m.n)?"✓":"—"}</td>
      <td>${PBI.paths.intermediate.modules.includes(m.n)?"✓":"—"}</td>
      <td>${PBI.paths.faculty.modules.includes(m.n)?"✓":"—"}</td></tr>`).join("")}
    </tbody></table></div></div>`;
  $$("[data-path]").forEach(b=>b.addEventListener("click",()=>{ Store.setPath(b.dataset.path); toast("Path set: "+PBI.paths[b.dataset.path].name); router(); }));
});

function renderDiagnostic(){
  let i=0, scores={beginner:0,intermediate:0,faculty:0};
  const wrap=()=>{ const q=PBI.diagnostic[i];
    view.innerHTML = crumbs([["Home","#/home"],["Learning Paths","#/paths"],["Diagnostic"]]) + `
    <div class="card" style="max-width:720px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="eyebrow">Diagnostic · Question ${i+1} of ${PBI.diagnostic.length}</span><span class="tag">2 min</span></div>
      <div class="bar" style="margin-bottom:18px"><i style="width:${(i)/PBI.diagnostic.length*100}%"></i></div>
      <h2 style="font-size:1.3em">${esc(q.q)}</h2>
      <div id="dOpts">${q.a.map((o,oi)=>`<button class="opt" data-o="${oi}" style="width:100%;text-align:left">${esc(o.t)}</button>`).join("")}</div>
    </div>`;
    $$("#dOpts .opt").forEach(b=>b.addEventListener("click",()=>{
      const sc=q.a[+b.dataset.o].s; for(const k in sc) scores[k]=(scores[k]||0)+sc[k];
      i++; if(i<PBI.diagnostic.length) wrap(); else finish();
    }));
  };
  const finish=()=>{
    const recommended = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
    Store.setDiagnostic({ scores, recommended, date:new Date().toISOString() });
    const pth=PBI.paths[recommended];
    view.innerHTML = crumbs([["Home","#/home"],["Learning Paths","#/paths"],["Diagnostic"]]) + `
    <div class="card center" style="max-width:640px;margin:0 auto">
      <div style="font-size:3em">${pth.emoji}</div>
      <span class="eyebrow" style="justify-content:center">Your recommended path</span>
      <h1>${esc(pth.name)}</h1>
      <p class="muted">${esc(pth.tagline)}</p>
      <p>🎯 ${esc(pth.promise)}</p>
      <div class="pill-row" style="justify-content:center;margin:14px 0">
        <span class="tag blue">Beginner: ${scores.beginner}</span><span class="tag yellow">Intermediate: ${scores.intermediate}</span><span class="tag green">Faculty: ${scores.faculty}</span></div>
      <div class="hero-cta" style="justify-content:center">
        <button class="btn btn-primary" id="acceptPath">Start the ${esc(pth.name)} path</button>
        <a class="btn btn-ghost" href="#/paths">Pick a different path</a></div>
      <p class="muted" style="margin-top:12px"><small>Scores just guide the suggestion — you're free to choose any path, and switch later.</small></p>
    </div>`;
    $("#acceptPath").addEventListener("click",()=>{ Store.setPath(recommended); toast("Path set: "+pth.name+" 🎉");
      const first = PBI.modules.find(m=>pth.modules.includes(m.n)); location.hash = "#/lesson/"+first.lessons[0].id; });
  };
  wrap();
}

/* ============================================================ MODULES + MODULE DETAIL */
route("modules", ()=>{
  view.innerHTML = crumbs([["Home","#/home"],["Course Modules"]]) + `
  <div class="sec-head"><div><h1>Course modules</h1><p>Twelve modules from “what is Power BI?” to “how do I teach it?”.</p></div></div>
  <div class="grid cols-3">${PBI.modules.map(m=>{ const pr=Store.moduleProgress(m.n);
    return `<div class="card module-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start"><span style="font-size:2em">${m.emoji}</span>
        <span class="mastery"><span class="dot" style="background:${pr.pct===100?"var(--green)":pr.pct>0?"var(--yellow)":"var(--line-2)"}"></span><small>${pr.done}/${pr.total}</small></span></div>
      <div class="module-num">MODULE ${m.n}</div>
      <h3><a href="#/module/${m.n}">${esc(m.title)}</a></h3>
      <p class="muted" style="font-size:.9em;margin:0">${esc(m.blurb)}</p>
      <div class="bar" style="margin-top:8px"><i style="width:${pr.pct}%"></i></div>
      <div class="module-meta"><span>${m.lessons.length} lesson${m.lessons.length>1?"s":""}</span><span>~${m.lessons.reduce((a,l)=>a+l.min,0)} min</span></div>
      <a class="btn btn-ghost btn-sm" href="#/module/${m.n}" style="margin-top:6px">${pr.pct>0?"Continue":"Open module"} →</a>
    </div>`; }).join("")}</div>`;
});

route("module", (a)=>{
  const m = PBI.modules.find(x=>x.n===+a[0]); if(!m){ view.innerHTML=errorState({message:"Module not found"}); return; }
  const pr=Store.moduleProgress(m.n); const qb=Store.quizBest("module-"+m.n);
  view.innerHTML = crumbs([["Home","#/home"],["Modules","#/modules"],[m.title]]) + `
  <div class="sec-head"><div><span class="eyebrow">Module ${m.n} ${m.emoji}</span><h1>${esc(m.title)}</h1><p>${esc(m.blurb)}</p></div>
    <a class="btn btn-ghost" href="#/assess/module/${m.n}">📝 Module quiz${qb!=null?" · best "+qb+"%":""}</a></div>
  <div class="bar" style="margin-bottom:20px"><i style="width:${pr.pct}%"></i></div>
  <div class="grid">${m.lessons.map((l,i)=>{ const done=Store.isDone(l.id);
    return `<a class="lesson-row ${done?"done":""}" href="#/lesson/${l.id}">
      <span class="lr-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
      <span class="lr-main"><b>${m.n}.${i+1} · ${esc(l.t)}</b><span class="lr-meta">~${l.min} min · ${l.level.map(x=>({beginner:"🌱",intermediate:"📊",faculty:"🎓"}[x])).join(" ")} · Prereq: ${esc(l.prereq)}</span></span>
      ${Store.isBookmarked(l.id)?'<span class="tag yellow">🔖</span>':""}
      <span class="tag ${done?"green":""}">${done?"Complete":"Start"}</span></a>`; }).join("")}</div>`;
});

/* ============================================================ LESSON (the 10-step journey) */
const JOURNEY = [
  {key:"discover",label:"Discover"},{key:"watch",label:"Watch"},{key:"follow",label:"Follow"},
  {key:"practise",label:"Practise"},{key:"check",label:"Check"},{key:"understand",label:"Understand"},
  {key:"reflect",label:"Reflect"},{key:"apply",label:"Apply"},{key:"teach",label:"Teach"},{key:"review",label:"Review"}
];

route("lesson",(a)=>{
  const l = PBI.lessonById[a[0]]; if(!l){ view.innerHTML=errorState({message:"Lesson not found"}); return; }
  Store.visit(l.id); Assistant.hintReset(l.id);
  const done=Store.isDone(l.id); const ls=Store.lesson(l.id);
  const mod=PBI.modules.find(m=>m.n===l.m);

  view.innerHTML = crumbs([["Home","#/home"],["Modules","#/modules"],[mod.title,"#/module/"+l.m],[l.t]]) + `
  <div class="lesson-layout">
    <aside class="journey" aria-label="Lesson journey">
      <p class="journey-title">This lesson</p>
      <ol id="journeyNav">${JOURNEY.map((j,i)=>`<li data-j="${j.key}"><span class="j-dot">${i+1}</span><button data-goto="stg-${j.key}">${j.label}</button></li>`).join("")}</ol>
    </aside>
    <div>
      <div class="lesson-head">
        <div class="lesson-metabar">
          <span class="tag yellow">⏱️ ${l.min} min</span>
          ${l.level.map(x=>`<span class="tag">${({beginner:"🌱 Beginner",intermediate:"📊 Intermediate",faculty:"🎓 Faculty"}[x])}</span>`).join("")}
          <button class="tag" id="bmBtn" aria-pressed="${Store.isBookmarked(l.id)}">${Store.isBookmarked(l.id)?"🔖 Bookmarked":"☆ Bookmark"}</button>
        </div>
        <h1>${esc(l.t)}</h1>
        <p class="muted"><strong>Prerequisite:</strong> ${esc(l.prereq)}</p>
      </div>

      ${stage("discover",1,`
        <div class="callout"><strong>Learning outcomes.</strong> By the end you can:
          <ul class="outcomes" style="margin-top:8px">${l.outcomes.map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div>
        <h3 style="margin-top:16px">The idea, plainly</h3>
        <p>${md(l.concept)}</p>
        <div class="analogy-box"><span class="a-emoji">🍳</span> <strong>${esc(l.analogy.title)}:</strong> ${esc(l.analogy.everyday)}</div>
        <h4 style="margin-top:16px">Explain it another way</h4>
        <div class="explain-tabs" role="tablist">
          <button role="tab" class="active" data-ex="child">🧒 Child-friendly</button>
          <button role="tab" data-ex="everyday">🏠 Everyday</button>
          <button role="tab" data-ex="professional">💼 Professional</button>
          <button role="tab" data-ex="visual">👁️ Visual</button>
        </div>
        <div class="explain-body" id="exBody">${esc(l.analogy.child)}</div>`)}

      ${stage("watch",2,`
        <p class="muted">A short, controllable demonstration. Play it, pause, step through, or read the transcript.</p>
        ${demoPlayer(l)}`)}

      ${stage("follow",3,`
        <p class="muted">Now do the same thing, one step at a time. Tick each step as you go.</p>
        <div class="steps" id="followSteps">${l.follow.map((s,i)=>`<div class="step-item" data-step="${i}"><div>${md(s)}</div></div>`).join("")}</div>`)}

      ${stage("practise",4,`
        <p class="muted">Your turn — a similar activity to try independently. Attempt it before asking for hints.</p>
        ${practiceBlock(l)}
        <div style="margin-top:14px">${hintLadder(l)}</div>`)}

      ${stage("check",5,`
        <p class="muted">A quick knowledge check. Immediate feedback follows.</p>
        ${knowledgeCheck(l)}`)}

      ${stage("understand",6,`
        <div class="callout good"><strong>Why this matters.</strong> ${md(l.summary)}</div>
        <h4 style="margin-top:14px">⚠️ Common mistakes to avoid</h4>
        <ul class="outcomes" style="--x:1">${l.mistakes.map(mm=>`<li style="align-items:flex-start"><span style="color:var(--red);font-weight:800">×</span> ${esc(mm)}</li>`).join("")}</ul>`)}

      ${stage("reflect",7,`
        <p class="muted">Put it in your own words — this is where understanding sticks. Saved privately in your browser.</p>
        <textarea class="reflect" id="reflectBox" placeholder="What did you just learn? What surprised you?">${esc(ls.reflect||"")}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-ghost btn-sm" id="saveReflect">Save reflection</button>
        <button class="btn btn-ghost btn-sm" id="askReflect">Ask the assistant to help me reflect</button></div>
        <h4 style="margin-top:16px">🗒️ Personal note & mistake journal</h4>
        <textarea class="reflect" id="noteBox" placeholder="Private note for later revision…">${esc(Store.note(l.id))}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-ghost btn-sm" id="saveNote">Save note</button>
        <button class="btn btn-ghost btn-sm" id="logMistake">＋ Log a mistake I made</button></div>`)}

      ${stage("apply",8,`
        <div class="callout"><strong>🛒 Apply it to Sunshine Supermarket.</strong> ${esc(l.apply)}</div>
        <a class="btn btn-ghost btn-sm" href="#/case/sunshine" style="margin-top:10px">Open the case study workspace →</a>`)}

      ${stage("teach",9,`
        <div class="callout" style="border-color:var(--purple);background:var(--purple-soft)"><strong>🎓 Faculty teach-back.</strong> ${esc(l.teach)}</div>
        <textarea class="reflect" id="teachBox" placeholder="Write your explanation as if teaching a beginner…" style="margin-top:10px">${esc(ls.teach||"")}</textarea>
        <button class="btn btn-ghost btn-sm" id="saveTeach" style="margin-top:8px">Save teach-back</button>
        <p class="muted" style="margin-top:8px"><small>Completing teach-backs raises your faculty-readiness score.</small></p>`)}

      ${stage("review",10,`
        <div id="reviewBox"><p class="muted">Finish the Check step and I'll recommend what to revise based on how you did.</p></div>
        <div class="divider"></div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
          <button class="btn ${done?"btn-ghost":"btn-primary"}" id="completeBtn">${done?"✓ Completed — mark incomplete":"Mark this lesson complete"}</button>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" id="dlSummary">⬇ Download summary</button>
            ${l.next?`<a class="btn btn-dark btn-sm" href="#/lesson/${l.next}">Next lesson →</a>`:`<a class="btn btn-dark btn-sm" href="#/progress">See your progress →</a>`}
          </div>
        </div>
        ${l.next?`<p class="muted" style="margin-top:10px">Recommended next: <a href="#/lesson/${l.next}"><strong>${esc(PBI.lessonById[l.next].t)}</strong></a></p>`:""}`)}
    </div>
  </div>`;

  wireLesson(l);
});

function stage(key, n, inner){
  const j=JOURNEY.find(x=>x.key===key);
  return `<section class="stage" id="stg-${key}"><div class="stage-tag"><span class="num">${n}</span>${j.label.toUpperCase()}</div>${inner}</section>`;
}

/* ---- demo player ---- */
function demoPlayer(l){
  return `<div class="demo" data-demo>
    <div class="demo-stage">
      <div class="demo-step-label" data-d-label>${esc(l.demo.steps[0].label)}</div>
      <div class="demo-visual" data-d-visual>${esc(l.demo.steps[0].visual)}</div>
      <div class="demo-caption" data-d-cap>${esc(l.demo.steps[0].caption)}</div>
    </div>
    <div class="demo-controls">
      <button class="icon-btn" data-d="restart" aria-label="Restart"><svg viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M20 10a8 8 0 0 0-14-4M4 14a8 8 0 0 0 14 4"/></svg></button>
      <button class="icon-btn" data-d="prev" aria-label="Previous step"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="icon-btn" data-d="play" aria-label="Play"><svg viewBox="0 0 24 24" data-play-ico><path d="M7 5l12 7-12 7z"/></svg></button>
      <button class="icon-btn" data-d="next" aria-label="Next step"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      <div class="demo-track"><i data-d-track></i></div>
      <span class="demo-count" data-d-count>1 / ${l.demo.steps.length}</span>
      <button class="demo-toggle" data-d="cc" aria-pressed="true">CC</button>
      <button class="demo-toggle" data-d="tr" aria-pressed="false">Transcript</button>
    </div>
    <div class="transcript" data-d-transcript hidden><strong>Transcript</strong><ol>${l.demo.transcript.map(t=>`<li>${esc(t)}</li>`).join("")}</ol></div>
  </div>`;
}

/* ---- practice blocks by type ---- */
function practiceBlock(l){
  const p=l.practice;
  if(p.type==="mcq") return mcqBlock("prac", p.q, p.options, "practiceCheck");
  if(p.type==="order") return orderBlock(p);
  if(p.type==="daxfill") return daxBlock(p);
  if(p.type==="dnd") return dndBlock(p);
  if(p.type==="text") return textBlock(p);
  return "";
}
function mcqBlock(idp,q,options,btnId){
  return `<div class="quiz"><p><strong>${esc(q)}</strong></p>
    <div data-mcq>${options.map((o,i)=>`<label class="opt"><input type="radio" name="${idp}" value="${i}"> <span><span class="opt-key">${String.fromCharCode(65+i)})</span> ${esc(o)}</span></label>`).join("")}</div>
    <button class="btn btn-primary btn-sm" id="${btnId}" style="margin-top:6px">Check my answer</button>
    <div class="feedback" data-feedback></div></div>`;
}
function orderBlock(p){
  return `<div class="quiz" data-order><p><strong>${esc(p.q)}</strong></p>
    <ul style="list-style:none;padding:0" data-order-list>${p.items.map((it,i)=>`<li class="opt" data-idx="${i}" draggable="false" style="justify-content:space-between">
      <span>${esc(it)}</span>
      <span style="display:flex;gap:4px"><button class="icon-btn" data-up aria-label="Move up" style="width:30px;height:30px"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
      <button class="icon-btn" data-down aria-label="Move down" style="width:30px;height:30px"><svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></button></span></li>`).join("")}</ul>
    <button class="btn btn-primary btn-sm" data-order-check>Check the order</button>
    <div class="feedback" data-feedback></div></div>`;
}
function daxBlock(p){
  return `<div class="quiz" data-dax><p><strong>${esc(p.q)}</strong></p>
    <p class="code" style="display:block;padding:12px">${esc(p.template).replace(/____+/,'<input class="dax-input" data-dax-in style="display:inline-block;width:120px;padding:4px 8px" aria-label="Fill the blank" autocomplete="off">')}</p>
    <button class="btn btn-primary btn-sm" data-dax-check>Check my formula</button>
    <div class="feedback" data-feedback></div></div>`;
}
function dndBlock(p){
  const rights=[...p.pairs.map(x=>x.right)];
  return `<div class="quiz" data-dnd><p><strong>${esc(p.q)}</strong></p>
    <p class="muted"><small>Drag a chart onto each question — or use the picker on touch/keyboard.</small></p>
    <div class="dnd">
      <div class="dnd-col"><h4>Questions</h4>${p.pairs.map((pr,i)=>`
        <div class="drop" data-drop="${i}" data-answer="${esc(pr.right)}"><span class="dl">${esc(pr.left)}</span>
          <select class="chip" data-drop-sel="${i}" aria-label="Choose chart for: ${esc(pr.left)}" style="border-radius:8px"><option value="">— pick —</option>${rights.map(r=>`<option>${esc(r)}</option>`).join("")}</select></div>`).join("")}</div>
      <div class="dnd-col"><h4>Charts</h4><div data-drag-pool>${shuffle([...rights]).map(r=>`<div class="drag" draggable="true" data-drag="${esc(r)}">${esc(r)}</div>`).join("")}</div></div>
    </div>
    <button class="btn btn-primary btn-sm" data-dnd-check>Check matches</button>
    <div class="feedback" data-feedback></div></div>`;
}
function textBlock(p){
  return `<div class="quiz" data-text><p><strong>${esc(p.q)}</strong></p>
    <textarea class="reflect" data-text-in placeholder="Write your answer…"></textarea>
    <button class="btn btn-primary btn-sm" data-text-check style="margin-top:8px">Check my answer</button>
    <div class="feedback" data-feedback></div></div>`;
}
function knowledgeCheck(l){
  return `<div class="quiz" data-check><p><strong>${esc(l.check.q)}</strong></p>
    <div data-mcq>${l.check.options.map((o,i)=>`<label class="opt"><input type="radio" name="chk" value="${i}"> <span><span class="opt-key">${String.fromCharCode(65+i)})</span> ${esc(o)}</span></label>`).join("")}</div>
    <button class="btn btn-primary btn-sm" data-check-btn>Check</button>
    <div class="feedback" data-feedback></div></div>`;
}
function hintLadder(l){
  const labels=["Hint 1 · a small clue","Hint 2 · a stronger explanation","Hint 3 · full step-by-step"];
  return `<div class="hints"><p class="muted" style="margin:0 0 4px"><strong>Stuck?</strong> Reveal hints one at a time — try first.</p>
    ${l.hints.map((h,i)=>`<div class="hint hint-${i+1}"><button aria-expanded="false"><span>${labels[i]}</span><span class="lvl">reveal ▾</span></button><div class="hint-body">${md(h)}</div></div>`).join("")}</div>`;
}

/* ---- wire all lesson interactions ---- */
function wireLesson(l){
  // journey scroll spy + jump
  $$("#journeyNav [data-goto]").forEach(b=>b.addEventListener("click",()=>{ $("#"+b.dataset.goto).scrollIntoView({behavior:"smooth",block:"start"}); }));
  const spy=()=>{ const secs=$$(".stage"); let cur=secs[0];
    secs.forEach(s=>{ if(s.getBoundingClientRect().top<160) cur=s; });
    $$("#journeyNav li").forEach(li=>{ const on=li.dataset.j===cur.id.replace("stg-",""); li.classList.toggle("active",on); });
  };
  window.addEventListener("scroll",spy,{passive:true}); spy();

  // bookmark
  $("#bmBtn").addEventListener("click",e=>{ const on=Store.toggleBookmark(l.id); e.target.setAttribute("aria-pressed",on); e.target.textContent=on?"🔖 Bookmarked":"☆ Bookmark"; toast(on?"Bookmarked":"Bookmark removed"); });

  // explain-another-way tabs
  $$("[data-ex]").forEach(b=>b.addEventListener("click",()=>{ $$("[data-ex]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    const k=b.dataset.ex; $("#exBody").innerHTML = k==="visual" ? "<code style='white-space:pre-wrap'>"+esc(l.analogy.visual)+"</code>" : esc(l.analogy[k]); }));

  // demo player
  wireDemo(l);

  // follow steps toggle
  $$("#followSteps .step-item").forEach(si=>si.addEventListener("click",()=>si.classList.toggle("checked")));

  // hint ladder
  $$(".hint > button").forEach(b=>b.addEventListener("click",()=>{ const h=b.parentElement; const open=h.classList.toggle("open"); b.setAttribute("aria-expanded",open); b.querySelector(".lvl").textContent=open?"hide ▴":"reveal ▾"; }));

  // practice
  wirePractice(l);

  // knowledge check
  const chk=$("[data-check]");
  $("[data-check-btn]",chk).addEventListener("click",()=>{
    const sel=$("input[name=chk]:checked",chk); const fb=$("[data-feedback]",chk);
    if(!sel){ fb.className="feedback no show"; fb.textContent="Pick an answer first."; return; }
    const ok=+sel.value===l.check.answer; markOpts(chk,l.check.answer,+sel.value);
    fb.className="feedback show "+(ok?"ok":"no");
    fb.innerHTML=(ok?"✅ <strong>Correct.</strong> ":"❌ <strong>Not quite.</strong> ")+esc(l.check.explain)+
      (ok?"":`<br><small class="muted">Concept: ${esc(l.analogy.title)}. Example: see the Watch step above.</small>`);
    Store.setLesson(l.id,{checkPass:ok});
    renderReview(l,ok);
    if(!ok) Store.addMistake("Missed knowledge check: "+l.check.q, l.id);
  });
  if(Store.lesson(l.id).checkPass!=null) renderReview(l, Store.lesson(l.id).checkPass);

  // reflect / notes / teach
  $("#saveReflect").addEventListener("click",()=>{ Store.setLesson(l.id,{reflect:$("#reflectBox").value}); toast("Reflection saved"); });
  $("#askReflect").addEventListener("click",()=>{ Assistant.open(); setTimeout(()=>{ const c=$("#assistantChips button"); }, 50); });
  $("#saveNote").addEventListener("click",()=>{ Store.setNote(l.id,$("#noteBox").value); toast("Note saved"); });
  $("#logMistake").addEventListener("click",()=>{ const v=$("#noteBox").value.trim()||prompt("Describe the mistake to remember:"); if(v){ Store.addMistake(v,l.id); toast("Added to your Mistake Journal"); } });
  $("#saveTeach").addEventListener("click",()=>{ const v=$("#teachBox").value.trim(); Store.setLesson(l.id,{teach:v}); if(v){ Store.addTeachback(); toast("Teach-back saved — readiness up!"); } });

  // complete + summary
  $("#completeBtn").addEventListener("click",e=>{ const now=!Store.isDone(l.id); Store.complete(l.id,now);
    toast(now?"Lesson complete 🎉":"Marked incomplete"); router(); });
  $("#dlSummary").addEventListener("click",()=>downloadSummary(l));
}

function wireDemo(l){
  const root=$("[data-demo]"); let i=0, playing=false, timer=null, cc=true;
  const steps=l.demo.steps;
  const paint=()=>{ const s=steps[i];
    $("[data-d-label]",root).textContent=s.label;
    $("[data-d-visual]",root).textContent=s.visual;
    const cap=$("[data-d-cap]",root); cap.textContent=cc?s.caption:""; cap.style.visibility=cc?"visible":"hidden";
    $("[data-d-count]",root).textContent=(i+1)+" / "+steps.length;
    $("[data-d-track]",root).style.width=Math.round((i+1)/steps.length*100)+"%";
  };
  const setPlay=(p)=>{ playing=p; const ico=$("[data-play-ico]",root);
    ico.innerHTML = p? "<path d='M7 5h4v14H7zM13 5h4v14h-4z'/>" : "<path d='M7 5l12 7-12 7z'/>";
    $("[data-d='play']",root).setAttribute("aria-label",p?"Pause":"Play");
    clearInterval(timer); if(p){ timer=setInterval(()=>{ if(i<steps.length-1){ i++; paint(); } else { setPlay(false); } }, 3200); } };
  root.addEventListener("click",e=>{ const b=e.target.closest("[data-d]"); if(!b) return; const act=b.dataset.d;
    if(act==="play") setPlay(!playing);
    else if(act==="next"){ if(i<steps.length-1){ i++; paint(); } setPlay(false); }
    else if(act==="prev"){ if(i>0){ i--; paint(); } setPlay(false); }
    else if(act==="restart"){ i=0; paint(); setPlay(false); }
    else if(act==="cc"){ cc=!cc; b.setAttribute("aria-pressed",cc); paint(); }
    else if(act==="tr"){ const t=$("[data-d-transcript]",root); const on=t.hidden; t.hidden=!on; b.setAttribute("aria-pressed",on); }
  });
  paint();
}

function wirePractice(l){
  const p=l.practice; const root=view;
  const pass=()=>{ Store.setLesson(l.id,{practiceDone:true}); };
  if(p.type==="mcq"){
    $("#practiceCheck").addEventListener("click",()=>{ const box=$("[data-mcq]").closest(".quiz"); const sel=$("input[name=prac]:checked"); const fb=$("[data-feedback]",box);
      if(!sel){ fb.className="feedback no show"; fb.textContent="Choose an option, then check."; return; }
      const ok=+sel.value===p.answer; markOpts(box,p.answer,+sel.value); fb.className="feedback show "+(ok?"ok":"no");
      fb.innerHTML=(ok?"✅ ":"❌ ")+esc(ok?p.explainCorrect:p.explainWrong); if(ok) pass(); else Store.addMistake("Practice miss: "+p.q,l.id); });
  }
  else if(p.type==="order"){
    const list=$("[data-order-list]");
    list.addEventListener("click",e=>{ const up=e.target.closest("[data-up]"), dn=e.target.closest("[data-down]"); const li=e.target.closest("li"); if(!li) return;
      if(up&&li.previousElementSibling) li.parentNode.insertBefore(li,li.previousElementSibling);
      if(dn&&li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling,li); });
    $("[data-order-check]").addEventListener("click",()=>{ const order=$$("#view [data-order-list] li").map(li=>+li.dataset.idx); const fb=$("[data-order] [data-feedback]");
      const ok=JSON.stringify(order)===JSON.stringify(p.answer); fb.className="feedback show "+(ok?"ok":"no");
      fb.innerHTML=(ok?"✅ ":"❌ ")+esc(ok?p.explainCorrect:p.explainWrong); if(ok) pass(); else Store.addMistake("Order miss: "+p.q,l.id); });
  }
  else if(p.type==="daxfill"){
    $("[data-dax-check]").addEventListener("click",()=>{ const inp=$("[data-dax-in]"); const val=(inp.value||"").trim().toLowerCase().replace(/[()\s]/g,""); const fb=$("[data-dax] [data-feedback]");
      const accepts=(p.accepts||[p.answer]).map(x=>x.toLowerCase().replace(/[()\s]/g,"")); const ok=accepts.includes(val);
      inp.style.borderColor=ok?"var(--green)":"var(--red)"; fb.className="feedback show "+(ok?"ok":"no");
      fb.innerHTML=(ok?"✅ ":"❌ ")+esc(ok?p.explainCorrect:p.explainWrong); if(ok) pass(); else Store.addMistake("DAX miss: "+p.q,l.id); });
  }
  else if(p.type==="dnd"){ wireDnd(l,p,pass); }
  else if(p.type==="text"){
    $("[data-text-check]").addEventListener("click",()=>{ const t=$("[data-text-in]").value.trim(); const fb=$("[data-text] [data-feedback]");
      const words=t.split(/\s+/).filter(Boolean).length; const hits=(p.keywords||[]).filter(k=>t.toLowerCase().includes(k)).length;
      const ok = words>=(p.minWords||8) && hits>=1;
      fb.className="feedback show "+(ok?"ok":"no");
      fb.innerHTML=(ok?"✅ ":"💡 ")+esc(ok?p.explainCorrect:p.explainWrong)+(ok?"":`<br><small class="muted">Aim for ${p.minWords||8}+ words and include a key idea.</small>`);
      if(ok) pass(); });
  }
}
function wireDnd(l,p,pass){
  let dragged=null;
  $$("[data-drag]").forEach(d=>{ d.addEventListener("dragstart",()=>{ dragged=d.dataset.drag; d.classList.add("dragging"); });
    d.addEventListener("dragend",()=>d.classList.remove("dragging")); });
  $$("[data-drop]").forEach(dp=>{
    dp.addEventListener("dragover",e=>{ e.preventDefault(); dp.classList.add("over"); });
    dp.addEventListener("dragleave",()=>dp.classList.remove("over"));
    dp.addEventListener("drop",e=>{ e.preventDefault(); dp.classList.remove("over"); if(dragged){ $("[data-drop-sel='"+dp.dataset.drop+"']",dp).value=dragged; } });
  });
  $("[data-dnd-check]").addEventListener("click",()=>{ let all=true;
    $$("[data-drop]").forEach(dp=>{ const val=$("[data-drop-sel='"+dp.dataset.drop+"']",dp).value; const ok=val===dp.dataset.answer;
      dp.classList.remove("correct","incorrect"); dp.classList.add(ok?"correct":"incorrect"); if(!ok) all=false; });
    const fb=$("[data-dnd] [data-feedback]"); fb.className="feedback show "+(all?"ok":"no");
    fb.innerHTML=(all?"✅ ":"❌ ")+esc(all?p.explainCorrect:p.explainWrong); if(all) pass(); else Store.addMistake("Matching miss: "+p.q,l.id); });
}
function markOpts(box,correct,picked){ const opts=$$(".opt",box);
  opts.forEach((o,i)=>{ o.classList.remove("correct","wrong"); if(i===correct) o.classList.add("correct"); if(i===picked&&picked!==correct) o.classList.add("wrong"); }); }

function renderReview(l,pass){
  const box=$("#reviewBox"); if(!box) return;
  const revs=(l.reviewIf||[]).map(id=>PBI.lessonById[id]).filter(Boolean);
  if(pass){
    box.innerHTML=`<div class="callout good"><strong>Nice — you've got this.</strong> Recommended: continue to the next lesson${l.next?` (<a href="#/lesson/${l.next}">${esc(PBI.lessonById[l.next].t)}</a>)`:""}.</div>
    ${revs.length?`<p class="muted" style="margin-top:8px">Optional refreshers: ${revs.map(r=>`<a href="#/lesson/${r.id}">${esc(r.t)}</a>`).join(" · ")}</p>`:""}`;
  } else {
    box.innerHTML=`<div class="callout warn"><strong>Let's shore this up.</strong> Re-watch the demo above, then revisit:
      <ul style="margin:8px 0 0">${revs.map(r=>`<li><a href="#/lesson/${r.id}">${esc(r.t)}</a></li>`).join("")||`<li>This lesson's Discover section</li>`}</ul>
      Then retake the Check — you can try as many times as you like.</div>`;
  }
}

/* ============================================================ PRACTICE LAB */
route("lab",()=>{
  view.innerHTML = crumbs([["Home","#/home"],["Practice Lab"]]) + `
  <div class="sec-head"><div><h1>Practice Lab</h1><p>Standalone exercises to sharpen specific skills. No lesson required.</p></div></div>
  <div class="grid cols-2" id="labGrid"></div>`;
  const g=$("#labGrid");
  LAB.forEach((ex,i)=>{ const c=document.createElement("div"); c.className="card"; c.innerHTML=`<span class="tag ${ex.tagc}">${ex.type}</span><h3 style="margin:10px 0 6px">${esc(ex.title)}</h3><p class="muted" style="font-size:.9em">${esc(ex.desc)}</p><div data-lab="${i}"></div>`; g.appendChild(c); });
  LAB.forEach((ex,i)=>ex.mount($("[data-lab='"+i+"']"), ()=>toast("Nice work! ✅")));
});

const LAB=[
  { type:"Matching", tagc:"blue", title:"Question → Chart", desc:"Match each business question to the visual that answers it best.",
    mount(box,done){ const pairs=[{left:"Compare branches",right:"Bar chart"},{left:"Trend over months",right:"Line chart"},{left:"One headline number",right:"Card"},{left:"Sales vs profit relationship",right:"Scatter"},{left:"Share of total",right:"Treemap"}];
      box.innerHTML=dndBlock({q:"Drag or pick the right chart.",pairs}); wireStandaloneDnd(box,pairs,done); } },
  { type:"DAX completion", tagc:"green", title:"Complete the measure", desc:"Fill the missing DAX function for a safe profit margin.",
    mount(box,done){ box.innerHTML=daxBlock({q:"Safe margin measure:",template:"Profit Margin % = ______([Total Profit],[Total Sales])",answer:"DIVIDE",accepts:["divide"],explainCorrect:"DIVIDE avoids divide-by-zero.",explainWrong:"Use DIVIDE for safe division."});
      wireStandaloneDax(box,["divide"],"DIVIDE avoids divide-by-zero.","Use DIVIDE for safe division.",done); } },
  { type:"Debugging", tagc:"red", title:"Spot the bug", desc:"A learner's total is double the real value. What's wrong?",
    mount(box,done){ box.innerHTML=mcqStandalone("The sales total is exactly double reality. Most likely cause?",
      ["Duplicated rows not removed in Power Query","The chart is a bar not a line","Dark mode is on","Too few decimals"],0,
      "Right — duplicates double-count. Remove duplicates on the unique key.","Look at the data itself: exact doubling points to duplicated rows.");
      wireStandaloneMcq(box,0,done); } },
  { type:"Scenario", tagc:"yellow", title:"Which fix, which room?", desc:"A date column won't group by month. Where do you fix it?",
    mount(box,done){ box.innerHTML=mcqStandalone("Dates won't group by month. Where's the fix?",
      ["Report view — change the chart","Power Query — set the column to Date type","Model view — add a relationship","The Filters pane"],1,
      "Correct — it loaded as text; set it to Date in Power Query.","Grouping by month needs a real Date type, fixed in Power Query.");
      wireStandaloneMcq(box,1,done); } },
  { type:"Order", tagc:"purple", title:"Order the journey", desc:"Put the Power BI pipeline in the right order.",
    mount(box,done){ const items=["Visualise","Connect","Clean","Model","Calculate"]; const ans=[1,2,3,4,0];
      box.innerHTML=orderBlock({q:"Drag into the correct pipeline order.",items,answer:ans,explainCorrect:"Connect → Clean → Model → Calculate → Visualise.",explainWrong:"Remember: Connect → Clean → Model → Calculate → Visualise."});
      wireStandaloneOrder(box,ans,"Connect → Clean → Model → Calculate → Visualise.","Remember the kitchen order.",done); } },
  { type:"Debugging", tagc:"red", title:"Identical bars", desc:"Every category bar is the same height. Why?",
    mount(box,done){ box.innerHTML=mcqStandalone("A bar chart shows identical bars for every category. Cause?",
      ["No relationship between the tables","Wrong font","Too many colours","The slicer is missing"],0,
      "Yes — with no relationship, the filter can't reach the values.","Identical values across categories = filter isn't flowing = no relationship.");
      wireStandaloneMcq(box,0,done); } }
];
function mcqStandalone(q,options,answer,ok,no){ return `<div class="quiz" data-s><p><strong>${esc(q)}</strong></p><div data-mcq>${options.map((o,i)=>`<label class="opt"><input type="radio" name="s${Math.random().toString(36).slice(2,6)}" value="${i}"> <span><span class="opt-key">${String.fromCharCode(65+i)})</span> ${esc(o)}</span></label>`).join("")}</div><button class="btn btn-primary btn-sm" data-s-check>Check</button><div class="feedback" data-feedback></div><input type="hidden" data-ok="${esc(ok)}" data-no="${esc(no)}" data-ans="${answer}"></div>`; }
function wireStandaloneMcq(box,answer,done){ $("[data-s-check]",box).addEventListener("click",()=>{ const sel=$("input:checked",box); const fb=$("[data-feedback]",box); if(!sel){ fb.className="feedback no show"; fb.textContent="Choose an option."; return; } const ok=+sel.value===answer; markOpts(box,answer,+sel.value); const meta=$("[data-ok]",box); fb.className="feedback show "+(ok?"ok":"no"); fb.innerHTML=(ok?"✅ ":"❌ ")+esc(ok?meta.dataset.ok:meta.dataset.no); if(ok) done(); }); }
function wireStandaloneDax(box,accepts,ok,no,done){ $("[data-dax-check]",box).addEventListener("click",()=>{ const inp=$("[data-dax-in]",box); const val=(inp.value||"").trim().toLowerCase().replace(/[()\s]/g,""); const fb=$("[data-feedback]",box); const good=accepts.includes(val); inp.style.borderColor=good?"var(--green)":"var(--red)"; fb.className="feedback show "+(good?"ok":"no"); fb.innerHTML=(good?"✅ ":"❌ ")+esc(good?ok:no); if(good) done(); }); }
function wireStandaloneOrder(box,answer,ok,no,done){ const list=$("[data-order-list]",box); list.addEventListener("click",e=>{ const up=e.target.closest("[data-up]"),dn=e.target.closest("[data-down]"); const li=e.target.closest("li"); if(!li) return; if(up&&li.previousElementSibling) li.parentNode.insertBefore(li,li.previousElementSibling); if(dn&&li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling,li); }); $("[data-order-check]",box).addEventListener("click",()=>{ const order=$$("li",list).map(li=>+li.dataset.idx); const fb=$("[data-feedback]",box); const good=JSON.stringify(order)===JSON.stringify(answer); fb.className="feedback show "+(good?"ok":"no"); fb.innerHTML=(good?"✅ ":"❌ ")+esc(good?ok:no); if(good) done(); }); }
function wireStandaloneDnd(box,pairs,done){ let dragged=null; $$("[data-drag]",box).forEach(d=>{ d.addEventListener("dragstart",()=>dragged=d.dataset.drag); }); $$("[data-drop]",box).forEach(dp=>{ dp.addEventListener("dragover",e=>{e.preventDefault();dp.classList.add("over");}); dp.addEventListener("dragleave",()=>dp.classList.remove("over")); dp.addEventListener("drop",e=>{e.preventDefault();dp.classList.remove("over"); if(dragged)$("[data-drop-sel='"+dp.dataset.drop+"']",dp).value=dragged;}); }); $("[data-dnd-check]",box).addEventListener("click",()=>{ let all=true; $$("[data-drop]",box).forEach(dp=>{ const val=$("[data-drop-sel='"+dp.dataset.drop+"']",dp).value; const ok=val===dp.dataset.answer; dp.classList.remove("correct","incorrect"); dp.classList.add(ok?"correct":"incorrect"); if(!ok)all=false; }); const fb=$("[data-feedback]",box); fb.className="feedback show "+(all?"ok":"no"); fb.innerHTML=all?"✅ Perfect matching!":"❌ Not all correct — match by the question type."; if(all) done(); }); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(i*7+3)%(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ============================================================ CASE STUDIES */
route("cases",()=>{
  view.innerHTML = crumbs([["Home","#/home"],["Case Studies"]]) + `
  <div class="sec-head"><div><h1>Case studies</h1><p>Apply everything to realistic, fictional datasets.</p></div></div>
  <div class="card module-card" style="border-color:var(--yellow)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div><span class="tag yellow">Main project</span><h2 style="margin:8px 0 4px">🛒 Sunshine Supermarket</h2>
      <p class="muted" style="max-width:60ch">${esc(PBI.caseStudy.brief)}</p></div></div>
    <div class="pill-row">${PBI.caseStudy.questions.slice(0,4).map(q=>`<span class="tag">${esc(q)}</span>`).join("")}<span class="tag">+3 more</span></div>
    <a class="btn btn-primary" href="#/case/sunshine" style="align-self:flex-start;margin-top:6px">Open workspace →</a></div>
  <div class="sec-head"><div><h2>Mini projects</h2><p>Shorter builds to practise the full flow.</p></div></div>
  <div class="grid cols-3">${PBI.miniProjects.map(mp=>`<a class="card module-card" href="#/case/${mp.id}" style="text-decoration:none">
    <div style="font-size:2em">${mp.emoji}</div><span class="tag ${mp.level==="Beginner"?"green":"blue"}">${mp.level}</span>
    <h3 style="margin:6px 0 0">${esc(mp.title)}</h3><p class="muted" style="font-size:.9em">${esc(mp.brief)}</p><span class="tag yellow" style="align-self:flex-start;margin-top:auto">Open →</span></a>`).join("")}</div>`;
});

route("case",(a)=>{
  if(a[0]==="sunshine") return renderSunshine();
  const mp=PBI.miniProjects.find(x=>x.id===a[0]); if(!mp){ view.innerHTML=errorState({message:"Case not found"}); return; }
  view.innerHTML = crumbs([["Home","#/home"],["Case Studies","#/cases"],[mp.title]]) + `
  <div class="sec-head"><div><span class="eyebrow">Mini project ${mp.emoji}</span><h1>${esc(mp.title)}</h1><p>${esc(mp.brief)}</p></div><span class="tag ${mp.level==="Beginner"?"green":"blue"}">${mp.level}</span></div>
  <div class="grid cols-2">
    <div class="card"><span class="eyebrow">Questions to answer</span><ul class="outcomes">${mp.questions.map(q=>`<li>${esc(q)}</li>`).join("")}</ul>
      <h4 style="margin-top:14px">Suggested fields</h4><div class="pill-row">${mp.fields.map(f=>`<span class="tag">${esc(f)}</span>`).join("")}</div></div>
    <div class="card"><span class="eyebrow">Build steps</span><div class="steps">${mp.build.map(s=>`<div class="step-item"><div>${esc(s)}</div></div>`).join("")}</div></div>
  </div>
  <div class="callout" style="margin-top:18px"><strong>Tip:</strong> use the same skills as Sunshine — import, clean, one or two measures, then match charts to the questions. Keep all data fictional and anonymous.</div>`;
});

function renderSunshine(){
  const cs=PBI.caseStudy; const s=Store.get();
  const byBranchS=aggregate("Branch","Sales"), byBranchP=aggregate("Branch","Profit");
  const margin=byBranchS.map(b=>({k:b.k, v: Math.round(byBranchP.find(x=>x.k===b.k).v / b.v *100)}));
  const byMonth=aggregate("OrderDate","Sales",d=>d.slice(0,7));
  const byCust=aggregate("CustomerType","Sales");
  const byProd=aggregate("Product","Sales").sort((a,b)=>b.v-a.v);
  const maxS=Math.max(...byBranchS.map(x=>x.v)), maxM=Math.max(...byMonth.map(x=>x.v)), maxMar=Math.max(...margin.map(x=>x.v));
  const stepDone=i=>!!s.caseSteps[i]; const stepPct=Math.round(Object.values(s.caseSteps).filter(Boolean).length/12*100);

  view.innerHTML = crumbs([["Home","#/home"],["Case Studies","#/cases"],["Sunshine Supermarket"]]) + `
  <div class="sec-head"><div><span class="eyebrow">Main case study 🛒</span><h1>Sunshine Supermarket</h1><p>${esc(cs.brief)}</p></div>
    <button class="btn btn-primary" id="dlData">⬇ Download dataset (CSV)</button></div>

  <div class="grid cols-2">
    <div class="card"><span class="eyebrow">The manager's 7 questions</span><ul class="outcomes">${cs.questions.map(q=>`<li>${esc(q)}</li>`).join("")}</ul></div>
    <div class="card"><span class="eyebrow">Your progress on this project</span>
      <div style="font-size:2em;font-weight:800">${stepPct}%</div><div class="bar" style="margin:6px 0"><i style="width:${stepPct}%"></i></div>
      <p class="muted">${Object.values(s.caseSteps).filter(Boolean).length} of 12 steps done. Tick steps as you complete them in Power BI.</p></div>
  </div>

  <div class="sec-head"><div><h2>📊 Live sample dashboard</h2><p>Computed from the ${PBI.dataset.length}-row dataset — your evidence for insights.</p></div></div>
  <div class="kpi-grid" style="margin-bottom:16px">
    ${kpi(money(sum("Sales")),"Total sales","")}
    ${kpi(money(sum("Profit")),"Total profit","")}
    ${kpi(Math.round(sum("Profit")/sum("Sales")*100)+"%","Overall margin","")}
    ${kpi(PBI.dataset.length,"Orders","")}
  </div>
  <div class="grid cols-2">
    <div class="viz-card"><h4>Sales by branch</h4>${byBranchS.map(b=>hbar(b.k,b.v,maxS,money(b.v))).join("")}</div>
    <div class="viz-card"><h4>Profit margin % by branch</h4>${margin.map(b=>hbar(b.k,b.v,maxMar,b.v+"%",true)).join("")}</div>
    <div class="viz-card"><h4>Sales by month</h4>${byMonth.map(b=>hbar(b.k,b.v,maxM,money(b.v))).join("")}</div>
    <div class="viz-card"><h4>Sales vs profit (by branch)</h4>${scatter(byBranchS,byBranchP)}</div>
    <div class="viz-card"><h4>Top products by sales</h4>${byProd.slice(0,5).map(b=>hbar(b.k,b.v,byProd[0].v,money(b.v))).join("")}</div>
    <div class="viz-card"><h4>Sales by customer type</h4>${byCust.map(b=>hbar(b.k,b.v,Math.max(...byCust.map(x=>x.v)),money(b.v),true)).join("")}</div>
  </div>

  <div class="sec-head"><div><h2>Guided walkthrough · 12 steps</h2><p>Work these in Power BI at your own pace. Tick each as you finish.</p></div></div>
  <div class="grid">${cs.steps.map((st,i)=>`<div class="step-item ${stepDone(i)?"checked":""}" data-cs="${i}" style="cursor:pointer">
    <div><b>${esc(st.t)}</b><br><span class="muted" style="font-size:.92em">${esc(st.d)}</span>
    ${i===1?`<br><button class="linklike" id="dlData2">Download the dataset</button>`:""}</div></div>`).join("")}</div>

  <div class="grid cols-2" style="margin-top:22px">
    <div class="card"><span class="eyebrow">💡 Sample insights (peek after you try)</span>
      <details><summary style="cursor:pointer;font-weight:700">Reveal three worked insights</summary>
      <ul class="outcomes" style="margin-top:10px">${cs.sampleInsights.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details></div>
    <div class="card"><span class="eyebrow">🎯 Recommended actions</span>
      <details><summary style="cursor:pointer;font-weight:700">Reveal three recommendations</summary>
      <ul class="outcomes" style="margin-top:10px">${cs.sampleActions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details></div>
  </div>

  <div class="card" style="margin-top:22px"><span class="eyebrow">✅ Dashboard evaluation checklist</span>
    <p class="muted" style="margin-top:0">Score your own dashboard before presenting.</p>
    ${EVAL.map((e,i)=>`<label class="opt" style="margin-bottom:6px"><input type="checkbox" data-eval="${i}" ${s.checklist["eval"+i]?"checked":""}> <span>${esc(e)}</span></label>`).join("")}</div>`;

  $("#dlData").addEventListener("click",downloadDataset);
  const d2=$("#dlData2"); if(d2) d2.addEventListener("click",downloadDataset);
  $$("[data-cs]").forEach(el=>el.addEventListener("click",e=>{ if(e.target.closest("button,a")) return; const i=el.dataset.cs; const now=!s.caseSteps[i]; Store.setCaseStep(i,now); el.classList.toggle("checked",now); renderNav(); }));
  $$("[data-eval]").forEach(cb=>cb.addEventListener("change",e=>Store.setCheck("eval"+e.target.dataset.eval, e.target.checked)));
}
const EVAL=["A clear title states what the dashboard shows","Every visual answers one of the manager's questions","Correct chart types (bar/line/card/scatter)","Branch and Month slicers present and working","Numbers formatted (₹, %, thousands)","At least 3 insights written as full sentences","Each insight has a recommended action","Layout is aligned with generous white space","No misleading scales or 3D decoration","Colour is never the only signal (labels too)"];
function kpi(v,l,t){ return `<div class="kpi"><div class="kv">${esc(v)}</div><div class="kl">${esc(l)}</div>${t?`<div class="kt up">${esc(t)}</div>`:""}</div>`; }
function hbar(label,val,max,disp,alt){ return `<div class="hbar ${alt?"alt":""}"><span>${esc(label)}</span><span class="track"><i style="width:${Math.max(3,Math.round(val/max*100))}%"></i></span><b>${esc(disp)}</b></div>`; }
function scatter(sales,profit){
  const W=300,H=170,pad=30; const xs=sales.map(x=>x.v), ps=sales.map(s=>profit.find(p=>p.k===s.k).v);
  const maxX=Math.max(...xs), maxY=Math.max(...ps), minY=Math.min(...ps,0);
  const px=v=>pad+(v/maxX)*(W-pad-10), py=v=>H-pad-((v-minY)/(maxY-minY))*(H-pad-10);
  const cols=["var(--blue)","var(--yellow-deep)","var(--green)","var(--red)"];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter of sales versus profit by branch" style="width:100%">
    <line x1="${pad}" y1="${H-pad}" x2="${W-6}" y2="${H-pad}" stroke="var(--line-2)"/><line x1="${pad}" y1="6" x2="${pad}" y2="${H-pad}" stroke="var(--line-2)"/>
    <text x="${W/2}" y="${H-6}" font-size="9" fill="var(--ink-3)" text-anchor="middle">Sales →</text>
    <text x="10" y="${H/2}" font-size="9" fill="var(--ink-3)" transform="rotate(-90 10 ${H/2})" text-anchor="middle">Profit →</text>
    ${sales.map((sp,i)=>`<circle cx="${px(sp.v).toFixed(1)}" cy="${py(ps[i]).toFixed(1)}" r="6" fill="${cols[i%4]}"/><text x="${(px(sp.v)+8).toFixed(1)}" y="${(py(ps[i])+3).toFixed(1)}" font-size="9" fill="var(--ink-2)">${esc(sp.k.slice(0,3))}</text>`).join("")}
  </svg><p class="muted" style="font-size:.82em;margin:.4em 0 0">Note how the highest-sales branch isn't the highest-profit one.</p>`;
}

/* ============================================================ ASSESSMENTS */
route("assess",(a)=>{
  if(a[0]==="module") return runQuiz(+a[1]);
  if(a[0]==="diagnostic"){ location.hash="#/paths/diagnostic"; return; }
  const s=Store.get();
  view.innerHTML = crumbs([["Home","#/home"],["Assessments"]]) + `
  <div class="sec-head"><div><h1>Assessments</h1><p>Check your understanding. Retake anything — mastery is about learning, not one score.</p></div></div>
  <div class="callout"><strong>Mastery scale:</strong> <span class="tag red">Below 60% Review</span> <span class="tag yellow">60–79 Developing</span> <span class="tag blue">80–89 Proficient</span> <span class="tag green">90–100 Mastered</span></div>
  <div class="sec-head"><div><h2>Module quizzes</h2></div></div>
  <div class="grid cols-3">${PBI.modules.map(m=>{ const best=Store.quizBest("module-"+m.n); const ml=best!=null?Store.masteryLabel(best):null;
    return `<a class="card module-card" href="#/assess/module/${m.n}" style="text-decoration:none">
      <div style="display:flex;justify-content:space-between"><span style="font-size:1.5em">${m.emoji}</span>${best!=null?`<span class="tag ${ml.c}">${best}%</span>`:`<span class="tag">Not taken</span>`}</div>
      <div class="module-num">MODULE ${m.n}</div><h3 style="font-size:1em;margin:0">${esc(m.title)}</h3>
      <span class="muted" style="font-size:.85em;margin-top:auto">${m.lessons.length} question${m.lessons.length>1?"s":""}${ml?" · "+ml.t:""}</span></a>`; }).join("")}</div>

  <div class="sec-head"><div><h2>Other assessments</h2></div></div>
  <div class="grid cols-3">
    <a class="card module-card" href="#/paths/diagnostic" style="text-decoration:none"><div style="font-size:1.6em">🧭</div><h3 style="margin:0">Diagnostic</h3><p class="muted" style="font-size:.9em">Find your recommended path (2 min).</p></a>
    <a class="card module-card" href="#/case/sunshine" style="text-decoration:none"><div style="font-size:1.6em">🛒</div><h3 style="margin:0">Final practical project</h3><p class="muted" style="font-size:.9em">Build & present the Sunshine dashboard.</p></a>
    <a class="card module-card" href="#/lesson/m12l1" style="text-decoration:none"><div style="font-size:1.6em">🎓</div><h3 style="margin:0">Faculty teach-back</h3><p class="muted" style="font-size:.9em">Explain concepts as if teaching. ${s.teachbacks} saved.</p></a>
  </div>`;
});

function runQuiz(modN){
  const m=PBI.modules.find(x=>x.n===modN); const qs=PBI.moduleAssessment(modN);
  if(!m||!qs.length){ view.innerHTML=errorState({message:"Quiz unavailable"}); return; }
  let i=0, picks=[];
  const paint=()=>{ const q=qs[i];
    view.innerHTML = crumbs([["Home","#/home"],["Assessments","#/assess"],[m.title+" quiz"]]) + `
    <div class="card" style="max-width:760px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="eyebrow">${esc(m.title)} · Q ${i+1}/${qs.length}</span><span class="tag">${m.emoji} Module ${m.n}</span></div>
      <div class="bar" style="margin:10px 0 18px"><i style="width:${i/qs.length*100}%"></i></div>
      <h2 style="font-size:1.25em">${esc(q.q)}</h2>
      <div data-mcq>${q.options.map((o,oi)=>`<label class="opt"><input type="radio" name="q" value="${oi}"> <span><span class="opt-key">${String.fromCharCode(65+oi)})</span> ${esc(o)}</span></label>`).join("")}</div>
      <div class="feedback" data-feedback></div>
      <div style="display:flex;justify-content:space-between;margin-top:12px"><a class="btn btn-ghost btn-sm" href="#/assess">Exit</a><button class="btn btn-primary btn-sm" data-q-next>Submit</button></div>
    </div>`;
    let answered=false;
    $("[data-q-next]").addEventListener("click",()=>{ const sel=$("input[name=q]:checked"); const fb=$("[data-feedback]");
      if(!answered){ if(!sel){ fb.className="feedback no show"; fb.textContent="Choose an answer."; return; }
        const ok=+sel.value===q.answer; picks.push(ok); markOpts($(".card"),q.answer,+sel.value);
        fb.className="feedback show "+(ok?"ok":"no"); fb.innerHTML=(ok?"✅ <strong>Correct.</strong> ":"❌ <strong>Not quite.</strong> ")+esc(q.explain)+`<br><small class="muted">From: ${esc(q.from)}</small>`;
        if(!ok) Store.addMistake("Quiz miss ("+m.title+"): "+q.q); answered=true; $("[data-q-next]").textContent=i<qs.length-1?"Next →":"See results"; }
      else { i++; if(i<qs.length) paint(); else results(); } });
  };
  const results=()=>{ const score=picks.filter(Boolean).length; const pct=Math.round(score/qs.length*100); const q=Store.recordQuiz("module-"+modN,pct); const ml=Store.masteryLabel(pct);
    view.innerHTML = crumbs([["Home","#/home"],["Assessments","#/assess"],[m.title+" quiz"]]) + `
    <div class="card center" style="max-width:640px;margin:0 auto">
      <div style="font-size:2.6em">${pct>=90?"🏆":pct>=80?"🎯":pct>=60?"📈":"📚"}</div>
      <span class="eyebrow" style="justify-content:center">${esc(m.title)}</span>
      <h1 style="margin:0">${score} / ${qs.length} · ${pct}%</h1>
      <p><span class="mastery"><span class="dot" style="background:${ml.dot}"></span> ${ml.t}</span></p>
      <div class="callout ${pct>=80?"good":pct>=60?"":"warn"}" style="text-align:left">
        ${pct>=90?"Outstanding — you've mastered this module. Consider a teach-back to lock it in.":
          pct>=80?"Proficient. A quick review of any missed items and you're solid.":
          pct>=60?"Developing. Revisit the lessons below, then retake — you can try as often as you like.":
          "Review recommended. Re-watch the demos and redo the practice, then retake. Everyone starts here."}
      </div>
      <div style="margin-top:12px"><strong>Revisit:</strong><div class="grid" style="margin-top:8px">${m.lessons.map(lessonMiniCard).join("")}</div></div>
      <div class="hero-cta" style="justify-content:center;margin-top:14px"><button class="btn btn-primary" id="retake">Retake quiz</button><a class="btn btn-ghost" href="#/assess">All assessments</a></div>
      <p class="muted" style="margin-top:8px"><small>Best score kept: ${q.best}% over ${q.attempts} attempt${q.attempts>1?"s":""}.</small></p>
    </div>`;
    $("#retake").addEventListener("click",()=>runQuiz(modN)); renderNav();
  };
  paint();
}

/* ============================================================ TEACHING TOOLKIT */
route("teach",()=>{
  const tk=PBI.toolkit;
  view.innerHTML = crumbs([["Home","#/home"],["Teaching Toolkit"]]) + `
  <div class="sec-head"><div><span class="eyebrow">Faculty 🎓</span><h1>Teaching Toolkit</h1><p>Everything you need to run a Power BI class with confidence.</p></div>
    <button class="btn btn-ghost" id="printKit">🖨️ Print worksheets</button></div>

  <div class="sec-head"><div><h2>Ready-to-use lesson plans</h2></div></div>
  ${tk.lessonPlans.map(lp=>acc(lp.title,`<ol style="margin:0;padding-left:1.2em">${lp.outline.map(o=>`<li>${esc(o)}</li>`).join("")}</ol>`)).join("")}

  <div class="grid cols-2" style="margin-top:20px">
    <div class="card"><span class="eyebrow">🎬 Demonstration scripts</span>${tk.demoScripts.map(d=>`<h4 style="margin:12px 0 6px">${esc(d.title)}</h4><ol style="margin:0;padding-left:1.2em">${d.lines.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`).join("")}</div>
    <div class="card"><span class="eyebrow">🧑‍🎓 Student exercises</span><ul class="outcomes">${tk.studentExercises.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <span class="eyebrow" style="margin-top:16px">🗣️ Discussion questions</span>
      <ul class="outcomes"><li>When would a spreadsheet beat Power BI?</li><li>Why do we clean data before charting?</li><li>What makes an insight different from a fact?</li></ul></div>
  </div>

  <div class="sec-head"><div><h2>Common student questions</h2><p>With answers you can give on the spot.</p></div></div>
  ${tk.studentQs.map(q=>acc(q[0],`<p>${esc(q[1])}</p>`)).join("")}

  <div class="grid cols-2" style="margin-top:20px">
    <div class="card"><span class="eyebrow">🔍 Checking understanding</span><ul class="outcomes">${tk.checkMethods.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <span class="eyebrow" style="margin-top:16px">🌱 Beginner-support strategies</span>
      <ul class="outcomes"><li>Pair a nervous learner with a confident one.</li><li>Use the analogy before the software.</li><li>Give one small win in the first 10 minutes.</li><li>Normalise mistakes — demo a broken chart and fix it live.</li></ul></div>
    <div class="card"><span class="eyebrow">📋 Assessment rubric</span>
      <div class="table-scroll"><table class="tbl"><thead><tr><th>Criterion</th><th>What to look for</th><th>Score</th></tr></thead>
      <tbody>${tk.rubric.map(r=>`<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>
      <p class="muted" style="font-size:.85em">Total /18. 15+ = ready to present; 10–14 = revise one area; &lt;10 = rework with support.</p></div>
  </div>

  <div class="card" style="margin-top:20px"><span class="eyebrow">🖨️ Printable classroom worksheets</span>
    <div class="pill-row">${tk.worksheets.map(w=>`<span class="tag yellow">${esc(w)}</span>`).join("")}</div>
    <p class="muted" style="margin-top:10px">Use “Print worksheets” above, or download any lesson summary from its Review step.</p></div>`;
  $$(".acc > button").forEach(b=>b.addEventListener("click",()=>{ const a=b.parentElement; const open=a.classList.toggle("open"); b.setAttribute("aria-expanded",open); }));
  $("#printKit").addEventListener("click",()=>window.print());
});
function acc(title,body){ return `<div class="acc"><button aria-expanded="false"><span>${esc(title)}</span><span class="caret">▾</span></button><div class="acc-body">${body}</div></div>`; }

/* ============================================================ REFERENCE LIBRARY */
route("reference",()=>{
  view.innerHTML = crumbs([["Home","#/home"],["Reference Library"]]) + `
  <div class="sec-head"><div><h1>Reference Library</h1><p>Look things up fast: glossary, DAX, shortcuts, flashcards, FAQ, datasets.</p></div></div>
  <div class="pill-row" id="refTabs" role="tablist">
    ${["Glossary","DAX reference","Shortcuts","Flashcards","FAQ","Datasets"].map((t,i)=>`<button class="chip ${i===0?"":""}" data-ref="${i}" ${i===0?'style="background:var(--ink);color:var(--bg);border-color:var(--ink)"':""}>${t}</button>`).join("")}</div>
  <div id="refBody" style="margin-top:18px"></div>`;
  const bodies=[refGlossary,refDax,refShortcuts,refFlash,refFaq,refDatasets];
  const show=i=>{ $$("#refTabs [data-ref]").forEach(b=>{ const on=+b.dataset.ref===i; b.style.background=on?"var(--ink)":""; b.style.color=on?"var(--bg)":""; b.style.borderColor=on?"var(--ink)":""; });
    $("#refBody").innerHTML=""; bodies[i]($("#refBody")); };
  $$("#refTabs [data-ref]").forEach(b=>b.addEventListener("click",()=>show(+b.dataset.ref)));
  show(0);
});
function refGlossary(box){
  box.innerHTML=`<input type="search" id="glossSearch" placeholder="Filter glossary…" style="width:100%;max-width:360px;padding:.6em 1em;border-radius:999px;border:1.5px solid var(--line-2);background:var(--bg);color:var(--ink);font:inherit;margin-bottom:14px" aria-label="Filter glossary">
    <div class="grid cols-2" id="glossList"></div>`;
  const render=(f="")=>{ const list=PBI.glossary.filter(g=>!f||g[0].toLowerCase().includes(f)||g[1].toLowerCase().includes(f));
    $("#glossList").innerHTML = list.length? list.map(g=>`<div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(g[0])}</strong><span class="tag" style="font-size:.68em">${esc(g[2])}</span></div><p class="muted" style="margin:.4em 0 0;font-size:.92em">${esc(g[1])}</p></div>`).join("") : emptyInline("🔍","No matches","Try another word."); };
  render(); $("#glossSearch").addEventListener("input",e=>render(e.target.value.toLowerCase()));
}
function refDax(box){ box.innerHTML=`<p class="muted">Copy-ready measures for the Sunshine model. Tap to copy.</p><div class="grid">${PBI.daxRef.map(d=>`<div class="card" style="padding:14px;cursor:pointer" data-copy="${esc(d[0])}"><pre class="code" style="margin:0 0 8px">${esc(d[0])}</pre><div style="display:flex;justify-content:space-between"><span class="muted" style="font-size:.9em">${esc(d[1])}</span><span class="tag blue">${esc(d[2])}</span></div></div>`).join("")}</div>`;
  $$("[data-copy]",box).forEach(c=>c.addEventListener("click",()=>{ navigator.clipboard&&navigator.clipboard.writeText(c.dataset.copy); toast("Copied to clipboard"); })); }
function refShortcuts(box){ box.innerHTML=`<div class="table-scroll"><table class="tbl"><thead><tr><th>Shortcut</th><th>What it does</th></tr></thead><tbody>${PBI.shortcuts.map(s=>`<tr><td><span class="code">${esc(s[0])}</span></td><td>${esc(s[1])}</td></tr>`).join("")}</tbody></table></div>`; }
function refFlash(box){ let i=0; box.innerHTML=`<div style="max-width:520px;margin:0 auto"><div class="flash" id="flash"><div class="flash-inner"><div class="flash-face"><span class="fk">Question ${i+1}/${PBI.flashcards.length}</span><h3 id="flashQ" style="font-size:1.2em"></h3></div><div class="flash-face back"><span class="fk">Answer</span><p id="flashA"></p></div></div></div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="btn btn-ghost btn-sm" id="fPrev">← Prev</button><button class="btn btn-primary btn-sm" id="fFlip">Flip card</button><button class="btn btn-ghost btn-sm" id="fNext">Next →</button></div>
    <p class="muted center" style="margin-top:10px"><small>Revision flashcards — quiz yourself, then flip.</small></p></div>`;
  const paint=()=>{ const c=PBI.flashcards[i]; $("#flashQ").textContent=c[0]; $("#flashA").textContent=c[1]; $("#flash").classList.remove("flipped"); $(".fk").textContent="Question "+(i+1)+"/"+PBI.flashcards.length; };
  $("#fFlip").addEventListener("click",()=>$("#flash").classList.toggle("flipped"));
  $("#flash").addEventListener("click",e=>{ if(!e.target.closest("button")) $("#flash").classList.toggle("flipped"); });
  $("#fNext").addEventListener("click",()=>{ i=(i+1)%PBI.flashcards.length; paint(); });
  $("#fPrev").addEventListener("click",()=>{ i=(i-1+PBI.flashcards.length)%PBI.flashcards.length; paint(); });
  paint();
}
function refFaq(box){ box.innerHTML=PBI.faq.map(f=>acc(f[0],`<p>${esc(f[1])}</p>`)).join(""); $$(".acc > button",box).forEach(b=>b.addEventListener("click",()=>{ const a=b.parentElement; const open=a.classList.toggle("open"); b.setAttribute("aria-expanded",open); })); }
function refDatasets(box){ box.innerHTML=`<div class="grid cols-2">
  <div class="card"><span class="tag yellow">Main</span><h3>🛒 Sunshine Supermarket</h3><p class="muted">${PBI.dataset.length} orders · 14 columns · fictional & anonymous.</p><button class="btn btn-primary btn-sm" id="dsMain">⬇ Download CSV</button></div>
  ${PBI.miniProjects.map(mp=>`<div class="card"><span class="tag">${mp.level}</span><h3>${mp.emoji} ${esc(mp.title)}</h3><p class="muted">Fields: ${mp.fields.join(", ")}.</p><button class="btn btn-ghost btn-sm" data-ds="${mp.id}">⬇ Download starter CSV</button></div>`).join("")}</div>
  <div class="callout" style="margin-top:16px"><strong>How to use:</strong> download, then in Power BI choose Get data ▸ Text/CSV ▸ Transform Data. All data is fictional.</div>`;
  $("#dsMain").addEventListener("click",downloadDataset);
  $$("[data-ds]",box).forEach(b=>b.addEventListener("click",()=>downloadMiniCsv(PBI.miniProjects.find(m=>m.id===b.dataset.ds))));
}

/* ============================================================ PROGRESS */
route("progress",()=>{
  const p=Store.overallProgress(); const s=Store.get(); const earned=Store.earnedBadges(); const fr=Store.facultyReadiness();
  const skills=PBI.modules.map(m=>({m,pr:Store.moduleProgress(m.n)}));
  const needsRev=skills.filter(x=>x.pr.pct>0&&x.pr.pct<100).concat(Object.entries(s.quiz).filter(([k,q])=>q.best<80).map(([k])=>({quiz:k})));
  view.innerHTML = crumbs([["Home","#/home"],["Progress"]]) + `
  <div class="sec-head"><div><h1>Your progress & achievements</h1><p>Where you are, what you've mastered, and what to do next.</p></div>
    <button class="btn btn-primary" id="certBtn" ${p.pct<100?"disabled title='Complete all lessons to unlock'":""}>🏅 Get certificate</button></div>

  <div class="grid cols-3">
    <div class="card center"><div class="ring-wrap"><div class="ring" style="--p:${p.pct}"><b>${p.pct}%</b><span>course</span></div></div><p class="muted" style="margin-top:10px">${p.done}/${p.total} lessons</p></div>
    <div class="card"><span class="eyebrow">Faculty-readiness score</span><div style="font-size:2.4em;font-weight:800">${fr}<span style="font-size:.35em;color:var(--ink-3)"> / 100</span></div>
      <div class="bar" style="margin:6px 0"><i style="width:${fr}%"></i></div>
      <p class="muted">${fr>=80?"You're ready to teach — do a final rehearsal.":fr>=50?"On track. Finish modules and add teach-backs.":"Keep going — complete lessons and try teach-backs."}</p></div>
    <div class="card"><span class="eyebrow">Streak</span><div style="font-size:2.4em;font-weight:800">🔥 ${s.streak.count}</div><p class="muted">consecutive days learning</p>
      <div style="font-size:.85em">Teach-backs saved: <strong>${s.teachbacks}</strong> · Quizzes taken: <strong>${Object.keys(s.quiz).length}</strong></div></div>
  </div>

  <div class="sec-head"><div><h2>Skills mastered</h2></div></div>
  <div class="grid cols-2"><div class="card">${skills.map(x=>{ const ml=Store.masteryLabel(x.pr.pct===0?null:Store.quizBest("module-"+x.m.n)!=null?Store.quizBest("module-"+x.m.n):x.pr.pct);
    return `<div class="hbar" style="grid-template-columns:1fr auto auto"><span>${x.m.emoji} ${esc(x.m.title)}</span><span class="mastery"><span class="dot" style="background:${ml.dot}"></span></span><b style="font-size:.85em;color:var(--ink-3)">${x.pr.pct}%</b></div>`; }).join("")}</div>
    <div class="card"><span class="eyebrow">🎯 Topics needing revision</span>
      ${needsRev.length? `<ul class="outcomes" style="margin-top:8px">${needsRev.slice(0,6).map(x=>x.m?`<li style="align-items:flex-start"><span style="color:var(--yellow-deep)">▹</span> <a href="#/module/${x.m.n}">${esc(x.m.title)}</a> — ${x.pr.pct}% done</li>`:`<li style="align-items:flex-start"><span style="color:var(--red)">▹</span> Retake quiz: ${esc(x.quiz)}</li>`).join("")}</ul>` : emptyInline("🌟","Nothing flagged","Great balance across topics.")}
      <span class="eyebrow" style="margin-top:16px">📓 Mistake journal</span>
      ${s.mistakes.length? `<div>${s.mistakes.slice(0,5).map((mm,i)=>`<div class="hbar" style="grid-template-columns:1fr auto"><span class="muted" style="font-size:.88em">${esc(mm.text.slice(0,70))}${mm.text.length>70?"…":""}</span><button class="icon-btn" data-delmis="${i}" style="width:28px;height:28px" aria-label="Remove"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`).join("")}</div>`:emptyInline("✅","No mistakes logged","Log tricky moments inside lessons to revise later.")}</div></div>

  <div class="sec-head"><div><h2>Achievement badges</h2><p>${earned.length} of ${PBI.badges.length} earned.</p></div></div>
  <div class="grid cols-4">${PBI.badges.map(b=>{ const got=earned.includes(b.id);
    return `<div class="badge ${got?"":"locked"}"><div class="b-emoji">${got?b.emoji:"🔒"}</div><strong>${esc(b.name)}</strong><span class="muted" style="font-size:.82em">${esc(b.desc)}</span>${got?'<span class="tag green">Earned</span>':""}</div>`; }).join("")}</div>

  <div class="card" style="margin-top:22px"><span class="eyebrow">📈 Your personalised improvement plan</span>
    <ol style="margin:8px 0 0;padding-left:1.2em">${improvementPlan().map(x=>`<li style="margin-bottom:6px">${x}</li>`).join("")}</ol></div>`;

  $$("[data-delmis]").forEach(b=>b.addEventListener("click",()=>{ Store.removeMistake(+b.dataset.delmis); router(); }));
  const cb=$("#certBtn"); if(cb&&!cb.disabled) cb.addEventListener("click",showCertificate);
});
function improvementPlan(){
  const plan=[]; const nl=firstIncompleteLesson();
  if(nl) plan.push(`Continue with <a href="#/lesson/${nl.id}"><strong>${esc(nl.t)}</strong></a> (Module ${nl.m}).`);
  const weakQ=Object.entries(Store.get().quiz).filter(([k,q])=>q.best<80).map(([k])=>k);
  if(weakQ.length) plan.push(`Retake these quizzes to reach 80%+: ${weakQ.join(", ")}.`);
  if(Store.get().teachbacks<5) plan.push(`Complete ${5-Store.get().teachbacks} more teach-backs (Teach step in lessons) to raise readiness.`);
  if(Object.values(Store.get().caseSteps).filter(Boolean).length<12) plan.push(`Finish the <a href="#/case/sunshine">Sunshine case study</a> — the strongest evidence you can teach.`);
  if(Store.get().mistakes.length) plan.push(`Review your Mistake Journal (${Store.get().mistakes.length} entries) before your next quiz.`);
  if(!plan.length) plan.push("You've done it all — do a full rehearsal of the case study presentation. 🎉");
  return plan;
}
function showCertificate(){
  const name=prompt("Name for the certificate:","Faculty Member")||"Faculty Member";
  const fr=Store.facultyReadiness(); const date=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const w=window.open("","_blank");
  if(!w){ toast("Allow pop-ups to view the certificate","warn"); return; }
  w.document.write(`<!doctype html><html><head><title>Power BI Certificate</title><style>
    body{font-family:"Segoe UI",system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#FAF9F8;color:#252423}
    .cert{width:800px;max-width:92vw;border:3px solid #F2C811;border-radius:20px;padding:56px;text-align:center;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.12);position:relative}
    .cert::before{content:"";position:absolute;inset:12px;border:1px solid #E7E4E0;border-radius:12px}
    .k{width:60px;height:60px;border-radius:14px;background:#252423;display:inline-grid;place-items:center;margin-bottom:14px}
    .k svg{width:36px;height:36px;fill:#F2C811}
    h1{font-size:2.2em;margin:.2em 0} .sub{color:#6E6C6A;letter-spacing:.05em;text-transform:uppercase;font-size:.8em}
    .name{font-size:1.8em;font-weight:800;margin:.4em 0;border-bottom:2px solid #F2C811;display:inline-block;padding:0 .4em .1em}
    .row{display:flex;justify-content:space-around;margin-top:30px;font-size:.9em;color:#484644}
    .score{font-size:2em;font-weight:800;color:#0F7B0F}
    @media print{body{background:#fff}.cert{box-shadow:none}}
  </style></head><body><div class="cert">
    <div class="k"><svg viewBox="0 0 32 32"><rect x="4" y="17" width="5" height="11" rx="1.5"/><rect x="13" y="10" width="5" height="18" rx="1.5"/><rect x="22" y="5" width="5" height="23" rx="1.5"/></svg></div>
    <div class="sub">Certificate of Completion</div>
    <h1>Master Power BI</h1>
    <p>This certifies that</p>
    <div class="name">${esc(name)}</div>
    <p>has completed all 12 modules of<br><strong>Learn · Practise · Assess · Teach</strong><br>and is prepared to teach Power BI to students.</p>
    <div class="row"><div><div class="score">${fr}/100</div>Faculty readiness</div><div><div class="score">100%</div>Course complete</div><div><div style="font-size:1.1em;font-weight:700;margin-top:.4em">${date}</div>Date</div></div>
    <p style="margin-top:30px;color:#9B9895;font-size:.8em">Self-paced learning · issued locally on the learner's device</p>
    <button onclick="window.print()" style="margin-top:16px;padding:.6em 1.4em;border-radius:999px;border:none;background:#F2C811;font-weight:700;cursor:pointer">🖨️ Print / Save as PDF</button>
  </div></body></html>`);
  w.document.close();
}

/* ============================================================ HELP */
route("help",()=>{
  view.innerHTML = crumbs([["Home","#/home"],["Help"]]) + `
  <div class="sec-head"><div><h1>Help & how this works</h1><p>Everything you need to get the most from the toolkit.</p></div></div>
  <div class="grid cols-2">
    <div class="card"><span class="eyebrow">🚀 Getting started</span><ol style="padding-left:1.2em">
      <li>Take the <a href="#/paths/diagnostic">diagnostic</a> to find your path.</li>
      <li>Open <a href="#/modules">Module 1</a> and work the 10-step journey.</li>
      <li>Mark lessons complete — progress saves automatically.</li>
      <li>Apply skills in the <a href="#/case/sunshine">Sunshine case study</a>.</li>
      <li>Use the <a href="#" id="openAssist">Learning Assistant</a> whenever you're stuck.</li></ol></div>
    <div class="card"><span class="eyebrow">🧭 The 10-step journey</span><div class="pill-row">${JOURNEY.map((j,i)=>`<span class="tag ${i<3?"yellow":i<7?"blue":"green"}">${i+1}. ${j.label}</span>`).join("")}</div>
      <p class="muted" style="margin-top:10px">Discover the idea, watch a demo, follow along, practise, get checked, understand why, reflect, apply it, teach it, and review.</p></div>
  </div>
  <div class="sec-head"><div><h2>Frequently asked questions</h2></div></div>
  <div id="helpFaq">${PBI.faq.map(f=>acc(f[0],`<p>${esc(f[1])}</p>`)).join("")}</div>
  <div class="grid cols-3" style="margin-top:20px">
    <div class="card"><span class="eyebrow">♿ Accessibility</span><p class="muted" style="font-size:.9em">Use the person icon (top bar) for text size, motion, and theme. Full keyboard navigation and screen-reader labels throughout.</p></div>
    <div class="card"><span class="eyebrow">💾 Your data</span><p class="muted" style="font-size:.9em">Everything is stored privately in this browser. Nothing is uploaded. Reset anytime from the footer.</p></div>
    <div class="card"><span class="eyebrow">📥 Downloads</span><p class="muted" style="font-size:.9em">Grab the <a href="#/case/sunshine">Sunshine dataset</a>, DAX reference, and per-lesson summaries to study offline.</p></div>
  </div>`;
  $$("#helpFaq .acc > button").forEach(b=>b.addEventListener("click",()=>{ const a=b.parentElement; const open=a.classList.toggle("open"); b.setAttribute("aria-expanded",open); }));
  const oa=$("#openAssist"); if(oa) oa.addEventListener("click",e=>{ e.preventDefault(); Assistant.open(); });
});

/* ============================================================ DATA HELPERS (case study) */
function sum(col){ return PBI.dataset.reduce((a,r)=>a+r[col],0); }
function aggregate(key,val,keyFn){ const m={}; PBI.dataset.forEach(r=>{ const k=keyFn?keyFn(r[key]):r[key]; m[k]=(m[k]||0)+r[val]; }); return Object.entries(m).map(([k,v])=>({k,v})).sort((a,b)=> keyFn? a.k.localeCompare(b.k) : b.v-a.v); }

/* ============================================================ DOWNLOADS */
function toCSV(rows,cols){ const head=cols.join(","); const body=rows.map(r=>cols.map(c=>{ const v=r[c]; return /[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v; }).join(",")).join("\n"); return head+"\n"+body; }
function saveBlob(text,filename,type="text/csv"){ const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
function downloadDataset(){
  const cols=["OrderID","OrderDate","Branch","City","Customer","CustomerType","Product","ProductCategory","Quantity","UnitPrice","Cost","Discount","Sales","Profit"];
  saveBlob(toCSV(PBI.dataset,cols),"sunshine_supermarket.csv"); toast("Dataset downloaded (CSV)");
}
function downloadMiniCsv(mp){ // header-only starter with 3 example rows
  const rows=[]; for(let i=1;i<=3;i++){ const o={}; mp.fields.forEach(f=>o[f.replace(/[()\/]/g,"")]="example"+i); rows.push(o); }
  const cols=mp.fields.map(f=>f.replace(/[()\/]/g,"")); saveBlob(toCSV(rows,cols),mp.id+"_starter.csv"); toast("Starter CSV downloaded");
}
function downloadSummary(l){
  const lines=[`# ${l.t}`,``,`Module ${l.m} · ~${l.min} min`,`Prerequisite: ${l.prereq}`,``,`## Learning outcomes`,
    ...l.outcomes.map(o=>`- ${o}`),``,`## The idea`,l.concept.replace(/\*\*/g,""),``,`## Analogy — ${l.analogy.title}`,l.analogy.everyday,``,
    `## Summary`,l.summary,``,`## Common mistakes`,...l.mistakes.map(m=>`- ${m}`),``,`## Knowledge check`,l.check.q,
    ...l.check.options.map((o,i)=>`${i===l.check.answer?"[✓]":"[ ]"} ${o}`),``,`Answer: ${l.check.explain}`,``,`## Teach-back task`,l.teach,``,`— Master Power BI`];
  saveBlob(lines.join("\n"),l.id+"_summary.md","text/markdown"); toast("Summary downloaded");
}

/* ============================================================ GLOBAL SEARCH */
function buildIndex(){ const idx=[];
  PBI.allLessons.forEach(l=>idx.push({kind:"Lesson",title:l.t,sub:"Module "+l.m,href:"#/lesson/"+l.id,text:(l.t+" "+l.concept+" "+l.outcomes.join(" ")).toLowerCase()}));
  PBI.modules.forEach(m=>idx.push({kind:"Module",title:m.title,sub:m.blurb,href:"#/module/"+m.n,text:(m.title+" "+m.blurb).toLowerCase()}));
  PBI.glossary.forEach(g=>idx.push({kind:"Glossary",title:g[0],sub:g[1],href:"#/reference",text:(g[0]+" "+g[1]).toLowerCase()}));
  PBI.daxRef.forEach(d=>idx.push({kind:"DAX",title:d[2],sub:d[1],href:"#/reference",text:(d[0]+" "+d[1]+" "+d[2]).toLowerCase()}));
  PBI.faq.forEach(f=>idx.push({kind:"FAQ",title:f[0],sub:f[1].slice(0,60),href:"#/help",text:(f[0]+" "+f[1]).toLowerCase()}));
  [["Sunshine case study","#/case/sunshine"],["Practice Lab","#/lab"],["Teaching Toolkit","#/teach"],["My progress","#/progress"]].forEach(x=>idx.push({kind:"Page",title:x[0],sub:"",href:x[1],text:x[0].toLowerCase()}));
  return idx;
}
let SEARCH_INDEX=null;
function wireSearch(){
  const input=$("#globalSearch"), box=$("#searchResults");
  const run=q=>{ if(!SEARCH_INDEX) SEARCH_INDEX=buildIndex(); q=q.trim().toLowerCase(); if(!q){ box.hidden=true; return; }
    const res=SEARCH_INDEX.filter(x=>x.text.includes(q)).slice(0,10);
    box.hidden=false; box.innerHTML= res.length? res.map(r=>`<a href="${r.href}"><span class="sr-kind">${r.kind}</span><div><strong>${esc(r.title)}</strong></div><div class="muted" style="font-size:.85em">${esc(r.sub||"")}</div></a>`).join("") : `<div class="sr-empty">No results for “${esc(q)}”. Try “DAX”, “slicer” or “clean”.</div>`;
  };
  input.addEventListener("input",e=>run(e.target.value));
  input.addEventListener("focus",e=>{ if(e.target.value) run(e.target.value); });
  document.addEventListener("click",e=>{ if(!e.target.closest(".topbar-search")) box.hidden=true; });
  box.addEventListener("click",e=>{ if(e.target.closest("a")){ box.hidden=true; input.value=""; } });
}

/* ============================================================ CHROME (theme, a11y, nav, reset) */
function toggleTheme(){ Store.setSetting("theme", Store.get().settings.theme==="dark"?"light":"dark"); }
function openA11y(){
  const s=Store.get().settings; const body=$("#a11yBody");
  const segRow=(label,key,opts)=>`<div class="setting-row"><span>${label}</span><div class="seg" data-seg="${key}">${opts.map(o=>`<button data-v="${o[0]}" aria-pressed="${s[key]===o[0]}">${o[1]}</button>`).join("")}</div></div>`;
  body.innerHTML = segRow("Theme","theme",[["light","Light"],["dark","Dark"]])
    + segRow("Text size","text",[["normal","Normal"],["large","Large"],["xlarge","XL"]])
    + segRow("Motion","motion",[["full","Full"],["reduced","Reduced"]])
    + `<p class="muted" style="margin-top:12px;font-size:.85em">Preferences are saved on this device. Meaning is never shown by colour alone — icons and text always accompany it.</p>`;
  $$("[data-seg]",body).forEach(seg=>seg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; Store.setSetting(seg.dataset.seg,b.dataset.v);
    $$("button",seg).forEach(x=>x.setAttribute("aria-pressed", x===b)); }));
  $("#a11yModal").hidden=false;
}
function openNavDrawer(){ const n=$("#sidenav"); n.classList.add("open"); $("#navScrim").hidden=false; $("#navToggle").setAttribute("aria-expanded","true"); }
function closeNavDrawer(){ $("#sidenav").classList.remove("open"); $("#navScrim").hidden=true; $("#navToggle").setAttribute("aria-expanded","false"); }

function wireChrome(){
  $("#themeBtn").addEventListener("click",toggleTheme);
  $("#a11yBtn").addEventListener("click",openA11y);
  $$("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>$("#a11yModal").hidden=true));
  $("#a11yModal").addEventListener("click",e=>{ if(e.target.id==="a11yModal") $("#a11yModal").hidden=true; });
  $("#navToggle").addEventListener("click",()=>{ $("#sidenav").classList.contains("open")?closeNavDrawer():openNavDrawer(); });
  $("#navScrim").addEventListener("click",closeNavDrawer);
  $("#resetBtn").addEventListener("click",()=>{ if(confirm("Reset ALL progress, notes, bookmarks and settings? This can't be undone.")){ Store.reset(); toast("Progress reset"); location.hash="#/home"; router(); } });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(!$("#a11yModal").hidden) $("#a11yModal").hidden=true; closeNavDrawer(); } });
}

/* ============================================================ ADMIN (admins only) */
route("admin", async ()=>{
  if(!(window.Cloud && Cloud.enabled && Cloud.isAdmin())){ location.hash="#/home"; return; }
  view.innerHTML = crumbs([["Home","#/home"],["Admin",""]]) +
    `<div class="sec-head"><div><span class="eyebrow">Instructor view</span><h1>Faculty progress</h1>
      <p>Everyone who has signed in to your cohort. Progress updates automatically.</p></div>
      <button class="btn btn-ghost btn-sm" id="admExport">⬇ Export CSV</button></div>
    <div id="admCohort"><div class="card"><div class="skeleton" style="height:44px;margin-bottom:8px"></div>
      <div class="skeleton" style="height:44px;margin-bottom:8px"></div><div class="skeleton" style="height:44px"></div></div></div>
    <div class="sec-head" style="margin-top:34px"><div><span class="eyebrow">Access</span><h2>Approved faculty allowlist</h2>
      <p>Only these email addresses can sign in and learn.</p></div></div>
    <div id="admAllow" class="card"><div class="skeleton" style="height:40px"></div></div>`;

  let cohort=[];
  try{ cohort = await Cloud.listCohort(); }
  catch(e){ $("#admCohort").innerHTML = adminError("Couldn't load the cohort."); }
  renderCohort(cohort);
  loadAllow();

  function renderCohort(rows){
    const box=$("#admCohort"); if(!box) return;
    if(!rows.length){ box.innerHTML = `<div class="empty"><div class="e-emoji">🪑</div><h3>No faculty yet</h3>
      <p class="muted">When someone on the allowlist signs in, they'll appear here. Add emails below and share the link.</p></div>`; return; }
    rows.sort((a,b)=>b.pct-a.pct);
    box.innerHTML = `<div class="table-scroll"><table class="tbl"><thead><tr>
      <th>Name</th><th>Email</th><th>Progress</th><th>Lessons</th><th>Avg quiz</th><th>Readiness</th><th>Streak</th><th>Last active</th>
      </tr></thead><tbody>${rows.map(r=>{
        const m=Store.masteryLabel(r.pct||0);
        return `<tr>
          <td><b>${esc(r.name)}</b>${r.role==="admin"?' <span class="tag purple">admin</span>':''}</td>
          <td class="muted">${esc(r.email)}</td>
          <td style="min-width:130px"><div class="bar" style="margin-bottom:4px"><i style="width:${r.pct||0}%"></i></div>
            <span class="tag ${m.c}">${r.pct||0}% · ${m.t}</span></td>
          <td>${r.lessons_done||0}/${PBI.allLessons.length}</td>
          <td>${r.avg_quiz||0}%</td><td>${r.readiness||0}</td><td>🔥 ${r.streak||0}</td>
          <td class="muted">${fmtDate(r.updated_at||r.last_seen)}</td>
        </tr>`;}).join("")}</tbody></table></div>
      <p class="muted" style="margin-top:10px;font-size:.86em">${rows.length} learner${rows.length>1?"s":""} · sorted by progress</p>`;
    $("#admExport").onclick=()=>exportCohort(rows);
  }
  async function loadAllow(){
    const box=$("#admAllow"); let list=[];
    try{ list = await Cloud.listAllowed(); }catch(e){ box.innerHTML=adminError("Couldn't load the allowlist."); return; }
    box.innerHTML = `<form id="allowForm" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <input id="allowEmail" type="email" placeholder="faculty@email.com" aria-label="Email to approve"
          style="flex:1;min-width:200px;padding:.6em .9em;border-radius:999px;border:1.5px solid var(--line-2);background:var(--bg);color:var(--ink);font:inherit" required>
        <button class="btn btn-primary btn-sm" type="submit">Add to allowlist</button></form>
      ${list.length? `<div class="pill-row">${list.map(a=>`<span class="tag" style="gap:8px">${esc(a.email)}
        <button class="linklike" data-rm="${esc(a.email)}" aria-label="Remove ${esc(a.email)}" style="color:var(--red)">✕</button></span>`).join("")}</div>`
        : `<p class="muted">No emails yet. Add the first faculty member above.</p>`}`;
    $("#allowForm").onsubmit=async e=>{ e.preventDefault(); const v=$("#allowEmail").value;
      try{ await Cloud.addAllowed(v); toast("Added to allowlist"); loadAllow(); }
      catch(err){ toast(err.message||"Couldn't add that email","warn"); } };
    $$("[data-rm]").forEach(b=>b.onclick=async()=>{
      if(!confirm("Remove "+b.dataset.rm+" from the allowlist? They'll lose access on next sign-in.")) return;
      try{ await Cloud.removeAllowed(b.dataset.rm); toast("Removed"); loadAllow(); }catch(err){ toast("Couldn't remove","warn"); } });
  }
  function exportCohort(rows){
    const head=["Name","Email","Role","Progress %","Lessons done","Avg quiz %","Readiness","Streak","Last active"];
    const lines=[head.join(",")].concat(rows.map(r=>[r.name,r.email,r.role,r.pct||0,r.lessons_done||0,r.avg_quiz||0,r.readiness||0,r.streak||0,fmtDate(r.updated_at||r.last_seen)]
      .map(c=>`"${String(c==null?"":c).replace(/"/g,'""')}"`).join(",")));
    downloadFile("faculty_progress.csv", lines.join("\n"), "text/csv");
    toast("CSV exported");
  }
  function fmtDate(d){ if(!d) return "—"; try{ return new Date(d).toLocaleDateString(undefined,{day:"numeric",month:"short"}); }catch(e){ return "—"; } }
  function adminError(msg){ return `<div class="callout warn"><strong>${esc(msg)}</strong> Check your connection and refresh.</div>`; }
});

/* download helper reused by admin + case study */
function downloadFile(name, content, type){
  const blob=new Blob([content],{type:type||"text/plain"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); },100);
}

/* ============================================================ INIT */
function init(){
  wireChrome(); wireSearch(); Assistant.init();
  if(Store._error){ toast("Saving is unavailable (private mode?). Progress won't persist.","warn"); }
  if(!location.hash) location.hash="#/home";
  router();
}

/* Expose a small surface so auth.js can drive boot + refresh chrome. */
window.App = { init, router, renderNav, route, toast, esc };

/* Boot: if the auth layer is present, let it decide when to init
   (it gates on sign-in). Otherwise boot immediately (local mode). */
function boot(){ if(window.Auth && typeof Auth.start==="function") Auth.start(); else init(); }
// Defer by a tick so auth.js (the next <script>) has finished loading and
// registered window.Auth before we decide whether to gate.
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));
else setTimeout(boot,0);
})();
