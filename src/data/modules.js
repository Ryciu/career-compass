// Session + module definitions for the user-facing flow.
// The experience is organised into FOUR short, separately-resumable sessions:
//   1. My Story        — open coaching (behavioural evidence)
//   2. My Profile      — interests, work style, values, drivers
//   3. How I Operate   — situational behaviour, strengths, energy
//   4. Reality Check   — work simulations
// Existing modules, routes, scoring and data are all preserved — only the
// grouping/sequencing on the dashboard changes.

export const MODULES = [
  { id: "session1", label: "Who am I?", shortLabel: "Story", subtitle: "Open exploration of interests, strengths, and energy", route: "/app/session/who-am-i", type: "open", phase: 1 },
  { id: "sport", label: "Sport", shortLabel: "Sport", subtitle: "Decoupling sport interest from a sport career", route: "/app/session/sport", type: "open", phase: 1 },
  { id: "gaming", label: "Gaming", shortLabel: "Gaming", subtitle: "Understanding what games actually reward", route: "/app/session/gaming", type: "open", phase: 1 },
  { id: "money", label: "Money, Status, Lifestyle", shortLabel: "Money", subtitle: "Money vs. interest, and the life you want", route: "/app/session/money", type: "open", phase: 1 },
  { id: "decision_ownership", label: "Decision Ownership", shortLabel: "Decisions", subtitle: "Is this really your decision?", route: "/app/session/decision-ownership", type: "open", phase: 1 },
  { id: "riasec", label: "Career Interests", shortLabel: "Interests", subtitle: "An exploratory RIASEC-style inventory", route: "/app/riasec", type: "inventory", phase: 2 },
  { id: "work_style", label: "Work Style", shortLabel: "Work Style", subtitle: "18 sliders on how you work best", route: "/app/work-style", type: "sliders", phase: 2 },
  { id: "values", label: "Values", shortLabel: "Values", subtitle: "What outcomes truly matter to you", route: "/app/values", type: "values", phase: 2 },
  { id: "career_drivers", label: "Career Drivers", shortLabel: "Drivers", subtitle: "Forced-choice: what truly drives you", route: "/app/career-drivers", type: "drivers", phase: 2 },
  { id: "sjt", label: "Situational Judgment", shortLabel: "SJT", subtitle: "How you act in real situations", route: "/app/sjt", type: "sjt", phase: 2 },
  { id: "natural_strengths", label: "Natural Strength Patterns", shortLabel: "Strengths", subtitle: "How you naturally produce results", route: "/app/natural-strengths", type: "strengths", phase: 2 },
  { id: "behavioral_energy", label: "Behavioral Energy Profile", shortLabel: "Energy", subtitle: "Natural vs adapted style", route: "/app/behavioral-energy", type: "energy", phase: 2 },
  { id: "simulations", label: "Work Simulations", shortLabel: "Reality Check", subtitle: "Five realistic mini-tasks", route: "/app/simulations", type: "simulations", phase: 2 },
];

export const MODULES_BY_ID = MODULES.reduce((acc, m) => { acc[m.id] = m; return acc; }, {});

// Four short sessions. Subtitles are PL per the product brief.
export const SESSIONS = [
  {
    id: "story",
    n: 1,
    label: "My Story",
    title: "1. My Story",
    subtitle: "Poznajmy Ciebie poza ocenami i nazwami zawodów.",
    duration: "20–25 min",
    completeText: "Zebraliśmy sporo informacji o tym, co naprawdę robiłeś, co Cię napędza i gdzie pojawia się energia. W kolejnej sesji przejdziemy do szybszych wyborów i preferencji.",
    route: "/app/session/story",
    modules: ["session1", "sport", "gaming", "money", "decision_ownership"],
  },
  {
    id: "profile",
    n: 2,
    label: "My Profile",
    title: "2. My Profile",
    subtitle: "Co Cię interesuje, jak lubisz pracować i co naprawdę Cię napędza.",
    duration: "20–25 min",
    route: "/app/session/profile",
    modules: ["riasec", "work_style", "values", "career_drivers"],
  },
  {
    id: "operate",
    n: 3,
    label: "How I Operate",
    title: "3. How I Operate",
    subtitle: "Jak działasz, podejmujesz decyzje i reagujesz w różnych sytuacjach.",
    duration: "25–30 min",
    route: "/app/session/operate",
    modules: ["sjt", "natural_strengths", "behavioral_energy"],
  },
  {
    id: "reality",
    n: 4,
    label: "Reality Check",
    title: "4. Reality Check",
    subtitle: "Mini wyzwania z różnych światów zawodowych.",
    duration: "25–30 min",
    route: "/app/session/reality",
    modules: ["simulations"],
  },
];

export const SESSIONS_BY_ID = SESSIONS.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

export const ALL_MODULE_IDS = MODULES.map((m) => m.id);

export function modulesForSession(sessionId) {
  const s = SESSIONS_BY_ID[sessionId];
  return s ? s.modules.map((id) => MODULES_BY_ID[id]).filter(Boolean) : [];
}

// A session is "complete" only when all its modules are complete.
export function isSessionComplete(sessionId, statusOf) {
  return modulesForSession(sessionId).every((m) => statusOf(m.id) === "complete");
}

// First incomplete module in a session, or null if all complete.
export function firstIncompleteInSession(sessionId, statusOf) {
  return modulesForSession(sessionId).find((m) => statusOf(m.id) !== "complete") || null;
}

export const PHASES = [
  { id: 1, label: "Explore who you are", subtitle: "Open coaching conversations" },
  { id: 2, label: "Build evidence", subtitle: "Inventories, values, and simulations" },
  { id: 3, label: "Results", subtitle: "Your Career DNA and hypotheses", route: "/app/analysis" },
];

export const RESULT_ROUTES = [
  { id: "analysis", label: "Analysis", route: "/app/analysis" },
  { id: "career-dna", label: "Career DNA", route: "/app/career-dna" },
  { id: "hypotheses", label: "Career Hypotheses", route: "/app/hypotheses" },
  { id: "education", label: "Education Direction", route: "/app/education" },
  { id: "experiments", label: "Experiments", route: "/app/experiments" },
  { id: "action-plan", label: "30-Day Plan", route: "/app/action-plan" },
  { id: "report", label: "Final Report", route: "/app/report" },
  { id: "visual-story", label: "Visual Story", route: "/app/visual-story" },
];