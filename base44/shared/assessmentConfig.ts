// Central configuration for Career Compass assessment content.
// All question banks, RIASEC items, work-style sliders, values cards, simulation prompts.

export const SESSION1_QUESTIONS = [
  {
    id: "s1_q1",
    text: "If you didn't have to choose studies or work for the next year, and had enough money for a normal life, what would you do Monday to Friday?",
    domain: "intrinsic_interest",
    first_instinct: false,
  },
  {
    id: "s1_q2",
    text: "Name three moments from the last few years when you were genuinely proud of yourself. What exactly did you do?",
    domain: "pride_achievement",
    first_instinct: false,
  },
  {
    id: "s1_q3",
    text: "What comes easier to you than to most people your age?",
    domain: "ability",
    first_instinct: false,
  },
  {
    id: "s1_q4",
    text: "What do other people most often come to you for help with?",
    domain: "social_value",
    first_instinct: false,
  },
  {
    id: "s1_q5",
    text: "What have you learned on your own, even though nobody forced you to?",
    domain: "self_direction",
    first_instinct: false,
  },
  {
    id: "s1_q6",
    text: "What required the most consistency from you over the last two years?",
    domain: "discipline",
    first_instinct: false,
  },
  {
    id: "s1_q7",
    text: "Why were you able to maintain that consistency?",
    domain: "motivation",
    first_instinct: false,
  },
  {
    id: "s1_q8",
    text: "What do you often start with enthusiasm but later abandon?",
    domain: "energy_drain",
    first_instinct: false,
  },
  {
    id: "s1_q9",
    text: "When did you last lose track of time while doing something?",
    domain: "flow",
    first_instinct: false,
  },
  {
    id: "s1_q10",
    text: "Tell me about a time you failed. What did you do afterwards?",
    domain: "resilience",
    first_instinct: false,
  },
  {
    id: "s1_q11",
    text: "Do you prefer achieving a great result alone, or being part of a team that achieves a great result? Why?",
    domain: "teamwork",
    first_instinct: false,
  },
  {
    id: "s1_q12",
    text: "What kind of problems do you enjoy solving?",
    domain: "problem_type",
    first_instinct: false,
  },
  {
    id: "s1_q13",
    text: "What tasks do you procrastinate most often?",
    domain: "energy_drain",
    first_instinct: false,
  },
  {
    id: "s1_q14",
    text: "For what achievement would you most want to be respected?",
    domain: "values_status",
    first_instinct: false,
  },
  {
    id: "s1_q15",
    text: "What would you like to be genuinely good at in five years?",
    domain: "future_direction",
    first_instinct: false,
  },
];

export const SPORT_QUESTIONS = [
  { id: "sport_q1", text: "What did you like most about sport: the game, the competition, the team, training, improving skills, winning, or something else?", domain: "sport_motivation" },
  { id: "sport_q2", text: "What did you like least?", domain: "sport_drain" },
  { id: "sport_q3", text: "If you could train very seriously six days a week for three years, how would you react?", domain: "sport_commitment" },
  { id: "sport_q4", text: "What's more interesting: achieving a result yourself, or helping someone else achieve one?", domain: "sport_coaching_vs_performance" },
  { id: "sport_q5", text: "Are you interested in why a specific training method works?", domain: "sport_science" },
  { id: "sport_q6", text: "Are you interested in anatomy, physiology, recovery, or programming training?", domain: "sport_science" },
  { id: "sport_q7", text: "Could you guide for half a year a person far less disciplined than you?", domain: "sport_coaching" },
  { id: "sport_q8", text: "What would interest you more: running training sessions, running a club/gym, or the business around sport?", domain: "sport_business" },
];

export const GAMING_QUESTIONS = [
  { id: "game_q1", text: "Which games do you most enjoy playing?", domain: "gaming_preference" },
  { id: "game_q2", text: "What exactly makes them engaging for you?", domain: "gaming_reward" },
  { id: "game_q3", text: "Have you ever wondered how a game was designed?", domain: "gaming_design_interest" },
  { id: "game_q4", text: "Would you be interested in designing game mechanics?", domain: "gaming_mechanics" },
  { id: "game_q5", text: "Graphics?", domain: "gaming_art" },
  { id: "game_q6", text: "Level design?", domain: "gaming_level_design" },
  { id: "game_q7", text: "Marketing?", domain: "gaming_marketing" },
  { id: "game_q8", text: "Community management?", domain: "gaming_community" },
  { id: "game_q9", text: "Esports or business?", domain: "gaming_esports" },
];

export const MONEY_QUESTIONS = [
  { id: "money_q1", text: "What's more important to you: very good money, or very interesting work?", domain: "money_vs_interest" },
  { id: "money_q2", text: "How important is owning your own business?", domain: "entrepreneurship" },
  { id: "money_q3", text: "What worries you more: lack of money, or boring work?", domain: "money_vs_interest" },
  { id: "money_q4", text: "Would you prefer high pay with high pressure, or lower pay with more autonomy?", domain: "pressure_vs_autonomy" },
  { id: "money_q5", text: "How important is it that others see your success?", domain: "external_status" },
  { id: "money_q6", text: "Describe a thirty-year-old's life you absolutely would not want to lead.", domain: "anti_goal" },
  { id: "money_q7", text: "What would a genuinely good ordinary Tuesday look like in your life at 30?", domain: "ideal_lifestyle" },
];

export const DECISION_OWNERSHIP_QUESTIONS = [
  { id: "do_q1", text: "If the country you're planning to move to were still available, but no one close to you lived there — would you still want to go?", domain: "decision_ownership" },
  { id: "do_q2", text: "If you could live with someone close to you in any country, which country would you choose?", domain: "decision_ownership" },
  { id: "do_q3", text: "If your current move plan became impossible tomorrow, what would your next plan be?", domain: "plan_flexibility" },
  { id: "do_q4", text: "What attracted you in your earlier life plan?", domain: "plan_motivation" },
  { id: "do_q5", text: "Imagine that in three years your personal relationships change. Would you still be happy with your chosen education?", domain: "decision_ownership" },
  { id: "do_q6", text: "What would have to be true for you to say: this was truly my decision?", domain: "decision_ownership" },
];

// RIASEC inventory — 1 (strongly disagree) to 5 (strongly agree)
export const RIASEC_ITEMS = [
  { id: "R1", code: "R", text: "Build or fix something with your own hands." },
  { id: "R2", code: "R", text: "Do work with a visible physical result." },
  { id: "R3", code: "R", text: "Learn to professionally operate equipment or tools." },
  { id: "R4", code: "R", text: "Spend a significant part of the day moving." },
  { id: "R5", code: "R", text: "Solve practical problems in the real world." },
  { id: "I1", code: "I", text: "Discover why a system or process doesn't work." },
  { id: "I2", code: "I", text: "Compare data and look for patterns." },
  { id: "I3", code: "I", text: "Study in detail how an organism, technology, or market works." },
  { id: "I4", code: "I", text: "Solve problems with no obvious answer." },
  { id: "I5", code: "I", text: "Analyse several explanations and choose the most likely." },
  { id: "A1", code: "A", text: "Design an interior from an empty room." },
  { id: "A2", code: "A", text: "Create your own visual concept for a product or brand." },
  { id: "A3", code: "A", text: "Invent something original instead of following a ready-made instruction." },
  { id: "A4", code: "A", text: "Choose colours, materials, forms and aesthetics." },
  { id: "A5", code: "A", text: "Create content, images, spaces or experiences for others." },
  { id: "S1", code: "S", text: "Help someone reach a personal goal." },
  { id: "S2", code: "S", text: "Teach someone a new skill." },
  { id: "S3", code: "S", text: "Motivate a person who's losing motivation." },
  { id: "S4", code: "S", text: "Solve a problem through talking with people." },
  { id: "S5", code: "S", text: "Do work whose result is the development of others." },
  { id: "E1", code: "E", text: "Persuade a client toward my idea." },
  { id: "E2", code: "E", text: "Negotiate the terms of a contract." },
  { id: "E3", code: "E", text: "Lead a team responsible for results." },
  { id: "E4", code: "E", text: "Launch your own small business." },
  { id: "E5", code: "E", text: "Earn depending on your own results." },
  { id: "C1", code: "C", text: "Keep a project's budget and deadlines." },
  { id: "C2", code: "C", text: "Organise a complicated schedule." },
  { id: "C3", code: "C", text: "Check whether everything has been done correctly." },
  { id: "C4", code: "C", text: "Work according to a clearly defined process." },
  { id: "C5", code: "C", text: "Tidy up information and create more efficient systems." },
];

// Work style — 18 bipolar sliders, 1 (left) to 7 (right)
export const WORK_STYLE_PAIRS = [
  { id: "ws1", left: "Clear instructions", right: "Full freedom", domain: "autonomy" },
  { id: "ws2", left: "Stability", right: "Frequent change", domain: "novelty" },
  { id: "ws3", left: "Working alone", right: "Lots of contact with people", domain: "social" },
  { id: "ws4", left: "Collaboration", right: "Competition", domain: "competition" },
  { id: "ws5", left: "Analysing", right: "Acting", domain: "thinking_vs_doing" },
  { id: "ws6", left: "Theory", right: "Practice", domain: "theory_practice" },
  { id: "ws7", left: "Numbers", right: "Aesthetics", domain: "analytic_aesthetic" },
  { id: "ws8", left: "Long project", right: "Frequent quick results", domain: "time_horizon" },
  { id: "ws9", left: "Fixed salary", right: "Performance-based pay", domain: "risk_pay" },
  { id: "ws10", left: "Executing", right: "Deciding", domain: "agency" },
  { id: "ws11", left: "Specialist", right: "Leader", domain: "leadership" },
  { id: "ws12", left: "Security", right: "Risk", domain: "risk_tolerance" },
  { id: "ws13", left: "Computer/desk", right: "Movement/activity", domain: "physical" },
  { id: "ws14", left: "Working for an organisation", right: "Own business", domain: "entrepreneurship" },
  { id: "ws15", left: "Specialisation", right: "Variety", domain: "breadth" },
  { id: "ws16", left: "Exact plan", right: "Improvisation", domain: "structure" },
  { id: "ws17", left: "Perfection", right: "Speed", domain: "quality_speed" },
  { id: "ws18", left: "Privacy", right: "Status/visibility", domain: "visibility" },
];

export const VALUES_CARDS = [
  "Freedom", "Money", "Security", "Status", "Creativity", "Mastery",
  "Competition", "Helping Others", "Adventure", "Relationships", "Leadership", "Work-Life Balance",
];

export const SIMULATIONS = {
  business: {
    id: "business",
    label: "Business",
    type: "business",
    prompt:
      "You have AUD 2,000 and three months. You must launch a small business in Brisbane for people aged 18–25.\n\nTell me:\n1. what you sell,\n2. who you sell it to,\n3. why someone would buy it,\n4. how you get your first 20 customers,\n5. what you spend the AUD 2,000 on,\n6. how after one month you'd know whether the idea works.",
  },
  interior: {
    id: "interior",
    label: "Interior / Spatial Design",
    type: "interior",
    prompt:
      "You get a 25 m² studio. The client works partly from home, likes warm minimalism, and has a limited budget. You must find space for: sleeping, working, storage, eating, and resting. Describe the concept, layout, materials, and the most important compromises.",
    follow_ups: [
      "What was most interesting?",
      "What was annoying?",
      "Would you want a second similar apartment?",
    ],
  },
  sport: {
    id: "sport",
    label: "Sport / Fitness",
    type: "sport",
    prompt:
      "A 20-year-old comes to you wanting to get in shape, but has already started at the gym three times and quit after a month. Do not prepare a medical diagnosis. Tell me: how you'd start the work together, what you'd ask, how you'd help them keep regularity, and how you'd measure progress.",
  },
  digital: {
    id: "digital",
    label: "Digital / Gaming",
    type: "digital",
    prompt:
      "Choose one task:\nA — design a concept for a new multiplayer game,\nB — prepare a promotion strategy for an existing game aimed at 16–24 year olds.\nPick one and develop the idea.",
  },
  wildcard: {
    id: "wildcard",
    label: "Wildcard",
    type: "wildcard",
    prompt:
      "This is a wildcard simulation in a domain chosen to be outside your stated interests — to detect non-obvious fit.",
    wildcard_domains: [
      "sales", "real estate", "event management", "project management",
      "operations", "marketing", "data/analysis", "hospitality",
      "content creation", "product management",
    ],
  },
};

export const MODULE_ORDER = [
  "session1",
  "sport",
  "gaming",
  "money",
  "decision_ownership",
  "riasec",
  "work_style",
  "values",
  "simulations",
];