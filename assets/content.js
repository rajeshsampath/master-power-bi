/* ============================================================
   content.js — all curriculum, reference & case-study data.
   Exposed as window.PBI. No network, no placeholders.
   ============================================================ */
(function () {
"use strict";

/* ---------- navigation ---------- */
const nav = [
  { id:"home",      label:"Home",             icon:"home" },
  { id:"learning",  label:"My Learning",      icon:"book" },
  { id:"paths",     label:"Learning Paths",   icon:"route" },
  { id:"modules",   label:"Course Modules",   icon:"grid" },
  { id:"lab",       label:"Practice Lab",     icon:"flask" },
  { id:"cases",     label:"Case Studies",     icon:"chart" },
  { id:"assess",    label:"Assessments",      icon:"check" },
  { id:"teach",     label:"Teaching Toolkit", icon:"teach" },
  { id:"reference", label:"Reference Library",icon:"library" },
  { id:"progress",  label:"Progress",         icon:"trophy" },
  { id:"help",      label:"Help",             icon:"help" }
];

/* ---------- learning paths ---------- */
const paths = {
  beginner: {
    id:"beginner", name:"Beginner", emoji:"🌱", color:"green",
    tagline:"No experience needed. Small steps, extra guidance, plain language.",
    forWho:"You have never opened Power BI, or numbers make you nervous.",
    hours:"6–8 hours", modules:[1,2,3,4,5,6,7],
    promise:"By the end you can import data, clean it, and build a simple chart you understand."
  },
  intermediate: {
    id:"intermediate", name:"Intermediate", emoji:"📊", color:"blue",
    tagline:"You know the basics and want to build a full, interactive report.",
    forWho:"You can already load data and make a chart, but relationships and DAX feel fuzzy.",
    hours:"8–10 hours", modules:[5,6,7,8,9,10,11],
    promise:"By the end you can model data, write core DAX, and ship a management dashboard."
  },
  faculty: {
    id:"faculty", name:"Faculty Mastery", emoji:"🎓", color:"yellow",
    tagline:"Prepare to teach Power BI: lesson plans, demos, and teach-back assessments.",
    forWho:"You will stand in front of students and need to explain, not just do.",
    hours:"12–15 hours", modules:[1,2,3,4,5,6,7,8,9,10,11,12],
    promise:"By the end you can run a class, answer student questions, and assess with confidence."
  }
};

/* ---------- diagnostic (path recommender) ---------- */
const diagnostic = [
  { q:"Have you ever opened Power BI Desktop before?",
    a:[{t:"Never — what is it?",s:{beginner:2}},{t:"Once or twice",s:{beginner:1,intermediate:1}},{t:"I use it regularly",s:{intermediate:2,faculty:1}}] },
  { q:"You need to combine a Sales table and a Products table so a chart can use both. What connects them?",
    a:[{t:"A relationship on a shared key",s:{intermediate:2,faculty:1}},{t:"Copy-paste the columns together",s:{beginner:2}},{t:"I'm not sure",s:{beginner:2}}] },
  { q:"What does a DAX measure like Total Sales = SUM(Sales[Sales]) do?",
    a:[{t:"Adds up the Sales column, respecting filters",s:{intermediate:2,faculty:1}},{t:"Creates a new column",s:{beginner:1,intermediate:1}},{t:"No idea",s:{beginner:2}}] },
  { q:"Your goal for this toolkit is mainly to…",
    a:[{t:"Learn Power BI for myself",s:{beginner:1,intermediate:1}},{t:"Build real reports at work",s:{intermediate:2}},{t:"Teach Power BI to students",s:{faculty:3}}] },
  { q:"How comfortable are you cleaning messy data (blanks, wrong types, duplicates)?",
    a:[{t:"Not at all",s:{beginner:2}},{t:"Somewhat",s:{intermediate:2}},{t:"Very — I do it often",s:{faculty:1,intermediate:1}}] },
  { q:"Could you explain a slicer to a 12-year-old right now?",
    a:[{t:"No",s:{beginner:2}},{t:"Maybe, roughly",s:{intermediate:2}},{t:"Yes, with an analogy",s:{faculty:3}}] }
];

/* ---------- concept analogies ("Explain it another way") ---------- */
const analogies = {
  powerbi:{ title:"What Power BI is",
    child:"Power BI is like a magic kitchen. You put in raw food (data) and it cooks a beautiful meal (a chart) that everyone can enjoy.",
    everyday:"Think of a busy home cook: ingredients arrive messy, get washed and chopped, follow a recipe, and become a plated dish. Power BI does the same for numbers.",
    professional:"Power BI is a business-intelligence platform that connects to data sources, transforms and models data, and renders interactive visual reports for decision-making.",
    visual:"RAW DATA ──▶ [ CLEAN ] ──▶ [ MODEL ] ──▶ [ CALCULATE ] ──▶ 📊 REPORT" },
  powerquery:{ title:"Power Query",
    child:"Power Query is the sink where you wash the vegetables before cooking.",
    everyday:"Before you cook, you rinse, peel, and chop. Power Query rinses out blanks, fixes spellings, and slices data into tidy columns — and remembers every step.",
    professional:"Power Query is Power BI's ETL layer: a step-recorded transformation engine (M language) that shapes source data before it loads to the model.",
    visual:"messy list ─▶ [ remove blanks ▸ fix types ▸ trim text ] ─▶ tidy table" },
  model:{ title:"The data model",
    child:"It's like organising your recipe cards so you can always find the one you need.",
    everyday:"Imagine two address books — one for orders, one for products. A relationship is the bridge so you can look up a product's category from an order.",
    professional:"A data model is a set of tables linked by relationships (usually one-to-many on keys), enabling filters to flow and measures to aggregate across tables.",
    visual:"Sales[ProductID] ──many──▶ ──one── Products[ProductID]" },
  dax:{ title:"DAX",
    child:"DAX is the recipe maths — how many spoons of sugar for how many people.",
    everyday:"When a recipe says 'per person', it recalculates as guests arrive. DAX measures recalculate as you click filters and slicers.",
    professional:"DAX (Data Analysis Expressions) is a formula language for measures and calculated columns, evaluated within filter and row contexts.",
    visual:"Total Sales = SUM( Sales[Sales] )   // recalculates per filter" },
  slicer:{ title:"A slicer",
    child:"A slicer is a TV remote. Press a button and the screen changes.",
    everyday:"Like choosing a channel, a slicer lets the reader pick a branch or month, and every chart updates to match.",
    professional:"A slicer is an on-canvas filter control that sets filter context for other visuals in the report page.",
    visual:"[ Delhi | Mumbai | Chennai ] ──filters──▶ all charts" },
  relationship:{ title:"A relationship",
    child:"A relationship is a bridge connecting two islands so people can visit.",
    everyday:"Two lists sit apart until you build a bridge on a shared column — then answers can walk across.",
    professional:"A relationship joins tables on a key column; the cross-filter direction determines how filters propagate.",
    visual:"Orders ══bridge══ Products   (shared key: ProductID)" },
  publish:{ title:"Publishing",
    child:"Publishing is putting your finished book on the library shelf so friends can read it.",
    everyday:"You wrote the report on your desk; publishing puts it in a shared library (the Power BI Service) with a lock on who may open it.",
    professional:"Publishing uploads the .pbix to the Power BI Service into a workspace, where access is governed by roles and row-level security.",
    visual:"Desktop (.pbix) ──publish──▶ Library (Service) 🔒 permissions" }
};

/* ---------- lesson factory helpers (kept explicit for clarity) ---------- */
const L = (o) => o; // identity, for readable authoring

/* ============================================================
   MODULES + LESSONS  (real, self-contained content)
   ============================================================ */
const modules = [
{ n:1, title:"Understanding Power BI", emoji:"🔎", blurb:"What Power BI is, why it exists, and the journey data takes.", lessons:[
  L({ id:"m1l1", m:1, t:"What is Power BI, really?", min:12, level:["beginner","intermediate","faculty"],
    prereq:"None. If you can open a web page, you can start here.",
    outcomes:["Describe what Power BI does in one sentence","Name the four stages data passes through","Explain Power BI to a beginner using the kitchen analogy"],
    concept:"Power BI is a tool that turns raw data into interactive charts and dashboards that help people make decisions. You connect to data (a spreadsheet, a database), clean and organise it, add calculations, and then draw visuals that update the moment someone clicks a filter. The magic is that everything is *connected*: change one filter and every chart responds.",
    analogyKey:"powerbi",
    visual:"THE POWER BI KITCHEN\n\n  🥕 Raw data      →  ingredients arrive messy\n  🚰 Power Query   →  wash & chop (clean)\n  📇 Data model    →  organise the recipe (relationships)\n  🧮 DAX           →  do the maths (measures)\n  🍽️ Visuals       →  plate the meal (report)",
    demo:{ steps:[
      {label:"Step 1 — The problem", visual:"Manager: \"Which branch sold the most last month?\"\n\nRaw file: 6,000 rows of orders 😵", caption:"Every dashboard starts with a real question someone needs answered."},
      {label:"Step 2 — Connect", visual:"Home ▸ Get data ▸ Excel\n → Sales.xlsx loaded (6,000 rows)", caption:"We point Power BI at the data. Nothing is changed yet — just connected."},
      {label:"Step 3 — Shape & model", visual:"Power Query removes 42 blank rows.\nRelationship: Sales ⇄ Branches", caption:"We tidy the ingredients and connect related tables."},
      {label:"Step 4 — The answer", visual:"📊 Sales by Branch\n Delhi   ████████████ 1.9M\n Mumbai  █████████    1.4M\n Chennai ███████      1.1M", caption:"One clear chart answers the manager's question in seconds."}
    ], transcript:[
      "A manager asks which branch sold the most last month.",
      "The raw file has 6,000 rows — impossible to read by eye.",
      "We connect Power BI to the file using Get data.",
      "Power Query removes blank rows and we link Sales to Branches.",
      "A single bar chart shows Delhi on top. Question answered."
    ]},
    follow:[
      "Open Power BI Desktop (free download from Microsoft).",
      "Notice the three view icons on the left: Report, Table, Model.",
      "Click each one and read the tooltip that appears.",
      "You have just met the three rooms of the Power BI kitchen."
    ],
    practice:{ type:"mcq", q:"A colleague says 'Power BI is just Excel with nicer charts.' What is the most accurate correction?",
      options:["It connects, cleans, models, and visualises data — and everything updates interactively when filtered","It is only for making pie charts","It cannot open Excel files","It replaces the need for any data at all"],
      answer:0,
      explainCorrect:"Right. The interactivity and the clean→model→calculate pipeline are what make it more than charts.",
      explainWrong:"Not quite. The key idea is the connected pipeline (clean → model → calculate → visualise) plus interactivity." },
    hints:[
      "Think about what happens *before* the chart appears.",
      "Excel charts are static pictures; Power BI charts respond to clicks. What else does Power BI do that a chart alone doesn't?",
      "The full answer: Power BI connects to data, cleans it (Power Query), models it (relationships), calculates (DAX), and visualises it — all interactive. So the right option is the first one."
    ],
    mistakes:["Thinking Power BI stores your data — it mostly connects to it.","Believing you must know coding first — you don't to begin.","Skipping the cleaning stage and wondering why charts look wrong."],
    check:{ q:"Which is the correct order of the Power BI journey?",
      options:["Visualise → Clean → Connect → Model","Connect → Clean → Model → Calculate → Visualise","Model → Visualise → Connect → Clean","Calculate → Connect → Visualise → Clean"],
      answer:1, explain:"Data is connected, cleaned in Power Query, modelled with relationships, calculated with DAX, then visualised." },
    summary:"Power BI is a kitchen: raw data in, interactive dashboard out. The stages are Connect → Clean → Model → Calculate → Visualise, and everything stays connected so filters ripple through every chart.",
    teach:"In 3 sentences, explain to a beginner what Power BI is using a food/kitchen analogy of your own. Avoid the word 'data' more than once.",
    apply:"Sunshine Supermarket's manager has 4 branches and one big messy sales file. Everything you learn here will build toward answering their real questions.",
    reviewIf:["m1l1"] }),
  L({ id:"m1l2", m:1, t:"Reports, dashboards & the Power BI family", min:10, level:["beginner","faculty"],
    prereq:"Lesson 1.1 — What is Power BI.",
    outcomes:["Tell a report apart from a dashboard","Name the three main Power BI products","Choose the right tool for a task"],
    concept:"People say 'dashboard' for everything, but the words have meanings. Power BI **Desktop** is the free app where you build. The Power BI **Service** is the website where you publish and share. Power BI **Mobile** views reports on a phone. Inside those, a **report** can have many pages of detailed visuals, while a **dashboard** (in the Service) is a single-screen pinned summary.",
    analogyKey:"publish",
    visual:"THE FAMILY\n\n  🖥️  Desktop  — the kitchen where you cook (build)\n  ☁️  Service  — the library where you shelve & share\n  📱  Mobile   — reading the book on the go\n\n  Report    = a multi-page magazine\n  Dashboard = the single-page front cover (Service only)",
    demo:{ steps:[
      {label:"Desktop", visual:"You build here.\n[Report view] [Data view] [Model view]\nSave as: SunshineSales.pbix", caption:"Desktop is free and where all building happens."},
      {label:"Publish", visual:"Home ▸ Publish ▸ choose Workspace\n → uploaded to the Service ☁️", caption:"Publishing sends your file to the shared library."},
      {label:"Pin to dashboard", visual:"Report visual ▸ 📌 Pin\n → appears on 'Store Ops' dashboard", caption:"A dashboard collects pinned tiles from one or more reports."},
      {label:"Share", visual:"Share ▸ enter names ▸ set 'Can view'", caption:"Permissions decide who may open the book."}
    ], transcript:[
      "Desktop is the free building app; you save .pbix files.",
      "Publish uploads the report to the Power BI Service.",
      "In the Service you pin visuals to a single-page dashboard.",
      "Sharing controls who can view, using permissions."
    ]},
    follow:[
      "Say out loud: Desktop = build, Service = share, Mobile = view.",
      "Point at a report you've seen and ask: is this multi-page (report) or one summary screen (dashboard)?",
      "Write one sentence naming which product you'd use to *build* vs *share*."
    ],
    practice:{ type:"mcq", q:"Your principal wants a single screen with the 4 top numbers, viewable on a phone in the corridor. What is that, and where does it live?",
      options:["A report, built in Desktop","A dashboard, in the Power BI Service","A spreadsheet, in Excel","A slicer, in Mobile"],
      answer:1, explainCorrect:"Yes — a single pinned summary screen is a dashboard, and dashboards live in the Service.",
      explainWrong:"A single-screen pinned summary is a *dashboard*, and dashboards are created in the Power BI Service." },
    hints:["Single screen + phone = which of the two words?","Reports are multi-page; dashboards are one pinned screen and exist only in the Service.","Answer: a dashboard, in the Power BI Service."],
    mistakes:["Calling every report a 'dashboard'.","Thinking you build dashboards in Desktop — you pin them in the Service.","Assuming Mobile is a separate build tool — it only views."],
    check:{ q:"Where do you BUILD a Power BI report?",
      options:["Power BI Service (website)","Power BI Desktop (free app)","Power BI Mobile","Excel Online"], answer:1,
      explain:"Building happens in the free Desktop app; the Service is for publishing and sharing." },
    summary:"Desktop builds, the Service shares, Mobile views. A report is a multi-page magazine; a dashboard is a single pinned summary screen that lives only in the Service.",
    teach:"Draw a simple 3-box diagram (Desktop → Service → Mobile) and write one caption per box as if for a student handout.",
    apply:"You'll build Sunshine's report in Desktop, then in the final module publish it and decide who may view it.",
    reviewIf:["m1l1"] })
]},

{ n:2, title:"Navigating Power BI Desktop", emoji:"🧭", blurb:"Find your way around the three views, the ribbon, and the panes.", lessons:[
  L({ id:"m2l1", m:2, t:"The three views & the panes", min:12, level:["beginner","intermediate","faculty"],
    prereq:"Module 1.",
    outcomes:["Switch between Report, Table and Model views","Identify the Fields, Visualizations and Filters panes","Know where each task happens"],
    concept:"Power BI Desktop has three 'rooms' you switch with icons on the left edge. **Report view** is the canvas where you draw charts. **Table (Data) view** is a spreadsheet-like look at your loaded data. **Model view** shows tables as boxes you connect with relationship lines. On the right sit three panes: **Fields** (your columns and measures), **Visualizations** (chart types and where fields go), and **Filters**.",
    analogyKey:"powerbi",
    visual:"DESKTOP MAP\n\n  Left icons:  📊 Report   ▦ Table   🔗 Model\n\n  Right panes: [Filters] [Visualizations] [Fields]\n                             │            │\n                       chart types    your columns",
    demo:{ steps:[
      {label:"Report view", visual:"📊 Blank canvas.\nRight: Visualizations pane full of chart icons.", caption:"This is where you drag fields to create charts."},
      {label:"Table view", visual:"▦ Sales table shown row by row, like Excel.", caption:"Use this to check the actual data that loaded."},
      {label:"Model view", visual:"🔗 [Sales] ── line ── [Branches]", caption:"Here you see and create relationships between tables."},
      {label:"Fields pane", visual:"Fields:\n ▸ Sales (Amount, Qty…)\n ▸ Branches (City, Region…)", caption:"Every table and column lives here, ready to drag."}
    ], transcript:[
      "Three icons on the left switch between Report, Table and Model views.",
      "Report view is the drawing canvas.",
      "Table view shows loaded data like a spreadsheet.",
      "Model view shows relationships as connecting lines.",
      "The Fields pane on the right lists all tables and columns."
    ]},
    follow:[
      "Locate the three view icons on the left edge.",
      "Click Report, then Table, then Model, watching the screen change.",
      "On the right, find Fields, Visualizations and Filters.",
      "Say which room you'd use to: draw a chart / check the data / connect tables."
    ],
    practice:{ type:"mcq", q:"You want to check whether the Order Date column loaded as real dates or as text. Which view?",
      options:["Report view","Table (Data) view","Model view","Filters pane"],
      answer:1, explainCorrect:"Correct — Table view shows the actual loaded values and their data type.",
      explainWrong:"To inspect the actual loaded values, use Table (Data) view — it shows data row by row with types." },
    hints:["You want to *see the actual values*, not a chart or a relationship.","Report = charts, Model = relationships. Which one shows rows of data?","Answer: Table (Data) view."],
    mistakes:["Hunting for relationships in Report view — they live in Model view.","Confusing the Fields pane (your columns) with the Visualizations pane (chart types).","Thinking Table view is where you build charts."],
    check:{ q:"Which pane lists all your tables and columns ready to drag onto a chart?",
      options:["Filters","Visualizations","Fields","Ribbon"], answer:2,
      explain:"The Fields pane holds every table, column and measure you can drag." },
    summary:"Three views: Report (draw), Table (inspect data), Model (connect). Three panes: Fields (columns), Visualizations (chart types), Filters. Knowing which room a task belongs to saves hours.",
    teach:"Give a student a 4-line 'map of Desktop' cheat-sheet: one line per view plus one line for the Fields pane.",
    apply:"You'll live in Report view building Sunshine's charts, hop to Model view to link tables, and check Table view when numbers look odd.",
    reviewIf:["m2l1"] })
]},

{ n:3, title:"Importing data", emoji:"📥", blurb:"Get data from Excel, CSV and folders — the right way.", lessons:[
  L({ id:"m3l1", m:3, t:"Get Data: your first import", min:14, level:["beginner","intermediate","faculty"],
    prereq:"Module 2.",
    outcomes:["Use Get Data to connect to a file","Preview data before loading","Choose Load vs Transform"],
    concept:"Everything begins with **Get Data**. You pick a source (Excel, CSV, a database, the web), Power BI previews it, and you decide: **Load** (bring it in as-is) or **Transform Data** (open Power Query to clean first). For anything real, choose Transform — you almost always need to tidy something.",
    analogyKey:"powerbi",
    visual:"GET DATA FLOW\n\n Home ▸ Get data ▸ Excel\n        │\n   [Navigator preview] ── tick the tables you want\n        │\n   ┌────────────┬──────────────────┐\n   │  Load      │  Transform Data   │\n   │ (as-is)    │ (clean first) ✅  │\n   └────────────┴──────────────────┘",
    demo:{ steps:[
      {label:"Open Get Data", visual:"Home ▸ Get data ▸ Excel workbook", caption:"Start every import from the Home ribbon."},
      {label:"Navigator", visual:"☑ Orders      (60 rows preview)\n☐ Sheet2 (empty)", caption:"Preview and tick only the sheets/tables you actually need."},
      {label:"Decide", visual:"[ Load ]   [ Transform Data ]\n            ▲ choose this for real data", caption:"Transform Data opens Power Query so you can clean before loading."},
      {label:"Loaded", visual:"Fields ▸ Orders (13 columns) ✔", caption:"The table now appears in the Fields pane, ready to use."}
    ], transcript:[
      "Get Data lists many sources; choose Excel for our file.",
      "The Navigator previews sheets — tick the ones you need.",
      "Load brings data in as-is; Transform Data opens Power Query.",
      "For real data, choose Transform Data to clean first."
    ]},
    follow:[
      "Home ribbon ▸ Get data ▸ Excel workbook.",
      "Browse to a sample file and open it.",
      "In the Navigator, tick the sheet you want and read the preview.",
      "Click Transform Data (not Load) to see Power Query — then close it."
    ],
    practice:{ type:"order", q:"Put the import steps in the correct order.",
      items:["Choose Transform Data to clean","Click Get Data and pick Excel","Tick the sheet in the Navigator preview","The table appears in the Fields pane"],
      answer:[1,2,0,3],
      explainCorrect:"Get Data → pick source → tick in Navigator → Transform/Load → table appears.",
      explainWrong:"The flow is: Get Data, pick the source, tick the sheet in Navigator, Transform (clean), then it loads to Fields." },
    hints:["What is the very first button you press?","You always choose the source before you can preview it in the Navigator.","Order: Get Data & pick Excel → tick sheet in Navigator → Transform Data → table appears in Fields."],
    mistakes:["Clicking Load and skipping the clean step.","Importing empty sheets you don't need.","Forgetting that Get Data lives on the Home ribbon."],
    check:{ q:"When should you choose 'Transform Data' instead of 'Load'?",
      options:["Never — Load is always faster","When the data needs cleaning or shaping first","Only for databases","Only when the file is large"], answer:1,
      explain:"Transform Data opens Power Query so you can clean, and you almost always need to." },
    summary:"Get Data connects to a source, the Navigator previews it, and you pick Load (as-is) or Transform Data (clean first). For real work, always Transform Data.",
    teach:"Write a 4-step 'How to import a file' worksheet a student could follow without you in the room.",
    apply:"You'll use Get Data to bring the Sunshine Supermarket file into Power BI in the case study.",
    reviewIf:["m3l1"] })
]},

{ n:4, title:"Cleaning data with Power Query", emoji:"🧼", blurb:"Wash and chop your data: types, blanks, duplicates, text.", lessons:[
  L({ id:"m4l1", m:4, t:"Fixing types, blanks & duplicates", min:16, level:["beginner","intermediate","faculty"],
    prereq:"Module 3.",
    outcomes:["Set correct data types","Remove blank rows and duplicates","Read and trust Applied Steps"],
    concept:"Power Query is the sink where you wash data. Three fixes cover most messes: **data types** (make Order Date a Date, Sales a Decimal), **blanks** (remove empty rows), and **duplicates** (remove repeated records). Every action is recorded in **Applied Steps** on the right — a recipe you can replay or undo. Fix the data here once, and every chart downstream is trustworthy.",
    analogyKey:"powerquery",
    visual:"POWER QUERY\n\n  before:  '  chennai '  |  ₹1,200  |  (blank row)\n            trim/case      to number   remove\n  after:   'Chennai'     |  1200     |  ✅ gone\n\n  Applied Steps ▸ Source ▸ Changed Type ▸ Removed Blanks ▸ Removed Duplicates",
    demo:{ steps:[
      {label:"Set types", visual:"Order Date  [ABC] → [📅 Date]\nSales       [ABC] → [1.2 Decimal]", caption:"Wrong types cause wrong maths. Fix them first."},
      {label:"Remove blanks", visual:"Home ▸ Remove Rows ▸ Remove Blank Rows\n(-3 empty rows)", caption:"Blank rows sneak into totals and counts."},
      {label:"Remove duplicates", visual:"Select Order ID ▸ Remove Duplicates\n(-2 repeated orders)", caption:"Duplicates double-count sales. Remove on a unique key."},
      {label:"Applied Steps", visual:"✔ Source\n✔ Changed Type\n✔ Removed Blank Rows\n✔ Removed Duplicates", caption:"The recipe is saved and re-runs every refresh."}
    ], transcript:[
      "Power Query is where we clean before loading.",
      "First set correct data types — dates as Date, money as Decimal.",
      "Remove blank rows so totals aren't distorted.",
      "Remove duplicate orders on a unique key like Order ID.",
      "Applied Steps records everything and replays on refresh."
    ]},
    follow:[
      "Open Power Query (Transform Data).",
      "Click a column header's type icon and set the correct type.",
      "Home ▸ Remove Rows ▸ Remove Blank Rows.",
      "Select the ID column ▸ Remove Duplicates. Watch Applied Steps grow."
    ],
    practice:{ type:"mcq", q:"A sales total looks too high. You spot the same Order ID appearing twice. What's the fix in Power Query?",
      options:["Delete the whole table and re-import","Select Order ID and Remove Duplicates","Change the chart type","Hide the column"],
      answer:1, explainCorrect:"Exactly — removing duplicates on the unique key stops the double-counting.",
      explainWrong:"Duplicated orders double-count. Select the unique key (Order ID) and Remove Duplicates." },
    hints:["The same order counted twice inflates the total. What removes repeats?","Look for a 'Remove Duplicates' action, applied to the unique identifier column.","Answer: select Order ID and Remove Duplicates."],
    mistakes:["Removing duplicates on the wrong column (e.g. City) and deleting real rows.","Leaving numbers as text so SUM returns 0 or errors.","Cleaning in the report instead of Power Query, so it breaks on refresh."],
    check:{ q:"Where is every cleaning action recorded so it replays on refresh?",
      options:["The Filters pane","Applied Steps","The Model view","A hidden Excel sheet"], answer:1,
      explain:"Applied Steps is the recorded recipe; it re-runs whenever the data refreshes." },
    summary:"Clean in Power Query, not later. Fix data types, remove blanks, remove duplicates on the right key. Applied Steps saves the recipe so cleaning repeats automatically on every refresh.",
    teach:"Prepare a 'spot the mess' exercise: list 3 messy values and ask students which Power Query fix each one needs.",
    apply:"Sunshine's file has blank rows and a duplicated order. You'll clean exactly these in the case study.",
    reviewIf:["m3l1","m4l1"] })
]},

{ n:5, title:"Creating a data model", emoji:"🔗", blurb:"Relate tables so filters flow and lookups work.", lessons:[
  L({ id:"m5l1", m:5, t:"Relationships: building the bridge", min:16, level:["beginner","intermediate","faculty"],
    prereq:"Module 4.",
    outcomes:["Explain why tables need relationships","Create a one-to-many relationship on a key","Predict how filters flow"],
    concept:"Two tables sitting apart can't answer questions together. A **relationship** is a bridge built on a shared **key** column (like ProductID). The usual shape is **one-to-many**: one row in Products relates to many rows in Sales. Filters flow from the 'one' side to the 'many' side — pick a category on the Products side and Sales filters to match.",
    analogyKey:"relationship",
    visual:"ONE-TO-MANY\n\n  Products (one)            Sales (many)\n  ┌───────────┐            ┌──────────────┐\n  │ ProductID │◀──────────▶│ ProductID    │\n  │ Category  │  bridge    │ Amount, Qty  │\n  └───────────┘            └──────────────┘\n  filter Category ─────────▶ Sales narrows down",
    demo:{ steps:[
      {label:"Two lonely tables", visual:"[Sales]      [Products]\n  no line between them", caption:"Without a bridge, a chart can't mix their columns correctly."},
      {label:"Drag the key", visual:"Model view: drag\n Sales[ProductID] → Products[ProductID]", caption:"Dragging one key onto the matching key builds the relationship."},
      {label:"Confirm shape", visual:"Cardinality: Many-to-one (▶ 1)\nCross filter: Single", caption:"Power BI detects one-to-many automatically most of the time."},
      {label:"Filters flow", visual:"Slice Category = 'Dairy'\n → Sales shows only dairy rows", caption:"Now a category slicer controls the sales chart."}
    ], transcript:[
      "Two tables can't be combined until they're related.",
      "In Model view, drag one key onto the matching key.",
      "The relationship is usually one-to-many.",
      "Filters flow from the one side to the many side."
    ]},
    follow:[
      "Switch to Model view (the 🔗 icon).",
      "Find the matching key in both tables (e.g. ProductID).",
      "Drag one onto the other to create the line.",
      "Double-click the line and read its cardinality and filter direction."
    ],
    practice:{ type:"mcq", q:"You put Category (from Products) on a bar chart and Sales (from Sales) as values, but every bar is identical. What's the likely cause?",
      options:["The chart type is wrong","There is no relationship between the tables","DAX is broken","The data is too small"],
      answer:1, explainCorrect:"Correct — identical bars across categories is the classic 'no relationship' symptom.",
      explainWrong:"Identical bars mean the filter isn't flowing — the tables aren't related. Build the relationship on the shared key." },
    hints:["Identical bars mean the Category filter isn't reaching Sales.","If two tables aren't bridged, filters can't cross — what have we not built yet?","Answer: there is no relationship between the tables."],
    mistakes:["Relating on a non-unique column, creating a many-to-many mess.","Expecting filters to flow 'up' from many to one by default.","Building relationships in Report view — they live in Model view."],
    check:{ q:"In a one-to-many relationship, which way do filters flow by default?",
      options:["From the many side to the one side","From the one side to the many side","Both ways always","They don't flow"], answer:1,
      explain:"By default, filters propagate from the 'one' side to the 'many' side." },
    summary:"Relationships bridge tables on a shared key. One-to-many is the norm, and filters flow from the one side to the many side. No bridge, no cross-filtering — the tell-tale sign is identical values across categories.",
    teach:"Use two paper lists (orders + products) to physically 'build a bridge' on ProductID in front of students. Script the demo in 4 lines.",
    apply:"You'll link Sunshine's Orders to a Branches lookup and a Calendar table so slicers and time analysis work.",
    reviewIf:["m5l1"] })
]},

{ n:6, title:"Learning essential DAX", emoji:"🧮", blurb:"Write the measures every report needs.", lessons:[
  L({ id:"m6l1", m:6, t:"Your first measures: SUM, and why filters matter", min:16, level:["beginner","intermediate","faculty"],
    prereq:"Module 5.",
    outcomes:["Write a SUM measure","Explain filter context in plain words","Tell a measure apart from a calculated column"],
    concept:"**DAX** is the recipe maths. A **measure** is a calculation that recomputes every time the filter context changes. `Total Sales = SUM(Sales[Sales])` doesn't store a number — it *reacts*. Put it on a chart split by branch and it shows each branch's total; add a month slicer and it shrinks to that month. That reactivity is filter context. (A calculated column, by contrast, computes once per row and is stored.)",
    analogyKey:"dax",
    visual:"MEASURE vs COLUMN\n\n  Calculated column: computed once per row, stored\n     LineTotal = Sales[Qty] * Sales[Price]\n\n  Measure: recomputed per filter, not stored\n     Total Sales = SUM( Sales[Sales] )\n        by Branch → per-branch totals\n        + month slicer → shrinks to that month",
    demo:{ steps:[
      {label:"Create measure", visual:"Right-click Sales ▸ New measure\nTotal Sales = SUM(Sales[Sales])", caption:"Measures live in a table but belong to the whole model."},
      {label:"Put it on a card", visual:"Card visual → Total Sales\n = 4,412,900", caption:"With no filters, it sums everything."},
      {label:"Split by branch", visual:"Bar chart: Branch × Total Sales\nDelhi 1.9M | Mumbai 1.4M | …", caption:"Same measure, now one number per branch — filter context at work."},
      {label:"Add a slicer", visual:"Slicer Month = 'March'\n → every bar recalculates", caption:"The measure reacts instantly to the new filter."}
    ], transcript:[
      "DAX writes measures that react to filters.",
      "Total Sales = SUM of the Sales column.",
      "On a card it sums everything; split by branch it shows per-branch totals.",
      "Add a month slicer and the same measure recalculates. That's filter context."
    ]},
    follow:[
      "Right-click your Sales table ▸ New measure.",
      "Type: Total Sales = SUM(Sales[Sales]) and press Enter.",
      "Drag Total Sales onto a Card visual.",
      "Add a Branch bar chart and watch one measure give many answers."
    ],
    practice:{ type:"daxfill", q:"Complete the measure that totals the Profit column of the Sales table.",
      template:"Total Profit = ____( Sales[Profit] )",
      answer:"SUM", accepts:["sum"],
      explainCorrect:"Yes — SUM aggregates the Profit column, and as a measure it respects whatever filters are applied.",
      explainWrong:"To total a numeric column you use SUM(Sales[Profit]). The function name is SUM." },
    hints:["Which function adds up all the numbers in a column?","It's the same three-letter function you'd use in Excel to total a range.","Answer: SUM — Total Profit = SUM(Sales[Profit])."],
    mistakes:["Writing a calculated column when a measure is needed (bloats the model).","Referencing a column without its Table[Column] name.","Expecting a measure to show a value with no visual/filters to give it context."],
    check:{ q:"Why does one measure like Total Sales show different numbers on different charts?",
      options:["Because it's stored per row","Because of filter context — it recomputes for each filter","Because DAX is random","Because it's actually many measures"], answer:1,
      explain:"A measure recomputes within whatever filter context each visual applies." },
    summary:"A DAX measure reacts to filters instead of storing a value. `SUM(Table[Column])` totals a column, and filter context is why the same measure shows per-branch, per-month, or grand totals depending on the visual.",
    teach:"Explain filter context with a lunch analogy: 'per person' portions change as guests arrive. Write it in 3 sentences for students.",
    apply:"You'll write Total Sales, Total Profit and Profit Margin % for Sunshine, then reuse them across every chart.",
    reviewIf:["m6l1"] }),
  L({ id:"m6l2", m:6, t:"Profit Margin %: DIVIDE and safe division", min:14, level:["intermediate","faculty"],
    prereq:"Lesson 6.1.",
    outcomes:["Build a ratio measure from two measures","Use DIVIDE to avoid divide-by-zero errors","Format a measure as a percentage"],
    concept:"Ratios like **Profit Margin %** are built from other measures: Total Profit divided by Total Sales. Never use the `/` operator directly — if sales are zero you get an error. **DIVIDE(numerator, denominator)** returns blank (or a value you choose) instead of erroring. Then format the measure as a percentage so readers see 18.4%, not 0.184.",
    analogyKey:"dax",
    visual:"SAFE RATIO\n\n  Profit Margin % =\n     DIVIDE( [Total Profit], [Total Sales] )\n                            ▲ if 0 → blank, no crash\n\n  Format ▸ Percentage ▸ 1 decimal → 18.4%",
    demo:{ steps:[
      {label:"Reuse measures", visual:"We already have\n[Total Sales], [Total Profit]", caption:"Good measures build on each other — don't repeat SUMs."},
      {label:"Write DIVIDE", visual:"Profit Margin % =\n DIVIDE([Total Profit],[Total Sales])", caption:"DIVIDE handles zero denominators gracefully."},
      {label:"Why not / ?", visual:"[Total Profit] / [Total Sales]\n → error when Sales = 0 💥", caption:"The plain slash operator throws errors on empty branches."},
      {label:"Format %", visual:"Measure tools ▸ % ▸ 1 decimal\n → 18.4%", caption:"Percentage formatting makes the ratio instantly readable."}
    ], transcript:[
      "Profit Margin is profit divided by sales.",
      "Build it from existing measures, don't repeat the SUMs.",
      "Use DIVIDE so a zero denominator returns blank, not an error.",
      "Format the result as a percentage with one decimal."
    ]},
    follow:[
      "New measure: Profit Margin % = DIVIDE([Total Profit],[Total Sales]).",
      "In Measure tools, click the % button and set 1 decimal place.",
      "Drop it on a table by Branch and compare margins.",
      "Temporarily filter to a branch with 0 sales to see DIVIDE stay calm."
    ],
    practice:{ type:"daxfill", q:"Complete a safe margin measure that won't error when sales are zero.",
      template:"Profit Margin % = ______( [Total Profit], [Total Sales] )",
      answer:"DIVIDE", accepts:["divide"],
      explainCorrect:"Correct — DIVIDE returns blank instead of an error when the denominator is zero.",
      explainWrong:"Use DIVIDE([Total Profit],[Total Sales]) — it safely handles a zero denominator." },
    hints:["The plain / crashes on zero. Which function avoids that?","It's a five-letter DAX function made exactly for safe division.","Answer: DIVIDE([Total Profit],[Total Sales])."],
    mistakes:["Using / and getting Infinity/errors on empty branches.","Forgetting to format as percentage, so 0.184 confuses readers.","Rebuilding SUMs inside the ratio instead of referencing existing measures."],
    check:{ q:"What does DIVIDE return when the denominator is 0?",
      options:["An error","Infinity","Blank (or your chosen alternate)","Always 0"], answer:2,
      explain:"DIVIDE returns blank by default (or the optional third argument) instead of erroring." },
    summary:"Build ratios from existing measures with DIVIDE, which safely returns blank on a zero denominator. Format as a percentage so the number reads as 18.4%.",
    teach:"Pose the student question 'why not just use a slash?' and script a 2-line answer with the zero-sales example.",
    apply:"Profit Margin % answers Sunshine's question: which branch has the best margin — not just the biggest sales.",
    reviewIf:["m6l1","m6l2"] })
]},

{ n:7, title:"Choosing effective visualizations", emoji:"📈", blurb:"Match the chart to the question.", lessons:[
  L({ id:"m7l1", m:7, t:"Which chart answers which question", min:14, level:["beginner","intermediate","faculty"],
    prereq:"Module 6.",
    outcomes:["Match a question type to a chart type","Avoid common chart mistakes","Justify a chart choice in words"],
    concept:"A chart is an answer, so pick it by the *question*. **Comparing categories** → bar/column chart. **Change over time** → line chart. **Part of a whole** → treemap or a single stacked bar (avoid pie beyond ~4 slices). **A single key number** → card. **Relationship between two numbers** → scatter. Choosing well means the reader understands in seconds without a caption.",
    analogyKey:"powerbi",
    visual:"QUESTION → CHART\n\n  Which branch is biggest?     → Bar chart\n  Are sales rising?            → Line chart\n  One headline number?         → Card\n  Do high sales = high profit? → Scatter\n  Share of total?              → Treemap",
    demo:{ steps:[
      {label:"Compare", visual:"Sales by Branch\n Bar chart ▇▇▇▇ ▇▇▇ ▇▇", caption:"Bars are the safest choice for comparing categories."},
      {label:"Trend", visual:"Sales by Month\n Line ╱╲╱ rising to March", caption:"Lines show direction and change over time."},
      {label:"Headline", visual:"[ Total Sales  4.41M ]  Card", caption:"A card spotlights one number that matters."},
      {label:"Relationship", visual:"Scatter: Sales (x) vs Profit (y)\n one dot per branch", caption:"Scatter reveals whether high sales really bring high profit."}
    ], transcript:[
      "Choose a chart by the question it answers.",
      "Bars compare categories; lines show trends over time.",
      "Cards show a single headline number.",
      "Scatter shows the relationship between two numbers."
    ]},
    follow:[
      "Write the manager's question in plain words first.",
      "Ask: is it compare / trend / single number / relationship / share?",
      "Pick the matching chart from the Visualizations pane.",
      "Sanity check: could a reader get it in 3 seconds?"
    ],
    practice:{ type:"dnd", q:"Match each question to the best chart. Drag a chart onto each question.",
      pairs:[
        {left:"Which branch sold the most?", right:"Bar chart"},
        {left:"Are monthly sales rising or falling?", right:"Line chart"},
        {left:"What is total profit right now?", right:"Card"},
        {left:"Do higher sales mean higher profit?", right:"Scatter"}
      ],
      explainCorrect:"Great matching — question type drives chart type every time.",
      explainWrong:"Match by the question: compare→bar, trend→line, one number→card, relationship→scatter." },
    hints:["Sort each question into: compare, trend, single number, or relationship.","'Rising or falling' is a time-trend; 'the most' is a comparison.","Bar=compare, Line=trend, Card=single number, Scatter=relationship."],
    mistakes:["Using a pie chart with many slices no one can compare.","Putting time on a bar chart when a line shows the trend better.","Adding 3D or decoration that hides the data."],
    check:{ q:"Which chart best shows sales changing month by month?",
      options:["Pie chart","Line chart","Card","Table"], answer:1,
      explain:"A line chart is built to show change over time." },
    summary:"Pick charts by the question: bar to compare, line for trends, card for a headline number, scatter for relationships, treemap for share. A good chart needs no caption.",
    teach:"Create a one-page 'question → chart' poster with 5 rows for a classroom wall.",
    apply:"Every Sunshine question maps to a chart: 'highest sales' → bar, 'lowest month' → line, 'sales vs profit' → scatter.",
    reviewIf:["m7l1"] })
]},

{ n:8, title:"Building interactive reports", emoji:"🎛️", blurb:"Slicers, cross-filtering, and a clean layout.", lessons:[
  L({ id:"m8l1", m:8, t:"Slicers & cross-filtering", min:14, level:["beginner","intermediate","faculty"],
    prereq:"Module 7.",
    outcomes:["Add a slicer to filter a page","Explain cross-filtering between visuals","Design a readable layout"],
    concept:"Interactivity is what sets a report apart from a picture. A **slicer** is an on-screen remote — pick a branch or month and every visual updates. **Cross-filtering** means clicking a bar in one chart filters the others. Add a clear title, group related visuals, and leave white space so the eye isn't overwhelmed.",
    analogyKey:"slicer",
    visual:"INTERACTION\n\n  [ Delhi | Mumbai | Chennai ]  ← slicer (the remote)\n         │ filters everything below\n  ┌─────────────┬───────────────┐\n  │ Sales bar   │ Profit line   │\n  └─────────────┴───────────────┘\n  Click a bar → the line filters too (cross-filter)",
    demo:{ steps:[
      {label:"Add slicer", visual:"Visualizations ▸ Slicer\nField: Branch\n[ □ Delhi □ Mumbai □ Chennai ]", caption:"A slicer turns a column into clickable buttons."},
      {label:"It filters all", visual:"Pick 'Mumbai'\n → every visual shows Mumbai only", caption:"One click re-focuses the whole page."},
      {label:"Cross-filter", visual:"Click a 'Dairy' bar\n → profit line filters to Dairy", caption:"Visuals filter each other automatically."},
      {label:"Tidy layout", visual:"Title top-left · slicer top-right\ncharts aligned on a grid", caption:"Alignment and space make it feel professional."}
    ], transcript:[
      "A slicer filters the whole page from a column.",
      "Pick a value and every visual updates.",
      "Clicking inside a chart cross-filters the others.",
      "A clean, aligned layout makes the report readable."
    ]},
    follow:[
      "Add a Slicer visual and drop Branch into it.",
      "Click a branch and watch all charts respond.",
      "Click a bar inside a chart to cross-filter the rest.",
      "Align visuals to the grid and add a page title."
    ],
    practice:{ type:"mcq", q:"A reader wants to see every chart for just 'March'. What do you add?",
      options:["A new report","A slicer on Month","A calculated column","A second data model"],
      answer:1, explainCorrect:"Right — a Month slicer lets the reader refocus the whole page with one click.",
      explainWrong:"Add a slicer on the Month field; picking March filters every visual on the page." },
    hints:["The reader needs a control to pick a value themselves.","It's the on-screen 'remote' that filters the page.","Answer: add a slicer on Month."],
    mistakes:["Cramming visuals edge to edge with no white space.","Forgetting a title so readers don't know what they're seeing.","Adding ten slicers when two would do."],
    check:{ q:"What happens when you click a bar in one chart on an interactive page?",
      options:["Nothing","It cross-filters the other visuals","It deletes the bar","It exports to Excel"], answer:1,
      explain:"Clicking a data point cross-filters the other visuals on the page." },
    summary:"Slicers are on-screen remotes; cross-filtering lets visuals filter each other. Add a title, align to a grid, and keep white space so the report reads clearly.",
    teach:"Demo cross-filtering live: click a bar and narrate what changes. Write the 3-sentence narration you'd use.",
    apply:"Sunshine's dashboard will have Branch and Month slicers so the manager can explore any combination.",
    reviewIf:["m8l1"] })
]},

{ n:9, title:"Finding & communicating insights", emoji:"💡", blurb:"Turn charts into decisions.", lessons:[
  L({ id:"m9l1", m:9, t:"From chart to insight to action", min:14, level:["intermediate","faculty"],
    prereq:"Module 8.",
    outcomes:["Write an insight as a full sentence","Separate observation from recommendation","Avoid misleading a reader"],
    concept:"A chart is not an insight. An **insight** is a sentence that states what you see *and why it matters*: 'Chennai has the highest sales but the lowest margin, because heavy discounting is eroding profit.' Then comes the **action**: 'Review Chennai's discount policy next month.' Good analysts always pair observation → meaning → recommendation.",
    analogyKey:"powerbi",
    visual:"INSIGHT RECIPE\n\n  Observation:  Chennai sales are highest\n  + Meaning:    but its margin is lowest (discounts)\n  = Insight:    high sales ≠ high profit here\n  → Action:     review Chennai's discounting",
    demo:{ steps:[
      {label:"Just a chart", visual:"Bar: Chennai tallest\nScatter: Chennai low on profit axis", caption:"Two charts — but no sentence yet."},
      {label:"Observe", visual:"'Chennai has the highest sales.'", caption:"State plainly what the visual shows."},
      {label:"Add meaning", visual:"'…but the lowest profit margin.'", caption:"Connect it to a second fact that changes the story."},
      {label:"Recommend", visual:"'Review Chennai's discount policy.'", caption:"End with a specific, doable action."}
    ], transcript:[
      "A chart alone isn't an insight.",
      "State the observation in a full sentence.",
      "Add the meaning — why it matters.",
      "Finish with a specific recommended action."
    ]},
    follow:[
      "Pick any chart and write one sentence of what you see.",
      "Add 'but' or 'because' and a second fact.",
      "Write one action a manager could take next month.",
      "Read it aloud — does it stand without the chart?"
    ],
    practice:{ type:"text", q:"Write one insight sentence for Sunshine that pairs an observation with why it matters. Include a word like 'but', 'because', or 'so'.",
      keywords:["but","because","so","however","margin","profit","discount","sales","branch"],
      minWords:10,
      explainCorrect:"Strong — you linked an observation to its meaning, which is exactly what an insight does.",
      explainWrong:"Aim for observation + meaning in one sentence, e.g. 'Chennai leads on sales but trails on margin because of discounts.'" },
    hints:["Start with what you see, then add 'but' or 'because'.","An insight needs a second fact that changes how we read the first.","Template: '[Branch] has [high X] but [low Y] because [reason], so we should [action].'"],
    mistakes:["Restating the chart ('Chennai is tallest') and calling it an insight.","Recommending an action with no evidence.","Cherry-picking a scale that exaggerates a difference."],
    check:{ q:"What turns an observation into an insight?",
      options:["A bigger font","Adding why it matters (meaning)","A 3D chart","More colours"], answer:1,
      explain:"An insight pairs the observation with its meaning — why it matters." },
    summary:"Charts show; insights explain. Pair observation with meaning in one sentence, then recommend a specific action. That chain — observe → mean → recommend — is what managers actually use.",
    teach:"Give students a chart and a sentence-starter frame ('___ has ___ but ___ because ___') to scaffold insight-writing.",
    apply:"You'll write three insights and three recommendations for Sunshine's manager as the case study's payoff.",
    reviewIf:["m9l1"] })
]},

{ n:10, title:"Publishing & sharing reports", emoji:"☁️", blurb:"Put your work in the library — safely.", lessons:[
  L({ id:"m10l1", m:10, t:"Publish, share & permissions", min:12, level:["intermediate","faculty"],
    prereq:"Module 8.",
    outcomes:["Publish a report to the Service","Share with view access","Explain permissions in plain words"],
    concept:"Publishing puts your finished report on a shared shelf — the **Power BI Service**. From Desktop, **Publish** uploads the .pbix to a **workspace**. Then you **share** it with named people and choose what they can do (usually *view*). **Permissions** are the library's rules about who may open the book — and, with row-level security, which pages each reader sees.",
    analogyKey:"publish",
    visual:"PUBLISH → SHARE\n\n  Desktop (.pbix) ──Publish──▶ Workspace (Service) ☁️\n                                  │ Share\n                          [ view ▾ ] to named people 🔒",
    demo:{ steps:[
      {label:"Publish", visual:"Home ▸ Publish ▸ 'Store Ops' workspace", caption:"Uploads your report to the shared Service."},
      {label:"Open online", visual:"app.powerbi.com ▸ report opens in browser", caption:"Now it lives on the web, refreshable and shareable."},
      {label:"Share", visual:"Share ▸ add manager@school ▸ Can view", caption:"Grant view access to specific people, not everyone."},
      {label:"Permissions", visual:"RLS: 'Chennai manager sees Chennai only'", caption:"Row-level security tailors what each reader sees."}
    ], transcript:[
      "Publishing uploads the report to the Power BI Service.",
      "It lands in a workspace and opens in the browser.",
      "Share with named people and set view access.",
      "Permissions and row-level security control who sees what."
    ]},
    follow:[
      "Home ▸ Publish and choose a workspace.",
      "Open the report in the Service (browser).",
      "Use Share and grant 'Can view' to one person.",
      "Say in one line what 'permissions' protect."
    ],
    practice:{ type:"mcq", q:"You publish a report but want only the four branch managers to open it. What do you use?",
      options:["Nothing — publishing shares it with everyone","Share with those named people and set Can view","Delete the file","Export to PDF"],
      answer:1, explainCorrect:"Correct — publishing alone doesn't grant access; you share with specific people and set their permission.",
      explainWrong:"Publishing doesn't open access to all. Share with the named managers and set Can view." },
    hints:["Publishing puts it on the shelf; who is allowed to take it down?","You must explicitly grant access to specific people.","Answer: share with those named people and set Can view."],
    mistakes:["Assuming publishing = everyone can see it.","Giving edit rights when view is enough.","Forgetting row-level security when managers should see only their branch."],
    check:{ q:"What does 'publishing' a report do?",
      options:["Prints it","Uploads it to the Power BI Service workspace","Deletes local data","Emails it as Excel"], answer:1,
      explain:"Publish uploads the .pbix to a workspace in the Power BI Service." },
    summary:"Publish uploads your report to a Service workspace; sharing grants named people view access; permissions (and row-level security) decide who opens the book and which pages they see.",
    teach:"Explain permissions with the library analogy in 3 sentences a non-technical colleague would trust.",
    apply:"In the final step you'll publish Sunshine's dashboard and decide each manager sees only their own branch.",
    reviewIf:["m10l1"] })
]},

{ n:11, title:"Completing a business case study", emoji:"🛒", blurb:"Put it all together on Sunshine Supermarket.", lessons:[
  L({ id:"m11l1", m:11, t:"Case study walkthrough overview", min:10, level:["intermediate","faculty"],
    prereq:"Modules 3–9.",
    outcomes:["See how every skill connects","Know the 12 case-study steps","Set your goal for the dashboard"],
    concept:"This is where the kitchen serves a full meal. You'll take Sunshine Supermarket's raw file and walk the whole journey — import, clean, model, measure, visualise, and present — ending with three insights and three recommendations for the manager. Open the **Case Studies** section for the interactive workspace, dataset download, and live sample dashboard.",
    analogyKey:"powerbi",
    visual:"THE FULL MEAL\n\n  import → clean → model → DAX → visuals → slicers\n     → insights → recommendations → present → teach",
    demo:{ steps:[
      {label:"The brief", visual:"4 branches: Delhi, Mumbai, Bengaluru, Chennai.\n7 manager questions to answer.", caption:"A real brief with real questions drives every choice."},
      {label:"The data", visual:"~60 orders · 13 columns\nSales, Profit, Discount, Customer Type…", caption:"A compact, realistic dataset you can download."},
      {label:"The build", visual:"Total Sales · Margin % · by Branch/Month", caption:"You reuse every skill from Modules 3–9."},
      {label:"The payoff", visual:"3 insights + 3 recommendations", caption:"You end by telling the manager what to do."}
    ], transcript:[
      "The case study combines every module into one project.",
      "Sunshine has four branches and seven questions.",
      "You import, clean, model, measure and visualise the data.",
      "You finish with three insights and three recommendations."
    ]},
    follow:[
      "Open the Case Studies section from the left menu.",
      "Download the Sunshine dataset (CSV) to keep.",
      "Read the seven manager questions.",
      "Work the 12 interactive steps at your own pace."
    ],
    practice:{ type:"mcq", q:"What is the true finish line of the case study?",
      options:["A pretty chart","Three insights and three recommended actions for the manager","A published file only","A long data table"],
      answer:1, explainCorrect:"Exactly — the point is decisions, not decoration. Insights and actions are the deliverable.",
      explainWrong:"The deliverable is insights and recommendations the manager can act on — not charts alone." },
    hints:["The manager doesn't want art — they want answers.","Think about what a busy manager actually uses from a dashboard.","Answer: three insights and three recommended actions."],
    mistakes:["Building charts with no question in mind.","Stopping at visuals and skipping insights.","Ignoring the discount/margin story behind big sales."],
    check:{ q:"The case study proves you can do what?",
      options:["Only import data","Run the whole journey end-to-end and recommend actions","Only write DAX","Only publish"], answer:1,
      explain:"It integrates every skill from import to recommendation." },
    summary:"The Sunshine case study is the full meal: import → clean → model → DAX → visuals → slicers → insights → recommendations → present → teach. Head to Case Studies for the interactive workspace.",
    teach:"Outline how you'd introduce this project to students in a single opening paragraph.",
    apply:"This lesson *is* the on-ramp to the case study — open Case Studies next.",
    reviewIf:["m11l1"] })
]},

{ n:12, title:"Teaching Power BI to students", emoji:"🎓", blurb:"Turn your learning into a class you can run.", lessons:[
  L({ id:"m12l1", m:12, t:"Teaching with analogies & teach-backs", min:14, level:["faculty"],
    prereq:"Modules 1–11.",
    outcomes:["Plan a lesson around an analogy","Run a teach-back to check understanding","Anticipate common student questions"],
    concept:"You teach best what you can explain simply. A strong Power BI class hangs on one **analogy** (the kitchen), builds with a **live demo**, then flips: students do a **teach-back**, explaining a concept to you or a peer. Teach-backs surface misunderstandings faster than any quiz. Open the **Teaching Toolkit** for lesson plans, demo scripts, worksheets, rubrics, and a bank of common student questions.",
    analogyKey:"powerbi",
    visual:"A LESSON SHAPE\n\n  hook (analogy) → demo (show) → I-do/We-do/You-do\n     → teach-back (student explains) → check → recap",
    demo:{ steps:[
      {label:"Hook", visual:"'Power BI is a kitchen…'\n90-second story", caption:"Open with the analogy so the abstract feels familiar."},
      {label:"Model it", visual:"Live: import → clean → one chart", caption:"Show the whole flow small, then break it down."},
      {label:"You-do", visual:"Students clean one column themselves", caption:"Hands on keys quickly — watching isn't learning."},
      {label:"Teach-back", visual:"'Explain a slicer to your neighbour.'", caption:"If they can teach it, they own it."}
    ], transcript:[
      "Great lessons hang on one clear analogy.",
      "Model the whole flow, then let students do a small piece.",
      "Use teach-backs so students explain concepts themselves.",
      "Teach-backs reveal gaps faster than quizzes."
    ]},
    follow:[
      "Pick one concept (e.g. relationships) and one analogy (the bridge).",
      "Write a 90-second hook using that analogy.",
      "Plan one 'you-do' task students complete in 3 minutes.",
      "Write one teach-back prompt to close the loop."
    ],
    practice:{ type:"text", q:"Write a teach-back prompt you would give students to check they understand DAX measures. It should ask them to explain, not just click.",
      keywords:["explain","measure","filter","own words","analogy","why","teach","student","neighbour"],
      minWords:8,
      explainCorrect:"Good — a prompt that asks students to explain (not just do) is exactly what reveals real understanding.",
      explainWrong:"Frame it as an explanation task, e.g. 'In your own words, explain to a partner why one measure shows different numbers on different charts.'" },
    hints:["A teach-back asks students to *explain*, not to click a button.","Use 'in your own words' or 'explain to a partner'.","Example: 'Explain to your neighbour, using an analogy, why a measure changes with filters.'"],
    mistakes:["Lecturing the whole time with no hands-on.","Checking understanding only with multiple-choice.","Skipping the analogy and starting with jargon."],
    check:{ q:"Why are teach-backs powerful for checking understanding?",
      options:["They're quick to mark","Explaining a concept reveals whether it's truly understood","They avoid using software","They're graded automatically"], answer:1,
      explain:"When a student can explain a concept clearly, they've genuinely understood it." },
    summary:"Teach with one analogy, a small live demo, quick hands-on, and a teach-back where students explain in their own words. The Teaching Toolkit gives you ready plans, scripts, worksheets and rubrics.",
    teach:"Draft the opening 90 seconds of your first Power BI class, using an analogy of your choice.",
    apply:"Everything you built for Sunshine becomes your teaching example — you already have the demo.",
    reviewIf:["m12l1"] })
]}
];

/* flatten lesson lookup + wiring 'next' */
const allLessons = [];
modules.forEach(mod => mod.lessons.forEach(les => allLessons.push(les)));
allLessons.forEach((les,i)=>{ les.next = allLessons[i+1] ? allLessons[i+1].id : null; les.analogy = analogies[les.analogyKey]; });
const lessonById = {}; allLessons.forEach(l=> lessonById[l.id]=l);

/* ============================================================
   CASE STUDY — Sunshine Supermarket (deterministic dataset)
   ============================================================ */
function buildDataset(){
  const branches=[["Delhi","Delhi","North"],["Mumbai","Mumbai","West"],["Bengaluru","Bengaluru","South"],["Chennai","Chennai","South"]];
  const products=[["Basmati Rice","Grocery",120,88],["Sunflower Oil","Grocery",180,150],["Toothpaste","Personal Care",95,52],
    ["Shampoo","Personal Care",220,140],["Notebook","Stationery",60,34],["Milk 1L","Dairy",56,46],
    ["Cheese Block","Dairy",320,230],["Detergent","Home Care",250,175],["Biscuits","Snacks",40,22],["Green Tea","Beverages",300,180]];
  const custTypes=["Member","Walk-in"];
  const names=["A. Rao","S. Iyer","M. Khan","P. Nair","R. Das","K. Menon","T. Bose","V. Shah","N. Pillai","J. Verma"];
  let seed=1234567; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const rows=[]; let id=1000; const months=["Jan","Feb","Mar","Apr","May","Jun"];
  // Deliberately seed the teaching story:
  //  Chennai = high VOLUME but heavy discounts -> highest sales, WORST margin.
  //  Delhi   = disciplined discounting        -> strong margin (best).
  // This makes "high sales != high profit" visible in the live dashboard.
  branches.forEach((b,bi)=>{
    const heavy=(bi===3), disciplined=(bi===0);
    for(let k=0;k<15;k++){
      const p=products[Math.floor(rnd()*products.length)];
      const mi=Math.floor(rnd()*months.length);
      // Chennai buys in bigger baskets (drives total sales up despite discounts)
      const qty = heavy ? 6+Math.floor(rnd()*9) : 1+Math.floor(rnd()*7);
      const unit=p[2]; const cost=p[3];
      let disc = heavy ? 0.14+rnd()*0.12 : disciplined ? 0.01+rnd()*0.03 : 0.03+rnd()*0.07;
      disc=Math.round(disc*100)/100;
      const gross=qty*unit;
      const sales=Math.round(gross*(1-disc));
      const profit=Math.round(sales - qty*cost);
      const ct=custTypes[rnd()>0.45?0:1];
      rows.push({ OrderID:"SO-"+(id++), OrderDate:`2026-${String(mi+1).padStart(2,"0")}-${String(1+Math.floor(rnd()*27)).padStart(2,"0")}`,
        Branch:b[0], City:b[0], Customer:names[Math.floor(rnd()*names.length)], CustomerType:ct,
        Product:p[0], ProductCategory:p[1], Quantity:qty, UnitPrice:unit, Cost:cost, Discount:disc, Sales:sales, Profit:profit });
    }
  });
  return rows;
}
const dataset = buildDataset();

const caseStudy = {
  title:"Sunshine Supermarket", emoji:"🛒",
  brief:"Sunshine Supermarket runs four branches — Delhi, Mumbai, Bengaluru and Chennai. The manager has one messy sales file and seven questions. Your job: turn the data into a dashboard and, more importantly, into decisions.",
  questions:[
    "Which branch has the highest sales?",
    "Which branch has the best profit margin?",
    "Which products perform well or poorly?",
    "Which month has the lowest sales?",
    "Which customer group spends the most?",
    "Are high sales always producing high profit?",
    "Where should management focus next month?"
  ],
  steps:[
    {t:"Understand the business problem", d:"Read the seven questions. Notice they're about decisions, not charts. Write which chart each question will need."},
    {t:"Import the dataset", d:"Download the CSV below, then in Power BI: Get data ▸ Text/CSV ▸ Transform Data."},
    {t:"Clean incorrect records", d:"Set Order Date to Date and Sales/Profit to Decimal. Remove any blank rows. Remove duplicate Order IDs."},
    {t:"Create table relationships", d:"Add a Branches lookup and a Calendar table; relate them to Orders on Branch and OrderDate."},
    {t:"Write DAX measures", d:"Total Sales = SUM(Orders[Sales]); Total Profit = SUM(Orders[Profit]); Profit Margin % = DIVIDE([Total Profit],[Total Sales])."},
    {t:"Select suitable visualizations", d:"Bar for Sales by Branch, line for Sales by Month, scatter for Sales vs Profit, cards for totals."},
    {t:"Add filters and slicers", d:"Add Branch and Month slicers so the manager can explore any combination."},
    {t:"Build the management dashboard", d:"Arrange visuals on a grid with a title. Keep it to one clean screen."},
    {t:"Identify three or more insights", d:"Write full sentences: observation + meaning. Use the live sample dashboard below for evidence."},
    {t:"Recommend business actions", d:"For each insight, write one specific action the manager can take next month."},
    {t:"Present the dashboard", d:"Rehearse a 2-minute walkthrough: question → visual → insight → action."},
    {t:"Explain how to teach it", d:"Note how you'd use this project as a classroom example, including one analogy."}
  ],
  sampleInsights:[
    "Chennai posts strong sales but the weakest profit margin, because discounts there run far higher than other branches.",
    "Delhi isn't the biggest seller yet earns the best margin, thanks to disciplined, low discounting.",
    "High sales do not guarantee high profit — the scatter shows Chennai high on sales but low on profit."
  ],
  sampleActions:[
    "Cap Chennai's discount rate next month and monitor the margin response.",
    "Share Delhi's pricing discipline as a playbook for other branches.",
    "Protect the best-margin product categories from unnecessary discounting."
  ]
};

const miniProjects=[
  { id:"school", title:"School Attendance Dashboard", emoji:"🏫", level:"Beginner",
    brief:"Track attendance across classes and terms to spot which groups need support.",
    questions:["Which class has the lowest attendance?","Is attendance falling over the term?","Which day of week is worst?"],
    fields:["Date","Class","Student(anon)","Present","Term"], build:["Import the attendance sheet","Clean the Date column","% Present = DIVIDE(Present rows, All rows)","Line chart by week + bar by class","Slicer on Term"] },
  { id:"hospital", title:"Hospital Patient-Service Dashboard", emoji:"🏥", level:"Intermediate",
    brief:"Monitor patient wait times and service load by department (fictional, anonymous data).",
    questions:["Which department has the longest wait?","Do waits peak on certain days?","Is load rising month on month?"],
    fields:["VisitID","Date","Department","WaitMinutes","Outcome"], build:["Import visits","Set Date + WaitMinutes types","Avg Wait = AVERAGE(WaitMinutes)","Bar by department, line by month","Slicer on Department"] },
  { id:"budget", title:"Household Budget Dashboard", emoji:"💰", level:"Beginner",
    brief:"See where money goes each month and whether spending beats income.",
    questions:["Which category costs the most?","Am I saving or overspending?","Which month was tightest?"],
    fields:["Date","Category","Amount","Type(Income/Expense)"], build:["Import transactions","Split Income vs Expense","Net = Income − Expense (measures)","Treemap of expense categories","Slicer on Month"] }
];

/* ============================================================
   REFERENCE — glossary, DAX, shortcuts, flashcards, FAQ
   ============================================================ */
const glossary=[
  ["Power BI","Microsoft tool that connects to data, cleans and models it, and builds interactive reports.","Understanding Power BI"],
  ["Power Query","The clean-up workshop (ETL). Records every shaping step so it replays on refresh.","Cleaning data"],
  ["Data model","Tables joined by relationships so filters flow and lookups work.","Data model"],
  ["Relationship","A link between two tables on a shared key, usually one-to-many.","Data model"],
  ["Cardinality","The shape of a relationship: one-to-many, one-to-one, or many-to-many.","Data model"],
  ["Key","A column that identifies rows and is used to join tables (e.g. ProductID).","Data model"],
  ["DAX","Data Analysis Expressions — the formula language for measures and calculated columns.","DAX"],
  ["Measure","A DAX calculation that recomputes with filter context; not stored per row.","DAX"],
  ["Calculated column","A DAX column computed once per row and stored in the table.","DAX"],
  ["Filter context","The set of filters (slicers, rows, clicks) under which a measure is evaluated.","DAX"],
  ["Row context","The 'current row' a calculated column or iterator sees.","DAX"],
  ["SUM","DAX aggregation that totals a numeric column.","DAX"],
  ["DIVIDE","Safe division that returns blank instead of an error on a zero denominator.","DAX"],
  ["CALCULATE","DAX function that changes the filter context of a calculation.","DAX"],
  ["Slicer","On-canvas filter control; a 'remote' that filters visuals on a page.","Interactive reports"],
  ["Cross-filter","Clicking a data point in one visual filters the others.","Interactive reports"],
  ["Visualization","A chart, card, table or map that presents data.","Visualizations"],
  ["Card","A visual showing a single headline number.","Visualizations"],
  ["Report","A multi-page collection of visuals built in Desktop.","Understanding Power BI"],
  ["Dashboard","A single-page pinned summary that lives in the Power BI Service.","Understanding Power BI"],
  ["Power BI Desktop","The free app where you build reports.","Navigating Desktop"],
  ["Power BI Service","The website where you publish, share and refresh reports.","Publishing"],
  ["Workspace","A container in the Service where reports and dashboards live.","Publishing"],
  ["Publish","Uploading a .pbix from Desktop to a Service workspace.","Publishing"],
  ["Permissions","Rules for who can view or edit a shared report.","Publishing"],
  ["Row-level security (RLS)","Rules that limit which rows each reader can see.","Publishing"],
  ["Refresh","Re-running the query steps to pull the latest data.","Cleaning data"],
  ["Applied Steps","The recorded list of Power Query transformations.","Cleaning data"],
  ["Data type","How a column is stored: text, number, date, etc.","Cleaning data"],
  ["Aggregation","Combining many values into one (sum, average, count).","DAX"],
  ["Insight","A sentence pairing an observation with why it matters.","Insights"],
  ["Get Data","The command to connect Power BI to a source.","Importing data"],
  ["Fields pane","The list of all tables, columns and measures to drag onto visuals.","Navigating Desktop"],
  ["Treemap","A visual showing part-to-whole as nested rectangles.","Visualizations"],
  ["Scatter chart","A visual showing the relationship between two numeric measures.","Visualizations"]
];

const daxRef=[
  ["Total Sales = SUM(Sales[Sales])","Totals a numeric column, respecting filters.","SUM"],
  ["Total Qty = SUM(Sales[Quantity])","Adds up quantities sold.","SUM"],
  ["Order Count = COUNTROWS(Sales)","Counts the rows (orders) in a table.","COUNTROWS"],
  ["Avg Order = AVERAGE(Sales[Sales])","Average sales value per order.","AVERAGE"],
  ["Distinct Customers = DISTINCTCOUNT(Sales[Customer])","Counts unique customers.","DISTINCTCOUNT"],
  ["Total Profit = SUM(Sales[Profit])","Totals profit.","SUM"],
  ["Profit Margin % = DIVIDE([Total Profit],[Total Sales])","Safe ratio, format as %.","DIVIDE"],
  ["Sales Delhi = CALCULATE([Total Sales], Branches[City]=\"Delhi\")","Sales filtered to one city.","CALCULATE"],
  ["Sales YTD = TOTALYTD([Total Sales], Calendar[Date])","Year-to-date running total.","TOTALYTD"],
  ["High Value = IF([Total Sales]>100000,\"Yes\",\"No\")","Conditional flag.","IF"],
  ["Max Branch Sales = MAXX(VALUES(Branches[City]),[Total Sales])","Largest branch total.","MAXX"],
  ["Prev Month = CALCULATE([Total Sales], DATEADD(Calendar[Date],-1,MONTH))","Previous month's sales.","DATEADD"]
];

const shortcuts=[
  ["Ctrl + C / V","Copy / paste a visual"],["Ctrl + Z","Undo"],["Ctrl + Y","Redo"],
  ["Ctrl + S","Save the report"],["Ctrl + F","Search the Fields pane"],
  ["Ctrl + Click","Multi-select data points / slicer items"],["Alt + drag","Fine-move a visual"],
  ["Ctrl + Shift + click","Cross-highlight instead of filter"],["F11","Focus mode on a visual"],
  ["Ctrl + G","Group selected visuals"],["Ctrl + A","Select all visuals on a page"],
  ["Esc","Clear a slicer / close a dialog"],["Ctrl + Scroll","Zoom the canvas"],
  ["Right-click column","Rename, sort, or change type"],["Ctrl + Enter","New line in a DAX formula"]
];

const flashcards=[
  ["What are the 4 stages of the Power BI journey?","Connect → Clean → Model → Calculate → Visualise (5 if you count visualise)."],
  ["Difference: report vs dashboard?","Report = multi-page magazine (Desktop). Dashboard = single pinned summary (Service)."],
  ["What does Power Query do?","Cleans and shapes data before it loads, recording every step in Applied Steps."],
  ["What is a relationship?","A bridge joining two tables on a shared key, usually one-to-many."],
  ["Which way do filters flow by default?","From the 'one' side to the 'many' side."],
  ["What is a measure?","A DAX calculation that recomputes with filter context; not stored per row."],
  ["Why use DIVIDE instead of / ?","DIVIDE returns blank on a zero denominator instead of erroring."],
  ["What is filter context?","The set of filters under which a measure is evaluated."],
  ["Best chart to compare categories?","A bar/column chart."],
  ["Best chart for change over time?","A line chart."],
  ["What is a slicer?","An on-canvas filter — a remote that filters the page."],
  ["What does publishing do?","Uploads your report to a Service workspace to share."],
  ["What turns an observation into an insight?","Adding why it matters (the meaning), then an action."],
  ["What is cross-filtering?","Clicking a data point in one visual filters the others."],
  ["Card visual is for?","Showing a single headline number."]
];

const faq=[
  ["Do I need to know coding to start?","No. You start by clicking and dragging. DAX (light formulas) comes later, one function at a time."],
  ["Is Power BI free?","Power BI Desktop (where you build) is free. Sharing in the Service may need a licence, but you can learn everything here without one."],
  ["What's the difference between Power BI and Excel?","Excel is a spreadsheet; Power BI connects, cleans, models and visualises data interactively. They complement each other."],
  ["Where is my progress saved?","Privately in this browser (local storage). Nothing is uploaded. Use 'Reset my progress' in the footer to clear it."],
  ["Do I need the internet to use this toolkit?","No. Once loaded, it works offline. Downloading the actual Power BI app does need internet, though."],
  ["What if I forget a term?","Open the Reference Library ▸ Glossary, or ask the Learning Assistant to 'simplify' it."],
  ["Which path should I choose?","Take the 2-minute diagnostic on Learning Paths and it will recommend one. You can switch anytime."],
  ["How long does the whole thing take?","Beginner ~6–8h, Intermediate ~8–10h, Faculty ~12–15h. Go at your own pace; progress is saved."],
  ["Can I retake quizzes?","Yes, as many times as you like. Mastery is about understanding, not one attempt."],
  ["I'm preparing to teach — where do I start?","Choose the Faculty Mastery path, then open the Teaching Toolkit for plans, scripts and rubrics."]
];

const toolkit={
  lessonPlans:[
    {title:"Intro lesson (45 min): What is Power BI?",
     outline:["Hook: the kitchen analogy (5 min)","Demo: import → one chart (10 min)","We-do: clean one column together (10 min)","You-do: make one bar chart (10 min)","Teach-back: explain Power BI to a partner (5 min)","Recap + exit ticket (5 min)"]},
    {title:"Data cleaning lesson (45 min)",
     outline:["Hook: 'washing vegetables' (3 min)","Show 3 messy values, name the fix (7 min)","Demo: types, blanks, duplicates (10 min)","You-do: clean a messy sheet (15 min)","Teach-back: what does Applied Steps do? (5 min)","Common mistakes recap (5 min)"]},
    {title:"DAX lesson (45 min)",
     outline:["Hook: 'recipe maths / per person' (5 min)","Demo: SUM measure on a card, then split (10 min)","Explain filter context with lunch analogy (5 min)","You-do: write Total Profit + Margin % (15 min)","Teach-back: why does one measure show many numbers? (5 min)","Exit quiz (5 min)"]}
  ],
  demoScripts:[
    {title:"Relationships demo (paper method)",
     lines:["Hold up two paper lists: Orders and Products.","'These two can't talk yet.'","Draw a bridge line between ProductID on both.","'Now if I pick a category, orders follow across the bridge.'","Ask: which way do filters flow? (one → many)"]},
    {title:"Slicer demo (the remote)",
     lines:["'This slicer is a TV remote.'","Click Delhi — 'watch every chart change channel.'","Click a bar — 'even charts filter each other.'","Ask a student to predict what Mumbai will show, then click."]}
  ],
  studentExercises:[
    "Clean a supplied messy CSV: fix 2 types, remove blanks, remove 1 duplicate.",
    "Build a bar chart of Sales by Branch and write one sentence about it.",
    "Write Total Sales and Profit Margin % from scratch.",
    "Add a Month slicer and describe what changes.",
    "Write one insight + one recommendation for Sunshine."
  ],
  studentQs:[
    ["'Why is my total wrong / too big?'","Likely duplicates or blanks not cleaned, or a broken relationship. Check Power Query and Model view."],
    ["'Why does my measure show the same number everywhere?'","No relationship, or the field isn't in the visual to create context. Check the bridge."],
    ["'Should this be a measure or a column?'","If it should react to filters and be aggregated → measure. If it labels each row → column."],
    ["'Why can't I use a pie chart?'","You can, but with more than ~4 slices bars compare far more clearly."],
    ["'My dates won't group by month.'","The column loaded as text. Set it to Date in Power Query first."]
  ],
  checkMethods:["Exit tickets (one sentence)","Teach-back to a partner","Thumbs 1–5 self-rating","Predict-then-click during demos","One-question quiz per concept"],
  rubric:[
    ["Data prep","Data imported and cleaned (types, blanks, duplicates)","0–3"],
    ["Modelling","Correct relationships built on keys","0–3"],
    ["DAX","Core measures correct and reused","0–3"],
    ["Visuals","Charts match questions; layout is clean","0–3"],
    ["Insight","Insights pair observation + meaning + action","0–3"],
    ["Communication","Clear 2-minute presentation","0–3"]
  ],
  worksheets:["Import & clean checklist (printable)","Question → chart matching grid","DAX measure starter sheet","Insight sentence frames","Dashboard evaluation checklist"]
};

const badges=[
  {id:"first_step", emoji:"👟", name:"First Step", desc:"Complete your first lesson."},
  {id:"clean_slate", emoji:"🧼", name:"Clean Slate", desc:"Finish the Cleaning Data module."},
  {id:"bridge_builder", emoji:"🌉", name:"Bridge Builder", desc:"Finish the Data Model module."},
  {id:"dax_apprentice", emoji:"🧮", name:"DAX Apprentice", desc:"Finish the DAX module."},
  {id:"chart_whisperer", emoji:"📊", name:"Chart Whisperer", desc:"Finish the Visualizations module."},
  {id:"case_closed", emoji:"🛒", name:"Case Closed", desc:"Complete the Sunshine case study."},
  {id:"streak_3", emoji:"🔥", name:"On a Roll", desc:"Reach a 3-day learning streak."},
  {id:"quiz_ace", emoji:"🎯", name:"Quiz Ace", desc:"Score 90%+ on any module assessment."},
  {id:"teacher", emoji:"🎓", name:"Ready to Teach", desc:"Finish the Teaching module and 5 teach-backs."},
  {id:"finisher", emoji:"🏆", name:"Power BI Master", desc:"Complete every module."}
];

/* module assessments: pull each lesson's check + one applied item */
function moduleAssessment(modN){
  const mod=modules.find(m=>m.n===modN); if(!mod) return [];
  const qs=[];
  mod.lessons.forEach(l=>{ if(l.check) qs.push({q:l.check.q, options:l.check.options, answer:l.check.answer, explain:l.check.explain, from:l.t}); });
  return qs;
}

/* nav icon paths (inline svg d) */
const icons={
  home:"M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  book:"M4 5a2 2 0 0 1 2-2h9v16H6a2 2 0 0 0-2 2zM15 3h3a1 1 0 0 1 1 1v14",
  route:"M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 3-3V9",
  grid:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  flask:"M9 3h6M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3",
  chart:"M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7",
  check:"M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  teach:"M12 3l9 5-9 5-9-5zM6 10v5c0 1 3 3 6 3s6-2 6-3v-5",
  library:"M4 5v14M8 5v14M13 5l4 14M17 5h3v14",
  trophy:"M8 4h8v4a4 4 0 0 1-8 0zM5 4h3M16 4h3M9 20h6M12 14v6",
  help:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"
};

window.PBI={ nav, paths, diagnostic, analogies, modules, allLessons, lessonById,
  dataset, caseStudy, miniProjects, glossary, daxRef, shortcuts, flashcards, faq, toolkit, badges,
  moduleAssessment, icons, buildDataset };
})();
