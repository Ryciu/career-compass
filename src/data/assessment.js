// Frontend assessment data (mirrors base44/shared/assessmentConfig.ts data only).
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

export const WORK_STYLE_PAIRS = [
  { id: "ws1", left: "Clear instructions", right: "Full freedom" },
  { id: "ws2", left: "Stability", right: "Frequent change" },
  { id: "ws3", left: "Working alone", right: "Lots of contact with people" },
  { id: "ws4", left: "Collaboration", right: "Competition" },
  { id: "ws5", left: "Analysing", right: "Acting" },
  { id: "ws6", left: "Theory", right: "Practice" },
  { id: "ws7", left: "Numbers", right: "Aesthetics" },
  { id: "ws8", left: "Long project", right: "Frequent quick results" },
  { id: "ws9", left: "Fixed salary", right: "Performance-based pay" },
  { id: "ws10", left: "Executing", right: "Deciding" },
  { id: "ws11", left: "Specialist", right: "Leader" },
  { id: "ws12", left: "Security", right: "Risk" },
  { id: "ws13", left: "Computer/desk", right: "Movement/activity" },
  { id: "ws14", left: "Working for an organisation", right: "Own business" },
  { id: "ws15", left: "Specialisation", right: "Variety" },
  { id: "ws16", left: "Exact plan", right: "Improvisation" },
  { id: "ws17", left: "Perfection", right: "Speed" },
  { id: "ws18", left: "Privacy", right: "Status/visibility" },
];

export const VALUES_CARDS = [
  "Freedom", "Money", "Security", "Status", "Creativity", "Mastery",
  "Competition", "Helping Others", "Adventure", "Relationships", "Leadership", "Work-Life Balance",
];

export const SIMULATIONS = {
  business: {
    id: "business", label: "Business", type: "business",
    prompt: "You have AUD 2,000 and three months. You must launch a small business in Brisbane for people aged 18–25.\n\nTell me:\n1. what you sell,\n2. who you sell it to,\n3. why someone would buy it,\n4. how you get your first 20 customers,\n5. what you spend the AUD 2,000 on,\n6. how after one month you'd know whether the idea works.",
  },
  interior: {
    id: "interior", label: "Interior / Spatial Design", type: "interior",
    prompt: "You get a 25 m² studio. The client works partly from home, likes warm minimalism, and has a limited budget. You must find space for: sleeping, working, storage, eating, and resting. Describe the concept, layout, materials, and the most important compromises.",
    follow_ups: ["What was most interesting?", "What was annoying?", "Would you want a second similar apartment?"],
  },
  sport: {
    id: "sport", label: "Sport / Fitness", type: "sport",
    prompt: "A 20-year-old comes to you wanting to get in shape, but has already started at the gym three times and quit after a month. Do not prepare a medical diagnosis. Tell me: how you'd start the work together, what you'd ask, how you'd help them keep regularity, and how you'd measure progress.",
  },
  digital: {
    id: "digital", label: "Digital / Gaming", type: "digital",
    prompt: "Choose one task:\nA — design a concept for a new multiplayer game,\nB — prepare a promotion strategy for an existing game aimed at 16–24 year olds.\nPick one and develop the idea.",
  },
  wildcard: {
    id: "wildcard", label: "Wildcard", type: "wildcard",
    prompt: "This is a wildcard simulation in a domain chosen to be outside your stated interests — to detect non-obvious fit.",
    wildcard_domains: ["sales", "real estate", "event management", "project management", "operations", "marketing", "data/analysis", "hospitality", "content creation", "product management"],
  },
};

export const RIASEC_LABELS = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };