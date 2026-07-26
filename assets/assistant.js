/* ============================================================
   assistant.js — the persistent Learning Assistant.
   Rule-based, offline, context-aware. Guides; never does the
   activity for the learner.
   ============================================================ */
(function () {
"use strict";

let ctx = { view:"home", lesson:null };
let hintStep = {}; // lessonId -> next hint index

const el = {
  panel:()=>document.getElementById("assistant"),
  log:()=>document.getElementById("assistantLog"),
  chips:()=>document.getElementById("assistantChips"),
  ctx:()=>document.getElementById("assistantContext"),
  input:()=>document.getElementById("assistantInput"),
  form:()=>document.getElementById("assistantForm"),
  btn:()=>document.getElementById("assistantBtn"),
  close:()=>document.getElementById("assistantClose")
};

function open(){ el.panel().classList.add("open"); el.panel().setAttribute("aria-hidden","false"); el.btn().setAttribute("aria-expanded","true"); setTimeout(()=>el.input().focus(),300); }
function close(){ el.panel().classList.remove("open"); el.panel().setAttribute("aria-hidden","true"); el.btn().setAttribute("aria-expanded","false"); el.btn().focus(); }
function toggle(){ el.panel().classList.contains("open")?close():open(); }

function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function bubble(text, who="bot"){
  const d=document.createElement("div"); d.className="msg "+who;
  // Bot text is author-controlled markup; user ("me") text is escaped to prevent injection.
  if(who==="me") d.textContent=text; else d.innerHTML=text;
  el.log().appendChild(d); el.log().scrollTop=el.log().scrollHeight;
}

function chips(list){
  const c=el.chips(); c.innerHTML="";
  list.forEach(([label,fn])=>{
    const b=document.createElement("button"); b.className="chip"; b.type="button"; b.textContent=label;
    b.addEventListener("click",()=>fn()); c.appendChild(b);
  });
}

/* -------- context setting (called by router) -------- */
function setContext(view, lessonId){
  ctx = { view, lesson: lessonId? PBI.lessonById[lessonId]:null };
  const c = el.ctx();
  if(ctx.lesson){
    c.textContent = `You're on “${ctx.lesson.t}”. Ask me to explain it, simplify a term, or nudge you with a hint.`;
    setLessonChips();
  } else {
    c.textContent = viewBlurb(view);
    setGeneralChips();
  }
}
function viewBlurb(v){
  const map={ home:"I'm here whenever you're stuck. Try a chip below.",
    modules:"Browsing modules? Ask me which to start or what a term means.",
    lab:"In the lab, ask for a hint before peeking at solutions.",
    cases:"Working the case study? Ask me how to phrase an insight.",
    assess:"Taking a quiz? I can explain a concept, but I won't hand you answers.",
    reference:"Ask me to simplify any glossary term.",
    teach:"Preparing to teach? Ask for an analogy you can reuse.",
    paths:"Not sure where to begin? Ask me to recommend a path." };
  return map[v] || "Ask me anything about what you're looking at.";
}

function setLessonChips(){
  const l=ctx.lesson;
  chips([
    ["Explain this", ()=>explainConcept()],
    ["Another analogy", ()=>anotherAnalogy()],
    ["Give me a hint", ()=>giveHint()],
    ["Simplify a term", ()=>{ bubble("Which term? Type it, e.g. <em>filter context</em>."); el.input().focus(); }],
    ["Help me reflect", ()=>reflectPrompt()],
    ["What should I review?", ()=>recommendReview()]
  ]);
}
function setGeneralChips(){
  chips([
    ["Where do I start?", ()=>bubble("Take the 2-minute diagnostic on <strong>Learning Paths</strong> — it recommends Beginner, Intermediate, or Faculty. You can switch anytime.")],
    ["Explain Power BI simply", ()=>{ const a=PBI.analogies.powerbi; bubble("<strong>"+a.title+":</strong> "+a.child); }],
    ["Ask me a question", ()=>practiceQuestion()],
    ["Define a term", ()=>{ bubble("Type any term (e.g. <em>measure</em>, <em>slicer</em>) and I'll define it plainly."); el.input().focus(); }]
  ]);
}

/* -------- intents -------- */
function explainConcept(){
  const l=ctx.lesson; if(!l) return bubble("Open a lesson and I'll explain its concept.");
  bubble("<strong>"+l.t+"</strong><br>"+l.concept.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"));
  bubble("Want it another way? Tap <em>Another analogy</em>.");
}
function anotherAnalogy(){
  const l=ctx.lesson; const a = l? l.analogy : PBI.analogies.powerbi;
  if(!a) return bubble("Here's the kitchen idea: "+PBI.analogies.powerbi.everyday);
  const order=["child","everyday","professional","visual"];
  anotherAnalogy._i = ((anotherAnalogy._i||0)+1)%order.length;
  const k=order[anotherAnalogy._i];
  const label={child:"Child-friendly",everyday:"Everyday",professional:"Professional",visual:"Visual"}[k];
  bubble("<strong>"+label+" — "+a.title+":</strong><br>"+ (k==="visual"? "<code>"+a.visual.replace(/\n/g,"<br>")+"</code>" : a[k]));
}
function giveHint(){
  const l=ctx.lesson;
  if(!l || !l.practice || !l.hints) return bubble("Hints live inside a lesson's Practise step. Open a lesson first.");
  const i = hintStep[l.id]||0;
  if(i>=l.hints.length){ bubble("That was the full solution — now try it yourself. You've got this. 💪"); return; }
  const labels=["Hint 1 (small clue)","Hint 2 (stronger)","Hint 3 (full steps)"];
  bubble("<strong>"+labels[i]+":</strong> "+l.hints[i]);
  hintStep[l.id]=i+1;
  if(i<l.hints.length-1) bubble("Try again before the next hint — attempting first is how it sticks.");
}
function simplifyTerm(term){
  const g = PBI.glossary.find(x=>x[0].toLowerCase()===term.toLowerCase() || x[0].toLowerCase().includes(term.toLowerCase()));
  if(g){ bubble("<strong>"+g[0]+":</strong> "+g[1]+" <span class='muted'>(see: "+g[2]+")</span>"); return true; }
  const a = Object.values(PBI.analogies).find(x=>x.title.toLowerCase().includes(term.toLowerCase()));
  if(a){ bubble("<strong>"+a.title+":</strong> "+a.everyday); return true; }
  return false;
}
function explainError(msg){
  const known=[
    [/circular|self.?refer/i,"A circular dependency means a calculation refers back to itself. Break the loop — often a calculated column trying to use a measure that uses it."],
    [/relationship|both direction|ambiguous/i,"Ambiguous or missing relationship. Check Model view: is there exactly one active bridge on the right key?"],
    [/can.?t.?convert|type|text.*number/i,"A type problem — a column loaded as text. Fix it in Power Query: set it to Number or Date before loading."],
    [/blank|empty|0 rows/i,"Blank results usually mean a filter removed everything, or a relationship isn't carrying the filter. Check your slicers and the bridge."],
    [/divide|infinity|div\/0/i,"Divide-by-zero. Use DIVIDE(numerator, denominator) instead of / so it returns blank, not an error."]
  ];
  for(const [re,ans] of known) if(re.test(msg)) { bubble("<strong>Likely cause:</strong> "+ans); return true; }
  return false;
}
function recommendReview(){
  // suggest lowest module + any flagged review lessons
  const weak = PBI.modules.map(m=>({m, p:Store.moduleProgress(m.n)}))
    .filter(x=>x.p.pct<100).sort((a,b)=>a.p.pct-b.p.pct)[0];
  const quizWeak = Object.entries(Store.get().quiz).filter(([k,q])=>q.best<80).map(([k])=>k);
  let msg="<strong>Your review plan:</strong><br>";
  if(weak) msg+="• Continue <em>"+weak.m.title+"</em> ("+weak.p.pct+"% done).<br>";
  if(quizWeak.length) msg+="• Retake quizzes below 80%: "+quizWeak.join(", ")+".<br>";
  const ms=Store.get().mistakes.length; if(ms) msg+="• Revisit your Mistake Journal ("+ms+" entries).";
  if(!weak && !quizWeak.length && !ms) msg="You're in great shape — nothing flagged for review. Try a case study or a teach-back. 🎉";
  bubble(msg);
}
function reflectPrompt(){
  const l=ctx.lesson;
  const prompts=[
    "In one sentence, what's the single most important idea here?",
    "Where would this trip up a beginner, and how would you warn them?",
    "Explain this to someone who's never seen a spreadsheet.",
    "What question could you now answer that you couldn't before?"
  ];
  const p = l ? "For <strong>"+l.t+"</strong>: "+prompts[Math.floor(Store.completedCount())%prompts.length] : prompts[0];
  bubble(p+" <br><span class='muted'>Type your answer — I'll respond to your thinking, not grade it.</span>");
  reflectPrompt._await=true;
}
function practiceQuestion(){
  const l=ctx.lesson;
  const pool = l && l.check ? [l.check] : PBI.allLessons.map(x=>x.check).filter(Boolean);
  const q = pool[Math.floor((Store.completedCount()+ (practiceQuestion._n=(practiceQuestion._n||0)+1))%pool.length)];
  practiceQuestion._q=q;
  bubble("<strong>Quick check:</strong> "+q.q+"<br>"+q.options.map((o,i)=>"<em>"+String.fromCharCode(65+i)+")</em> "+o).join("<br>")+"<br><span class='muted'>Reply with a letter.</span>");
}

/* -------- free text handling -------- */
function handle(text){
  const t=text.trim(); if(!t) return;
  bubble(text,"me");
  const low=t.toLowerCase();

  // answering a practice question by letter
  if(practiceQuestion._q && /^[a-d]\)?$/i.test(t)){
    const q=practiceQuestion._q; const pick=low.charCodeAt(0)-97;
    if(pick===q.answer) bubble("✅ Correct! "+q.explain);
    else bubble("Not quite. The answer is <strong>"+String.fromCharCode(65+q.answer)+"</strong>. "+q.explain);
    practiceQuestion._q=null; return;
  }
  // reflection reply
  if(reflectPrompt._await){
    reflectPrompt._await=false;
    const wc=t.split(/\s+/).length;
    if(wc<6) bubble("Good start — push it further. Add a <em>why</em> or an example so the idea locks in.");
    else bubble("Nice reflection. Putting it in your own words is exactly how understanding sticks. Save it in the lesson's Reflect box too. 👍");
    return;
  }

  if(/^(hi|hello|hey)\b/.test(low)) return bubble("Hello! Ask me to explain the current lesson, simplify a term, or give a hint.");
  if(/hint/.test(low)) return giveHint();
  if(/analog/.test(low)) return anotherAnalogy();
  if(/reflect/.test(low)) return reflectPrompt();
  if(/review|revise|weak/.test(low)) return recommendReview();
  if(/(ask|quiz|test) me|question/.test(low)) return practiceQuestion();
  if(/explain (this|the concept|it)|what is this lesson/.test(low)) return explainConcept();
  if(/error|won.?t work|broken|wrong|not working/.test(low)){ if(explainError(low)) return; }

  // "simplify X" / "what is X" / "define X"
  const m = low.match(/(?:simplify|what.?s|what is|define|explain)\s+(.+)/);
  if(m){ if(simplifyTerm(m[1].replace(/[?.!]/g,""))) return; }
  // bare term lookup
  if(simplifyTerm(t.replace(/[?.!]/g,""))) return;

  // fallback
  bubble("I can <strong>explain</strong> this lesson, give a <strong>hint</strong>, offer <strong>another analogy</strong>, <strong>simplify a term</strong>, help you <strong>reflect</strong>, or <strong>recommend review</strong>. Which would help?");
}

/* -------- init -------- */
function init(){
  el.btn().addEventListener("click", toggle);
  el.close().addEventListener("click", close);
  el.form().addEventListener("submit", e=>{ e.preventDefault(); const v=el.input().value; el.input().value=""; handle(v); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && el.panel().classList.contains("open")) close(); });
  bubble("👋 I'm your Learning Assistant. I guide and hint — I won't do the activity for you. Tap a chip or type a question.");
  setContext("home");
}

window.Assistant = { init, setContext, open, hintReset:(id)=>{ hintStep[id]=0; } };
})();
