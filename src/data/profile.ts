/**
 * ============================================================================
 *  profile.ts — SINGLE SOURCE OF TRUTH
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

export const identity = {
  name: "Karan Kapur",
  initials: "KK",
  // shown under the name in the hero
  headline:
    "AI/ML & Data Engineer building fast systems, useful models, and sports-flavored analytics.",
  // the personal, human one-liner
  oneLiner:
    "CS + DS at UW-Madison. Co-founder of thaw. Usually somewhere between the gym, a golf course, a playlist, and a weird data problem.",
  location: "Madison, WI",
  education:
    "B.S. Computer Science + Data Science, Certificate in Entrepreneurship — University of Wisconsin–Madison (May 2026)",
  // roles Karan is targeting — shown as a rotating word in the hero
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
  // Recruiter-facing resume (Google Drive — opens a preview they can read + download).
  // To use a local file instead, drop a PDF at /public/resume.pdf and set this to "./resume.pdf".
  resume: "https://drive.google.com/file/d/1_fXjnSd0VKHgB0k2Rz906LIHbPDBng5K/view?usp=sharing",
};

// Rotating "system" commands for the hero terminal.
// Each line "types" out, prints its result, then moves to the next.
export const terminalCommands: { cmd: string; out: string }[] = [
  { cmd: "thaw fork --session llm", out: "✓ live LLM state forked in 0.88s median on H100s" },
  { cmd: "f1 predict --race strategy", out: "✓ pit windows + tyre deltas modeled per stint" },
  { cmd: "nfl analyze --qb-decision", out: "✓ decision quality scored beyond box-score stats" },
  { cmd: "eurofins forecast --analyte", out: "✓ 10K+ records → pre-test analyte predictions" },
  { cmd: "gym log --progressive-overload", out: "✓ discipline compiled, no errors" },
  { cmd: "dj mix --playlist", out: "♪ now spinning. ask me about the transitions" },
];

export const about: string[] = [
  "I’m a CS + Data Science student at UW-Madison who likes living where infrastructure meets insight — the messy middle where a system has to be fast *and* the numbers have to mean something.",
  "Most of my favorite work starts as a pile of noisy data or a slow pipeline and ends as something people actually use: a sub-second LLM fork, an analyte forecast that saves a lab a rerun, a model that explains a quarterback’s decision.",
  "Off the clock I’m at the gym, on a golf course losing balls, learning to DJ, planning the next trip, or arguing about an F1 strategy call. I like models more when they explain something happening at full speed.",
];

export const projects: Project[] = [
  {
    title: "thaw",
    blurb: "An open-source Rust + CUDA system that snapshots and restores live LLM state.",
    detail:
      "thaw turns LLM session branching from a cold-boot tax into a near-instant fork by snapshotting and restoring live inference state. I own the cloud storage layer — durable persistence and retrieval of large snapshots (weights, KV cache, prefix-cache metadata, scheduler state) wired into thaw’s double-buffered restore path.",
    proves:
      "I can reason about GPUs, memory, and storage at a low level and turn it into infrastructure other people build on.",
    stack: ["Rust", "CUDA", "PyO3 FFI", "gRPC", "AWS S3", "LSM-trees", "Raft"],
    metrics: [
      { value: "340s → 0.88s", label: "cold boot → median fork" },
      { value: "14.3 GB/s", label: "weight restore throughput" },
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
    title: "NFL Quarterback Decision Metric",
    blurb: "A model that scores quarterback decision quality beyond the box score.",
    detail:
      "Built a metric that grades the decision a QB made — not just the outcome — using play context, coverage, and expected value. The goal: separate good process from lucky results, the way a scout would.",
    proves: "I can take a sport I love and turn intuition into a defensible, data-backed metric.",
    stack: ["Python", "Pandas", "scikit-learn", "NumPy", "Matplotlib"],
    metrics: [
      { value: "EV-based", label: "decision scoring" },
      { value: "Play-level", label: "context features" },
    ],
    tags: ["Sports Analytics", "AI/ML"],
    featured: true,
  },
  {
    title: "Eurofins Predictive Analytics System",
    blurb: "End-to-end system that forecasts analyte results before the lab runs the test.",
    detail:
      "Senior design capstone for Eurofins Scientific: a FastAPI + React + TypeScript platform that turns 10K+ historical records into pre-test analyte forecasts with confidence scores and comparable-sample recommendations — cutting rerun-related delays and giving technicians a head start.",
    proves: "I can ship a real data product for a real client, from ingestion pipeline to UI.",
    stack: ["FastAPI", "React", "TypeScript", "Pandas", "scikit-learn"],
    metrics: [
      { value: "10K+", label: "records modeled" },
      { value: "4+", label: "business units served" },
      { value: "Confidence", label: "scored predictions" },
    ],
    tags: ["Data Engineering", "AI/ML"],
    featured: true,
  },
  {
    title: "Formula 1 Race Strategy Prediction Pipeline",
    blurb: "A pipeline that models pit windows and tyre strategy across a race.",
    detail:
      "Ingests timing, tyre, and stint data to predict race-strategy decisions — when to pit, which compound, and how the undercut plays out. F1 is the perfect testbed: high-stakes decisions made at 300 km/h with telemetry attached.",
    proves: "I can build a data pipeline around a fast-moving, real-world decision problem.",
    stack: ["Python", "Pandas", "scikit-learn", "BigQuery"],
    metrics: [
      { value: "Per-stint", label: "strategy modeling" },
      { value: "Pit-window", label: "predictions" },
    ],
    tags: ["Sports Analytics", "Data Engineering"],
    featured: true,
  },
  {
    title: "MLB Pitching Release Point Analysis",
    blurb: "Analysis of pitcher release points and what they reveal about deception and risk.",
    detail:
      "Studied pitch release-point consistency and clustering to surface signal about repertoire, tunneling, and tip-offs — translating biomechanical scatter into something a coaching staff could read.",
    proves: "I’m comfortable in the data-viz + statistics lane, not just the modeling one.",
    stack: ["Python", "Pandas", "Matplotlib", "R", "ggplot2"],
    metrics: [
      { value: "Release-pt", label: "clustering" },
      { value: "Visual", label: "scouting output" },
    ],
    tags: ["Sports Analytics", "Analytics & Viz"],
  },
  {
    title: "AI-Powered Intrusion Detection System",
    blurb: "An ML system that flags anomalous network behavior in near real time.",
    detail:
      "Trained models on network traffic to separate normal patterns from intrusions, tuning for the precision/recall trade-off that actually matters when false alarms are expensive.",
    proves: "I can apply ML to security and care about the trade-offs, not just accuracy.",
    stack: ["Python", "scikit-learn", "PyTorch", "Pandas"],
    metrics: [
      { value: "Real-time", label: "anomaly flags" },
      { value: "Tuned", label: "precision / recall" },
    ],
    tags: ["AI Systems", "Security"],
  },
  {
    title: "Custom UNIX Shell",
    blurb: "A shell written from scratch in C — pipes, redirection, job control.",
    detail:
      "Implemented a working command shell in C: parsing, process creation, pipelines, I/O redirection, and built-ins. The kind of project that makes the OS stop being a black box.",
    proves: "I understand what’s happening under the abstractions — processes, fds, syscalls.",
    stack: ["C", "Linux/UNIX", "Systems Programming"],
    metrics: [
      { value: "Pipes + IO", label: "redirection" },
      { value: "From scratch", label: "in C" },
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
      "Own the cloud storage layer — durable persistence and retrieval of large snapshots (weights, KV cache, prefix-cache metadata, scheduler state).",
      "Wired cloud-backed snapshots into a double-buffered restore path, contributing to 14.3 GB/s weight restore throughput and 3.4× faster 70B model loading.",
    ],
    tags: ["Rust", "CUDA", "AWS S3", "gRPC", "Systems"],
  },
  {
    role: "Data Engineer — Senior Design Capstone",
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
    org: "Wisconsin Summer AI Lab — OpenAI × UW-Madison",
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
  caption: "What’s on rotation while I build — gym sets, study sessions, and questionable car singalongs.",
};

export const contact = {
  closing:
    "I’m looking for roles where I can build useful systems, ship data products, and solve problems with real-world impact.",
};
