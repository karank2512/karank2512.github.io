/**
 * ============================================================================
 *  profile.ts - SINGLE SOURCE OF TRUTH
 * ============================================================================
 *  Edit everything about the site from this one file:
 *    - identity / headline / one-liner   -> `identity`
 *    - top buttons + contact links       -> `links`
 *    - hero terminal commands            -> `terminalCommands`
 *    - about paragraphs                  -> `about`
 *    - project case studies              -> `projects`
 *    - work history timeline             -> `experience`
 *    - grouped skills                    -> `skillGroups`
 *    - personal hobby cards              -> `hobbies`
 *    - Spotify playlist embed            -> `music`
 *
 *  Resume PDF goes in /public/resume.pdf  (see links.resume below).
 * ============================================================================
 */

export type Project = {
  title: string;
  blurb: string; // one human sentence
  detail: string; // a couple of case-study sentences
  proves: string; // what it proves about Karan
  stack: string[];
  metrics: { value: string; label: string }[];
  tags: string[];
  links?: { label: string; href: string }[];
  featured?: boolean;
};

export type Experience = {
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
  tags: string[];
};

export type SkillGroup = {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  // project titles this category lights up when selected
  related: string[];
};

export type Hobby = {
  emoji: string;
  title: string;
  line: string;
};

export type Photo = {
  src: string;
  alt: string;
  caption?: string;
};

export type HingePrompt = {
  prompt: string;
  answer: string;
};

export const identity = {
  name: "Karan Kapur",
  initials: "KK",
  // shown under the name in the hero
  headline:
    "AI/ML & Data Engineer building fast systems, useful models, and sports-flavored analytics.",
  // the personal, human one-liner
  oneLiner:
    "CS + DS grad, UW-Madison. Co-founder of thaw. Usually somewhere between the gym, a golf course, a playlist, and a weird data problem.",
  location: "Madison, WI",
  education:
    "B.S. Computer Science + Data Science, Certificate in Entrepreneurship, University of Wisconsin-Madison (May 2026)",
  // roles Karan is targeting, shown as a rotating word in the hero
  targets: [
    "AI/ML Engineering",
    "Data Engineering",
    "Data Analytics",
    "Systems Engineering",
    "Sports Analytics",
    "Financial Analytics",
    "GTM Engineering",
    "Software Engineering",
    "Data Architecture",
  ],
};

export const links = {
  email: "kkapur5@wisc.edu",
  github: "https://github.com/karank2512",
  linkedin: "https://www.linkedin.com/in/karankapur5",
  // Recruiter-facing resume (Google Drive; opens a preview they can read + download).
  // To use a local file instead, drop a PDF at /public/resume.pdf and set this to "./resume.pdf".
  resume: "https://drive.google.com/file/d/1ZQ9X3MWkRsg8dWeEyoD7dzHzET1OYz6V/view?usp=drivesdk",
};

// Rotating "system" commands for the hero terminal.
// Each line "types" out, prints its result, then moves to the next.
export const terminalCommands: { cmd: string; out: string }[] = [
  { cmd: "thaw fork --session llm", out: "✓ live LLM state forked in 0.88s median on H100s" },
  { cmd: "relayiq route --field email", out: "✓ 3.3× cheaper per usable lead, low-confidence writes gated" },
  { cmd: "refball model --officiating", out: "✓ 8,874 games, 102 refs → a carefully qualified null" },
  { cmd: "f1 predict --race strategy", out: "✓ pit windows + tyre deltas modeled per stint" },
  { cmd: "nfl analyze --qb-decision", out: "✓ decision quality scored beyond box-score stats" },
  { cmd: "eurofins forecast --analyte", out: "✓ 10K+ records → pre-test analyte predictions" },
  { cmd: "gym log --progressive-overload", out: "✓ discipline compiled, no errors" },
  { cmd: "dj mix --playlist", out: "♪ now spinning. ask me about the transitions" },
];

export const about: string[] = [
  "I’m a CS + Data Science new grad from UW-Madison who likes living where infrastructure meets insight: the messy middle where a system has to be fast and the numbers have to mean something.",
  "Most of my favorite work starts as a pile of noisy data or a slow pipeline and ends as something people actually use: a sub-second LLM fork, an analyte forecast that saves a lab a rerun, a model that explains a quarterback’s decision.",
  "Off the clock I’m at the gym, on a golf course losing balls, learning to DJ, planning the next trip, or arguing about an F1 strategy call. I like models more when they explain something happening at full speed.",
];

export const projects: Project[] = [
  {
    title: "thaw",
    blurb: "Open-source Rust + CUDA system that snapshots and restores live LLM state.",
    detail:
      "The problem: branching an LLM session normally means a full cold boot. thaw forks a live session in under a second; I built the cloud storage layer that saves and restores the snapshots.",
    proves:
      "I can reason about GPUs, memory, and storage at a low level and turn it into infrastructure other people build on.",
    stack: ["Rust", "CUDA", "PyO3 FFI", "gRPC", "AWS S3", "LSM-trees", "Raft"],
    metrics: [
      { value: "0.88s", label: "to fork a live session (was 340s)" },
      { value: "14.3 GB/s", label: "snapshot restore speed" },
      { value: "3.4×", label: "faster 70B model loading" },
    ],
    tags: ["AI Systems", "Low-Level Systems", "Infra"],
    links: [
      { label: "thaw.sh", href: "https://thaw.sh/" },
      { label: "GitHub", href: "https://github.com/thaw-ai/thaw" },
    ],
    featured: true,
  },
  {
    title: "RelayIQ: Enrichment Control Plane",
    blurb: "Open-source control plane that decides when GTM enrichment credits are worth spending.",
    detail:
      "The problem: enrichment workflows burn credits on fields they don't need and write junk into the CRM. RelayIQ spends credits only where they pay off and blocks low-confidence data at the door.",
    proves: "I can design a control plane around a real cost problem, not just a pipeline around data.",
    stack: ["Python", "FastAPI", "TypeScript", "React", "Docker", "Terraform", "HubSpot API"],
    metrics: [
      { value: "3.3×", label: "cheaper per usable lead" },
      { value: "68% → 77%", label: "accuracy of data written to CRM" },
      { value: "495", label: "test leads with known answers" },
    ],
    tags: ["Data Engineering", "GTM Engineering", "Infra"],
    links: [{ label: "GitHub", href: "https://github.com/karank2512/RelayIQ" }],
    featured: true,
  },
  {
    title: "Ref Ball? NBA Officiating Analysis",
    blurb: "Do NBA refs decide games? A Bayesian model says: probably not.",
    detail:
      "The problem: every fan swears the refs rig games, but nobody tests it properly. I modeled 8,874 games in PyMC and found no meaningful referee effect after stress-testing the result from every angle.",
    proves: "I care enough about statistical rigor to publish a null result and defend it.",
    stack: ["Python", "PyMC", "Pandas", "Streamlit", "Bayesian modeling"],
    metrics: [
      { value: "8,874", label: "NBA games modeled" },
      { value: "102", label: "referees tracked" },
      { value: "No effect", label: "the verdict, after stress tests" },
    ],
    tags: ["Sports Analytics", "AI/ML", "Analytics & Viz"],
    links: [{ label: "GitHub", href: "https://github.com/karank2512/refball" }],
    featured: true,
  },
  {
    title: "NFL Quarterback Decision Metric",
    blurb: "A model that scores quarterback decision quality beyond the box score.",
    detail:
      "The problem: box scores reward lucky throws. This metric grades the decision itself, using coverage and expected value, so a smart throw that fails still scores well.",
    proves: "I can take a sport I love and turn intuition into a defensible, data-backed metric.",
    stack: ["Python", "Pandas", "scikit-learn", "NumPy", "Matplotlib"],
    metrics: [
      { value: "EV-based", label: "scores the choice, not the outcome" },
      { value: "Play-level", label: "coverage + game context inputs" },
    ],
    tags: ["Sports Analytics", "AI/ML"],
    featured: true,
  },
  {
    title: "Eurofins Predictive Analytics System",
    blurb: "Forecasts lab test results before the lab runs the test.",
    detail:
      "The problem: labs run costly tests blind, and reruns waste days. This capstone for Eurofins Scientific predicts the result first, with a confidence score attached, so technicians get a head start.",
    proves: "I can ship a real data product for a real client, from ingestion pipeline to UI.",
    stack: ["FastAPI", "React", "TypeScript", "Pandas", "scikit-learn"],
    metrics: [
      { value: "10K+", label: "past lab records learned from" },
      { value: "4+", label: "business units covered" },
      { value: "Scored", label: "confidence on every prediction" },
    ],
    tags: ["Data Engineering", "AI/ML"],
    featured: true,
  },
  {
    title: "Formula 1 Race Strategy Prediction Pipeline",
    blurb: "Models pit windows and tyre strategy across a race.",
    detail:
      "The problem: pit strategy decides races but is mostly gut feel. This pipeline models tyre wear and pit windows from timing data to predict the right call for each stint.",
    proves: "I can build a data pipeline around a fast-moving, real-world decision problem.",
    stack: ["Python", "Pandas", "scikit-learn", "BigQuery"],
    metrics: [
      { value: "Per-stint", label: "tyre + strategy modeling" },
      { value: "Pit-window", label: "timing predictions" },
    ],
    tags: ["Sports Analytics", "Data Engineering"],
    featured: true,
  },
  {
    title: "MLB Pitching Release Point Analysis",
    blurb: "Finds which pitchers are tipping their pitches.",
    detail:
      "The problem: a pitcher whose release point drifts is readable. This analysis clusters release points to show who is consistent and who is giving their pitches away.",
    proves: "I'm comfortable in the data-viz + statistics lane, not just the modeling one.",
    stack: ["Python", "Pandas", "Matplotlib", "R", "ggplot2"],
    metrics: [
      { value: "Clustered", label: "release-point consistency" },
      { value: "Visual", label: "scouting-style output" },
    ],
    tags: ["Sports Analytics", "Analytics & Viz"],
  },
  {
    title: "AI-Powered Intrusion Detection System",
    blurb: "Flags network intrusions in near real time.",
    detail:
      "The problem: attacks hide inside normal-looking traffic. Trained models to flag intrusions as they happen, tuned so false alarms stay rare.",
    proves: "I can apply ML to security and care about the trade-offs, not just accuracy.",
    stack: ["Python", "scikit-learn", "PyTorch", "Pandas"],
    metrics: [
      { value: "Real-time", label: "anomaly detection" },
      { value: "Tuned", label: "to keep false alarms rare" },
    ],
    tags: ["AI Systems", "Security"],
  },
  {
    title: "Custom UNIX Shell",
    blurb: "A working shell written from scratch in C.",
    detail:
      "Parsing, process creation, pipes, I/O redirection, and built-ins, all from scratch. The project that makes the OS stop being a black box.",
    proves: "I understand what's happening under the abstractions: processes, fds, syscalls.",
    stack: ["C", "Linux/UNIX", "Systems Programming"],
    metrics: [
      { value: "Pipes + IO", label: "redirection, job control" },
      { value: "From scratch", label: "no frameworks, just C" },
    ],
    tags: ["Low-Level Systems"],
  },
];

export const experience: Experience[] = [
  {
    role: "Co-Founder & Cloud Storage Engineer",
    org: "thaw (Open Source)",
    location: "Madison, WI",
    start: "Apr 2026",
    end: "Present",
    bullets: [
      "Engineered thaw, a Rust + CUDA inference system that cut vLLM session branching from ~340s cold boot to a 0.88s median fork on H100s by snapshotting and restoring live LLM state.",
      "Own the cloud storage layer: durable persistence and retrieval of large snapshots (weights, KV cache, prefix-cache metadata, scheduler state).",
      "Wired cloud-backed snapshots into a double-buffered restore path, contributing to 14.3 GB/s weight restore throughput and 3.4× faster 70B model loading.",
    ],
    tags: ["Rust", "CUDA", "AWS S3", "gRPC", "Systems"],
  },
  {
    role: "Data Engineer (Senior Design Capstone)",
    org: "Eurofins Scientific",
    location: "Madison, WI",
    start: "Jan 2026",
    end: "May 2026",
    bullets: [
      "Architected an end-to-end predictive analytics system (FastAPI, React, TypeScript) turning 10K+ historical records into pre-test analyte forecasts.",
      "Built scalable ingestion + preprocessing across lab datasets for 4+ business units, standardizing noisy chemistry data into prediction-ready inputs.",
      "Generated analyte estimates, confidence scores, and comparable-sample recommendations to speed up lab decision-making.",
    ],
    tags: ["FastAPI", "React", "TypeScript", "ML"],
  },
  {
    role: "Computer Support Assistant",
    org: "Dept. of Electrical & Computer Engineering, UW-Madison",
    location: "Madison, WI",
    start: "Jan 2025",
    end: "May 2026",
    bullets: [
      "Front-line technical support across 1,500+ university-managed Windows, macOS, and Linux machines for faculty, staff, researchers, and students.",
      "Cut device downtime ~40% by writing automated monitoring and log-analysis scripts to catch recurring failures and bottlenecks.",
      "Resolved 1,000+ IT tickets in the department’s ITSM platform, helping raise end-user satisfaction to 98%.",
    ],
    tags: ["Automation", "Linux", "Scripting", "Support"],
  },
  {
    role: "AI Fellow",
    org: "Wisconsin Summer AI Lab, OpenAI × UW-Madison",
    location: "Madison, WI",
    start: "Jun 2025",
    end: "Aug 2025",
    bullets: [
      "Built a retrieval-augmented platform serving 10+ concurrent users with LangChain, Pinecone, and both OpenAI and Hugging Face model APIs, cutting manual document lookup time ~40%.",
      "Deployed a Streamlit app for real-time semantic search and context-aware inference for non-technical users.",
      "Designed multi-domain scaling strategies handling 50+ concurrent queries at sub-2s latency while reducing infra costs ~25%.",
    ],
    tags: ["LangChain", "Pinecone", "RAG", "OpenAI"],
  },
  {
    role: "Automation & Compliance Engineering Intern",
    org: "HCLSoftware",
    location: "Noida, India",
    start: "Jul 2024",
    end: "Sep 2024",
    bullets: [
      "Cut regression testing cycles ~60% by authoring 50+ automated test scripts for a large public-sector SaaS platform.",
      "Authored compliance validation reports aligning the platform with government IT standards and audit requirements.",
      "Improved onboarding conversion ~30% via UX audits and analytics-driven workflow redesign with cross-functional teams.",
    ],
    tags: ["Selenium", "Automation", "Compliance", "QA"],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    id: "aiml",
    title: "AI / ML",
    blurb: "Models that have to earn their keep.",
    skills: [
      "PyTorch",
      "scikit-learn",
      "LangChain",
      "Pinecone",
      "Hugging Face",
      "OpenAI APIs",
      "RAG / vector search",
    ],
    related: [
      "thaw",
      "NFL Quarterback Decision Metric",
      "Eurofins Predictive Analytics System",
      "AI-Powered Intrusion Detection System",
    ],
  },
  {
    id: "data",
    title: "Data Engineering",
    blurb: "Moving and shaping data at volume.",
    skills: ["Apache Spark", "Apache Kafka", "Cassandra", "HDFS", "BigQuery", "Pandas", "NumPy"],
    related: [
      "Eurofins Predictive Analytics System",
      "Formula 1 Race Strategy Prediction Pipeline",
    ],
  },
  {
    id: "systems",
    title: "Systems / Low-Level",
    blurb: "Where the abstractions stop.",
    skills: ["Rust", "CUDA / PyO3 FFI", "C", "C++", "gRPC", "Raft", "LSM-trees", "Redis", "Linux/UNIX", "Docker"],
    related: ["thaw", "Custom UNIX Shell"],
  },
  {
    id: "fullstack",
    title: "Full Stack",
    blurb: "Turning models into things people click.",
    skills: ["React", "Node.js", "TypeScript", "FastAPI", "Flask", "Streamlit", "OAuth 2.0", "Firebase"],
    related: ["Eurofins Predictive Analytics System"],
  },
  {
    id: "analytics",
    title: "Analytics & Visualization",
    blurb: "Making the numbers say something.",
    skills: ["SQL", "R", "ggplot2", "Matplotlib", "Tableau", "Statistical modeling"],
    related: ["MLB Pitching Release Point Analysis", "NFL Quarterback Decision Metric"],
  },
  {
    id: "cloud",
    title: "Cloud / Infrastructure",
    blurb: "Where it all has to actually run.",
    skills: ["AWS (Bedrock / S3)", "Google Cloud", "BigQuery", "Docker", "Cloud storage layers"],
    related: ["thaw", "Wisconsin Summer AI Lab"],
  },
];

// Languages shown as a quick strip under the skill groups.
export const languages: string[] = [
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "SQL",
  "TypeScript",
  "JavaScript",
  "R",
  "HTML/CSS",
];

export const hobbies: Hobby[] = [
  { emoji: "🏋️", title: "Gym", line: "Where I debug discipline." },
  { emoji: "⛳", title: "Golf", line: "A humbling sport disguised as a weekend plan." },
  { emoji: "✈️", title: "Travel", line: "Collecting cities, food, and stories." },
  { emoji: "🎧", title: "DJing / Music", line: "Beginner DJ, professional playlist overthinker." },
  { emoji: "🏎️", title: "Sports / F1", line: "I like models more when they explain something happening at full speed." },
];

export const music = {
  // Paste a Spotify playlist/album/track URL here, or leave "" for the fallback state.
  // How to get it: open Spotify → playlist → Share → Copy link to playlist.
  // Works with normal links like:
  //   https://open.spotify.com/playlist/XXXXXXXXXXXX
  // The component converts it to an embed automatically.
  spotifyUrl: "https://open.spotify.com/playlist/7GjJGKWvqkg4NHLWb91YwL?si=ebbf57ae829f448c",
  caption: "What’s on rotation while I build: gym sets, study sessions, and questionable car singalongs.",
};

export const contact = {
  closing:
    "I’m looking for roles where I can build useful systems, ship data products, and solve problems with real-world impact.",
};

// ── Fun mode (Hinge-style profile) ──────────────────────────────────────────
// Photos live in /public/photos/. Order = order in the profile stack.
export const photos: Photo[] = [
  {
    src: "./photos/pro-headshot.png",
    alt: "Karan's professional headshot, all-black suit",
  },
  {
    src: "./photos/graduation.png",
    alt: "Karan popping champagne in a graduation gown in front of Bascom Hall",
    caption: "CS+DS grad from University of Wisconsin - Madison",
  },
  {
    src: "./photos/bar-night.png",
    alt: "Karan at a neon-lit bar, mid gesture",
  },
  {
    src: "./photos/atv-trail.png",
    alt: "Karan riding an ATV down a dusty desert trail",
    caption: "Sending it through Cabo dust.",
  },
  {
    src: "./photos/christkindlmarket.png",
    alt: "Karan smiling in the snow at Christkindlmarket Chicago",
  },
];

// Hinge-style prompt cards, but I'm looking for a job, not a date.
// Rewrite these freely, they read best in your voice.
export const hingePrompts: HingePrompt[] = [
  {
    prompt: "My simple pleasures",
    answer:
      "Golf on a Saturday morning, a clean gym pump, and a pipeline that passes on the first run.",
  },
  {
    prompt: "Together, we could…",
    answer:
      "work on something real: data engineering, AI/ML systems, data analytics, GTM engineering, or forward-deployed builds. You bring the messy problem, I'll bring the obsession.",
  },
  {
    prompt: "Green flags I look for",
    answer:
      "Hard problems, real users, a team that ships, and someone who says \"let's look at the data\" unironically.",
  },
  {
    prompt: "Don't hate me if I…",
    answer: "spend 20 minutes perfecting a DJ transition you'll hear for 8 seconds.",
  },
  {
    prompt: "The way to win me over is",
    answer: "a weird data problem, a real deadline, and the freedom to chase both.",
  },
];
