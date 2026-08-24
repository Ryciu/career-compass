// Module definitions for the user-facing flow (labels, routes, gating, type).
export const MODULES = [
  { id: "session1", label: "Who am I?", subtitle: "Open exploration of interests, strengths, and energy", route: "/app/session/who-am-i", type: "open", phase: 1 },
  { id: "sport", label: "Sport", subtitle: "Decoupling sport interest from a sport career", route: "/app/session/sport", type: "open", phase: 1 },
  { id: "gaming", label: "Gaming", subtitle: "Understanding what games actually reward", route: "/app/session/gaming", type: "open", phase: 1 },
  { id: "money", label: "Money, Status, Lifestyle", subtitle: "Money vs. interest, and the life you want", route: "/app/session/money", type: "open", phase: 1 },
  { id: "decision_ownership", label: "Decision Ownership", subtitle: "Is this really your decision?", route: "/app/session/decision-ownership", type: "open", phase: 2 },
  { id: "riasec", label: "Career Interest Inventory", subtitle: "An exploratory RIASEC-style inventory", route: "/app/riasec", type: "inventory", phase: 2 },
  { id: "work_style", label: "Work Style", subtitle: "18 sliders on how you work best", route: "/app/work-style", type: "sliders", phase: 2 },
  { id: "values", label: "Values", subtitle: "What outcomes truly matter to you", route: "/app/values", type: "values", phase: 2 },
  { id: "simulations", label: "Work Simulations", subtitle: "Five realistic mini-tasks", route: "/app/simulations", type: "simulations", phase: 2 },
  { id: "sjt", label: "Situational Judgment", subtitle: "How you act in real situations", route: "/app/sjt", type: "sjt", phase: 2 },
  { id: "career_drivers", label: "Career Drivers", subtitle: "Forced-choice: what truly drives you", route: "/app/career-drivers", type: "drivers", phase: 2 },
];

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
];