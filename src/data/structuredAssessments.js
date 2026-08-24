// Structured assessment content (SJT + Career Drivers).
// Exploratory career-development tools — NOT clinical/diagnostic/certified psychometric tests.

// ============================================================================
// MODULE A — SITUATIONAL JUDGMENT TEST
// One scenario, one primary answer. Signals are behavioural tendency deltas.
// ============================================================================
export const SJT_SCENARIOS = [
  {
    id: "sjt1",
    text: "You are part of a four-person university project. Two days before the deadline, it becomes clear that one person has barely completed any of their work. What are you most likely to do?",
    options: [
      { key: "A", text: "Take over most of their work yourself because the final result matters more than fairness.", signals: { ownership: 2, delegation: -1, control_orientation: 1 } },
      { key: "B", text: "Speak directly with the person, clarify what must still be done and redistribute the remaining work across the team.", signals: { assertiveness: 2, collaboration: 2, conflict_management: 2 } },
      { key: "C", text: "Tell the team leader or lecturer and let them decide what should happen.", signals: { escalation_preference: 2, risk_avoidance: 1, ownership: -1 } },
      { key: "D", text: "Focus on your own part because everyone should be responsible for their own contribution.", signals: { individualism: 2, team_responsibility: -2 } },
      { key: "E", text: "Call the whole group together, reorganise the project and assign clear responsibilities and deadlines.", signals: { leadership: 2, initiative: 2, organisation: 2 } },
    ],
  },
  {
    id: "sjt2",
    text: "You have spent three months developing an idea that you believe in. The first group of potential customers reacts poorly to it. What would you most likely do?",
    options: [
      { key: "A", text: "Keep going. New ideas often take time for people to understand.", signals: { persistence: 2, conviction: 1, adaptability: -1 } },
      { key: "B", text: "Change the idea significantly based on the feedback.", signals: { adaptability: 2, customer_orientation: 2 } },
      { key: "C", text: "Stop the project and move on to something else.", signals: { decision_speed: 1, persistence: -2 } },
      { key: "D", text: "Collect more evidence before deciding whether to continue or change direction.", signals: { evidence_orientation: 2, analytical_decision_making: 2, impulsivity: -1 } },
    ],
  },
  {
    id: "sjt3",
    text: "You are given an important task, but the instructions are vague. Your manager is busy and difficult to reach. What do you do?",
    options: [
      { key: "A", text: "Wait until you can get clearer instructions.", signals: { ambiguity_tolerance: -2, risk_avoidance: 2 } },
      { key: "B", text: "Make reasonable assumptions and start working.", signals: { initiative: 2, ambiguity_tolerance: 2, independence: 2 } },
      { key: "C", text: "Ask colleagues how similar tasks were handled before.", signals: { collaboration: 1, resourcefulness: 2 } },
      { key: "D", text: "Prepare several possible approaches and ask the manager to choose later.", signals: { analytical_thinking: 2, planning: 2, decision_speed: -1 } },
    ],
  },
  {
    id: "sjt4",
    text: "Your group has chosen an approach you think is clearly weaker than another idea you have. What are you most likely to do?",
    options: [
      { key: "A", text: "Go along with the group to avoid unnecessary conflict.", signals: { conflict_avoidance: 2, assertiveness: -2 } },
      { key: "B", text: "Explain your idea clearly and try to persuade the group.", signals: { assertiveness: 2, persuasion: 2, leadership: 1 } },
      { key: "C", text: "Ask questions that help the group compare both approaches objectively.", signals: { evidence_orientation: 2, collaboration: 2, conflict_management: 2 } },
      { key: "D", text: "Let the group proceed, but separately prepare your own version.", signals: { independence: 2, collaboration: -1 } },
    ],
  },
  {
    id: "sjt5",
    text: "You arrive at work and discover four urgent problems at the same time. You cannot complete all of them immediately. What are you most likely to do first?",
    options: [
      { key: "A", text: "Start with the easiest one so that at least something gets completed quickly.", signals: { quick_win_orientation: 2 } },
      { key: "B", text: "Identify which problem has the biggest consequences and start there.", signals: { prioritisation: 3, ownership: 1 } },
      { key: "C", text: "Ask your manager which task should come first.", signals: { hierarchy_preference: 2, risk_avoidance: 1 } },
      { key: "D", text: "Try to work on several problems at once.", signals: { multitasking_preference: 2, prioritisation: -1 } },
    ],
  },
  {
    id: "sjt6",
    text: "A customer strongly criticises something you produced. You believe some of the criticism is unfair. What do you do?",
    options: [
      { key: "A", text: "Defend your work and explain why the customer is wrong.", signals: { assertiveness: 2, defensiveness: 1, customer_orientation: -1 } },
      { key: "B", text: "Listen carefully, separate useful feedback from unfair criticism and decide what should actually change.", signals: { emotional_regulation: 2, evidence_orientation: 2, customer_orientation: 2 } },
      { key: "C", text: "Make all the requested changes to keep the customer satisfied.", signals: { customer_orientation: 2, boundaries: -1 } },
      { key: "D", text: "Ask someone more senior to deal with the customer.", signals: { conflict_avoidance: 2, ownership: -1 } },
    ],
  },
  {
    id: "sjt7",
    text: "You are offered responsibility for a project that interests you, but you have never done anything similar before. What are you most likely to do?",
    options: [
      { key: "A", text: "Accept immediately and learn as you go.", signals: { risk_tolerance: 2, initiative: 2, planning: -1 } },
      { key: "B", text: "Accept, but first identify what you need to learn and who could help you.", signals: { initiative: 2, learning_orientation: 2, risk_management: 2 } },
      { key: "C", text: "Decline because you do not yet have enough experience.", signals: { risk_avoidance: 2, confidence: -1 } },
      { key: "D", text: "Ask to support someone more experienced before taking responsibility yourself.", signals: { learning_orientation: 2, risk_tolerance: -1 } },
    ],
  },
  {
    id: "sjt8",
    text: "You are performing well in a role, but after several months the work starts to feel repetitive. What would you most likely do?",
    options: [
      { key: "A", text: "Stay because being good at the job is more important than being excited by it.", signals: { stability: 2, routine_tolerance: 2 } },
      { key: "B", text: "Look for ways to improve or automate the process.", signals: { optimisation: 2, initiative: 2 } },
      { key: "C", text: "Ask for new responsibilities or a different type of project.", signals: { growth_orientation: 2, variety_preference: 2 } },
      { key: "D", text: "Start looking for another job.", signals: { change_orientation: 2, routine_tolerance: -2 } },
    ],
  },
  {
    id: "sjt9",
    text: "You are leading a small team. A friend on the team is consistently underperforming. What do you do?",
    options: [
      { key: "A", text: "Give them extra time because you know them personally.", signals: { relationship_loyalty: 2, performance_orientation: -1 } },
      { key: "B", text: "Have an honest private conversation and agree on clear expectations.", signals: { coaching_orientation: 2, assertiveness: 2, relationship_management: 2 } },
      { key: "C", text: "Quietly give their responsibilities to stronger team members.", signals: { conflict_avoidance: 2, delegation: 1 } },
      { key: "D", text: "Treat them exactly as you would any other team member and formally address the performance issue.", signals: { performance_orientation: 2, fairness_orientation: 2 } },
    ],
  },
  {
    id: "sjt10",
    text: "You have a secure position and receive an opportunity with much higher potential income, but the outcome is uncertain. What would most influence your decision?",
    options: [
      { key: "A", text: "The size of the possible financial upside.", signals: { wealth_motivation: 2, risk_tolerance: 1 } },
      { key: "B", text: "How much I could learn and develop.", signals: { mastery: 2, growth_orientation: 2 } },
      { key: "C", text: "How likely I am to succeed based on evidence.", signals: { evidence_orientation: 2, risk_management: 2 } },
      { key: "D", text: "The security I would be giving up.", signals: { security_motivation: 3 } },
      { key: "E", text: "How much independence and control the new opportunity gives me.", signals: { autonomy: 3 } },
    ],
  },
  {
    id: "sjt11",
    text: "During a meeting someone strongly challenges your idea in front of other people. What do you do first?",
    options: [
      { key: "A", text: "Defend the idea immediately.", signals: { assertiveness: 2, competition: 1 } },
      { key: "B", text: "Ask them to explain specifically what they disagree with.", signals: { curiosity: 2, conflict_management: 2, evidence_orientation: 1 } },
      { key: "C", text: "Say little in the meeting and speak with them privately later.", signals: { conflict_avoidance: 1, relationship_management: 1 } },
      { key: "D", text: "Let the group decide which view is stronger.", signals: { group_orientation: 2, individual_ownership: -1 } },
    ],
  },
  {
    id: "sjt12",
    text: "You have been working hard on something for two months, but you cannot see much improvement. What are you most likely to do?",
    options: [
      { key: "A", text: "Keep going because progress sometimes takes time.", signals: { persistence: 2 } },
      { key: "B", text: "Change the method and test a different approach.", signals: { adaptability: 2, experimentation: 2 } },
      { key: "C", text: "Ask someone more experienced to evaluate what you are doing.", signals: { learning_orientation: 2, coachability: 2 } },
      { key: "D", text: "Lose motivation and move on to something where progress is more visible.", signals: { progress_motivation: 3, persistence: -1 } },
    ],
  },
];

// ============================================================================
// MODULE B — CAREER DRIVERS FORCED CHOICE
// 20 A/B items. Each option maps to one driver. Forced choice (no Neither/Both).
// ============================================================================
export const DRIVER_DIMENSIONS = [
  "AUTONOMY", "WEALTH", "SECURITY", "STATUS", "MASTERY",
  "COMPETITION", "CREATION", "IMPACT", "BELONGING", "ADVENTURE",
];

export const DRIVER_ITEMS = [
  { id: "d1", a: { text: "Be exceptionally good at something difficult.", driver: "MASTERY" }, b: { text: "Be widely recognised as successful.", driver: "STATUS" } },
  { id: "d2", a: { text: "Have more control over my time.", driver: "AUTONOMY" }, b: { text: "Earn significantly more money.", driver: "WEALTH" } },
  { id: "d3", a: { text: "Build something that is mine.", driver: "CREATION" }, b: { text: "Be part of a highly successful organisation.", driver: "BELONGING" } },
  { id: "d4", a: { text: "Beat strong competitors.", driver: "COMPETITION" }, b: { text: "Help another person improve.", driver: "IMPACT" } },
  { id: "d5", a: { text: "Have a secure and predictable career.", driver: "SECURITY" }, b: { text: "Have the freedom to change direction whenever I want.", driver: "AUTONOMY" } },
  { id: "d6", a: { text: "Become known as one of the best in my field.", driver: "STATUS" }, b: { text: "Have a job that gives me freedom and independence.", driver: "AUTONOMY" } },
  { id: "d7", a: { text: "Solve a difficult intellectual or technical problem.", driver: "MASTERY" }, b: { text: "Create something original that did not exist before.", driver: "CREATION" } },
  { id: "d8", a: { text: "Earn enough money to have a very high standard of living.", driver: "WEALTH" }, b: { text: "Do work that clearly improves other people's lives.", driver: "IMPACT" } },
  { id: "d9", a: { text: "Work with ambitious people I respect.", driver: "BELONGING" }, b: { text: "Have maximum independence over how I work.", driver: "AUTONOMY" } },
  { id: "d10", a: { text: "Know that my career is financially secure.", driver: "SECURITY" }, b: { text: "Take a risk on an opportunity with much larger upside.", driver: "ADVENTURE" } },
  { id: "d11", a: { text: "Win and outperform other people.", driver: "COMPETITION" }, b: { text: "Become exceptionally skilled even if nobody notices.", driver: "MASTERY" } },
  { id: "d12", a: { text: "Be publicly recognised for my achievements.", driver: "STATUS" }, b: { text: "Earn a lot of money even if nobody knows about it.", driver: "WEALTH" } },
  { id: "d13", a: { text: "Create a product, business, design or project that feels personally mine.", driver: "CREATION" }, b: { text: "Work on something important together with a strong team.", driver: "BELONGING" } },
  { id: "d14", a: { text: "Have a predictable life with low financial risk.", driver: "SECURITY" }, b: { text: "Experience variety, change and uncertainty.", driver: "ADVENTURE" } },
  { id: "d15", a: { text: "See another person succeed partly because of my help.", driver: "IMPACT" }, b: { text: "Personally achieve a difficult result.", driver: "MASTERY" } },
  { id: "d16", a: { text: "Have the freedom to decide what projects I work on.", driver: "AUTONOMY" }, b: { text: "Have a prestigious role that other people respect.", driver: "STATUS" } },
  { id: "d17", a: { text: "Build wealth as quickly as reasonably possible.", driver: "WEALTH" }, b: { text: "Spend my career doing work I find deeply interesting.", driver: "MASTERY" } },
  { id: "d18", a: { text: "Create something new even if it could fail.", driver: "CREATION" }, b: { text: "Follow a reliable path with a high chance of success.", driver: "SECURITY" } },
  { id: "d19", a: { text: "Work in an environment with strong competition and clear winners.", driver: "COMPETITION" }, b: { text: "Work in an environment where people strongly support each other.", driver: "BELONGING" } },
  { id: "d20", a: { text: "Choose the safer opportunity.", driver: "SECURITY" }, b: { text: "Choose the opportunity that would create the better story and experience.", driver: "ADVENTURE" } },
];