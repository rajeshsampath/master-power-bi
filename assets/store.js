/* ============================================================
   store.js — private, offline progress store (localStorage).
   Everything stays on the learner's device.
   ============================================================ */
(function () {
"use strict";
const KEY = "pbi_master_v1";

const defaults = () => ({
  path: null,                 // chosen learning path id
  diagnostic: null,           // {scores, recommended, date}
  completed: {},              // lessonId -> ISO date
  lessonState: {},            // lessonId -> {reflect, teach, practiceDone, checkPass}
  notes: {},                  // lessonId -> string
  bookmarks: [],              // lessonIds
  recent: [],                 // lessonIds most-recent-first
  lastLesson: null,
  quiz: {},                   // "module-N" or "diagnostic" -> {best, attempts}
  mistakes: [],               // {text, lesson, date}
  checklist: {},              // key -> bool
  caseSteps: {},              // stepIndex -> bool
  teachbacks: 0,
  streak: { count:0, last:null },
  settings: { theme:"light", text:"normal", motion:"full" },
  createdAt: new Date().toISOString()
});

let state;
function load(){
  try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); }
  catch(e){ state = defaults(); }
  // ensure nested objects exist after merge
  const d = defaults();
  for (const k in d) if (typeof d[k] === "object" && d[k] && !Array.isArray(d[k]) && !state[k]) state[k] = d[k];
  state.settings = Object.assign(d.settings, state.settings||{});
  state.streak = Object.assign(d.streak, state.streak||{});
}
load();

let saveTimer=null;
function persist(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ Store._error=true; } }, 120);
}

/* streak logic */
function touchStreak(){
  const today = new Date().toISOString().slice(0,10);
  const last = state.streak.last;
  if (last === today) return;
  const y = new Date(Date.now()-864e5).toISOString().slice(0,10);
  state.streak.count = (last === y) ? state.streak.count + 1 : 1;
  state.streak.last = today;
  persist();
}

const Store = {
  _error:false,
  get(){ return state; },
  save(){ persist(); },

  setPath(id){ state.path = id; persist(); },
  setDiagnostic(res){ state.diagnostic = res; if(res && res.recommended && !state.path) state.path=res.recommended; persist(); },

  isDone(id){ return !!state.completed[id]; },
  complete(id, done=true){
    if(done){ state.completed[id] = new Date().toISOString(); touchStreak(); }
    else delete state.completed[id];
    persist();
  },
  completedCount(){ return Object.keys(state.completed).length; },

  lesson(id){ return state.lessonState[id] || (state.lessonState[id]={}); },
  setLesson(id, patch){ state.lessonState[id] = Object.assign(this.lesson(id), patch); persist(); },

  note(id){ return state.notes[id] || ""; },
  setNote(id, v){ state.notes[id]=v; persist(); },

  toggleBookmark(id){
    const i = state.bookmarks.indexOf(id);
    if(i>=0) state.bookmarks.splice(i,1); else state.bookmarks.push(id);
    persist(); return i<0;
  },
  isBookmarked(id){ return state.bookmarks.includes(id); },

  visit(id){
    state.lastLesson = id;
    state.recent = [id, ...state.recent.filter(x=>x!==id)].slice(0,6);
    touchStreak(); persist();
  },

  recordQuiz(key, pct){
    const q = state.quiz[key] || {best:0, attempts:0};
    q.attempts++; q.best = Math.max(q.best, pct); q.last = pct;
    state.quiz[key]=q; touchStreak(); persist(); return q;
  },
  quizBest(key){ return state.quiz[key] ? state.quiz[key].best : null; },

  addMistake(text, lesson){
    state.mistakes.unshift({ text, lesson: lesson||null, date:new Date().toISOString() });
    state.mistakes = state.mistakes.slice(0,50); persist();
  },
  removeMistake(i){ state.mistakes.splice(i,1); persist(); },

  setCheck(key,v){ state.checklist[key]=v; persist(); },
  setCaseStep(i,v){ state.caseSteps[i]=v; persist(); },
  addTeachback(){ state.teachbacks++; persist(); },

  setSetting(k,v){ state.settings[k]=v; persist(); applySettings(); },

  reset(){ state = defaults(); persist(); applySettings(); },

  /* derived helpers */
  moduleProgress(modN){
    const mod = PBI.modules.find(m=>m.n===modN); if(!mod) return {done:0,total:0,pct:0};
    const total = mod.lessons.length;
    const done = mod.lessons.filter(l=>Store.isDone(l.id)).length;
    return { done, total, pct: total? Math.round(done/total*100):0 };
  },
  overallProgress(){
    const total = PBI.allLessons.length;
    const done = Store.completedCount();
    return { done, total, pct: total? Math.round(done/total*100):0 };
  },
  masteryLabel(pct){
    if(pct==null) return {t:"Not started", c:"muted", dot:"var(--line-2)"};
    if(pct<60) return {t:"Review recommended", c:"red", dot:"var(--red)"};
    if(pct<80) return {t:"Developing", c:"yellow", dot:"var(--yellow-deep)"};
    if(pct<90) return {t:"Proficient", c:"blue", dot:"var(--blue)"};
    return {t:"Mastered", c:"green", dot:"var(--green)"};
  },
  earnedBadges(){
    const b=[]; const done=id=>Store.isDone(id);
    if(Store.completedCount()>=1) b.push("first_step");
    if(Store.moduleProgress(4).pct===100) b.push("clean_slate");
    if(Store.moduleProgress(5).pct===100) b.push("bridge_builder");
    if(Store.moduleProgress(6).pct===100) b.push("dax_apprentice");
    if(Store.moduleProgress(7).pct===100) b.push("chart_whisperer");
    if(Object.values(state.caseSteps).filter(Boolean).length>=12) b.push("case_closed");
    if(state.streak.count>=3) b.push("streak_3");
    if(Object.values(state.quiz).some(q=>q.best>=90)) b.push("quiz_ace");
    if(Store.moduleProgress(12).pct===100 && state.teachbacks>=5) b.push("teacher");
    if(Store.overallProgress().pct===100) b.push("finisher");
    return b;
  },
  facultyReadiness(){
    // weighted blend: progress 45, quizzes 30, teachbacks 15, case 10
    const prog = Store.overallProgress().pct * .45;
    const quizVals = Object.values(state.quiz).map(q=>q.best);
    const quiz = (quizVals.length? quizVals.reduce((a,b)=>a+b,0)/quizVals.length : 0) * .30;
    const tb = Math.min(1, state.teachbacks/6) * 100 * .15;
    const cs = Math.min(1, Object.values(state.caseSteps).filter(Boolean).length/12) * 100 * .10;
    return Math.round(prog+quiz+tb+cs);
  }
};

function applySettings(){
  const s = state.settings;
  const root = document.documentElement;
  root.setAttribute("data-theme", s.theme);
  root.setAttribute("data-text", s.text);
  root.setAttribute("data-motion", s.motion);
  const tb = document.getElementById("themeBtn");
  if(tb) tb.setAttribute("aria-label", s.theme==="dark"?"Switch to light mode":"Switch to dark mode");
}
// respect OS preferences on very first run
(function firstRun(){
  if(!localStorage.getItem(KEY)){
    if(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) state.settings.theme="dark";
    if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) state.settings.motion="reduced";
  }
})();
applySettings();

window.Store = Store;
window.applySettings = applySettings;
})();
