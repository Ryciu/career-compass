// Deterministic seed data + scoring for the test persona, used by the
// seedTestPersona backend function. All entity writes run as the INVOKING
// user (createClientFromRequest), so the records are owned by whoever calls
// the function — the builder's account is never touched when a test user
// invokes it.

// ---------------------------------------------------------------------------
// SJT + Career Drivers content (mirrors src/data/structuredAssessments.js,
// duplicated here because frontend modules are not importable server-side).
// ---------------------------------------------------------------------------
export const SJT_SCENARIOS = [
  { id: "sjt1", options: [ { key: "A", signals: { ownership: 2, delegation: -1, control_orientation: 1 } }, { key: "B", signals: { assertiveness: 2, collaboration: 2, conflict_management: 2 } }, { key: "C", signals: { escalation_preference: 2, risk_avoidance: 1, ownership: -1 } }, { key: "D", signals: { individualism: 2, team_responsibility: -2 } }, { key: "E", signals: { leadership: 2, initiative: 2, organisation: 2 } } ] },
  { id: "sjt2", options: [ { key: "A", signals: { persistence: 2, conviction: 1, adaptability: -1 } }, { key: "B", signals: { adaptability: 2, customer_orientation: 2 } }, { key: "C", signals: { decision_speed: 1, persistence: -2 } }, { key: "D", signals: { evidence_orientation: 2, analytical_decision_making: 2, impulsivity: -1 } } ] },
  { id: "sjt3", options: [ { key: "A", signals: { ambiguity_tolerance: -2, risk_avoidance: 2 } }, { key: "B", signals: { initiative: 2, ambiguity_tolerance: 2, independence: 2 } }, { key: "C", signals: { collaboration: 1, resourcefulness: 2 } }, { key: "D", signals: { analytical_thinking: 2, planning: 2, decision_speed: -1 } } ] },
  { id: "sjt4", options: [ { key: "A", signals: { conflict_avoidance: 2, assertiveness: -2 } }, { key: "B", signals: { assertiveness: 2, persuasion: 2, leadership: 1 } }, { key: "C", signals: { evidence_orientation: 2, collaboration: 2, conflict_management: 2 } }, { key: "D", signals: { independence: 2, collaboration: -1 } } ] },
  { id: "sjt5", options: [ { key: "A", signals: { quick_win_orientation: 2 } }, { key: "B", signals: { prioritisation: 3, ownership: 1 } }, { key: "C", signals: { hierarchy_preference: 2, risk_avoidance: 1 } }, { key: "D", signals: { multitasking_preference: 2, prioritisation: -1 } } ] },
  { id: "sjt6", options: [ { key: "A", signals: { assertiveness: 2, defensiveness: 1, customer_orientation: -1 } }, { key: "B", signals: { emotional_regulation: 2, evidence_orientation: 2, customer_orientation: 2 } }, { key: "C", signals: { customer_orientation: 2, boundaries: -1 } }, { key: "D", signals: { conflict_avoidance: 2, ownership: -1 } } ] },
  { id: "sjt7", options: [ { key: "A", signals: { risk_tolerance: 2, initiative: 2, planning: -1 } }, { key: "B", signals: { initiative: 2, learning_orientation: 2, risk_management: 2 } }, { key: "C", signals: { risk_avoidance: 2, confidence: -1 } }, { key: "D", signals: { learning_orientation: 2, risk_tolerance: -1 } } ] },
  { id: "sjt8", options: [ { key: "A", signals: { stability: 2, routine_tolerance: 2 } }, { key: "B", signals: { optimisation: 2, initiative: 2 } }, { key: "C", signals: { growth_orientation: 2, variety_preference: 2 } }, { key: "D", signals: { change_orientation: 2, routine_tolerance: -2 } } ] },
  { id: "sjt9", options: [ { key: "A", signals: { relationship_loyalty: 2, performance_orientation: -1 } }, { key: "B", signals: { coaching_orientation: 2, assertiveness: 2, relationship_management: 2 } }, { key: "C", signals: { conflict_avoidance: 2, delegation: 1 } }, { key: "D", signals: { performance_orientation: 2, fairness_orientation: 2 } } ] },
  { id: "sjt10", options: [ { key: "A", signals: { wealth_motivation: 2, risk_tolerance: 1 } }, { key: "B", signals: { mastery: 2, growth_orientation: 2 } }, { key: "C", signals: { evidence_orientation: 2, risk_management: 2 } }, { key: "D", signals: { security_motivation: 3 } }, { key: "E", signals: { autonomy: 3 } } ] },
  { id: "sjt11", options: [ { key: "A", signals: { assertiveness: 2, competition: 1 } }, { key: "B", signals: { curiosity: 2, conflict_management: 2, evidence_orientation: 1 } }, { key: "C", signals: { conflict_avoidance: 1, relationship_management: 1 } }, { key: "D", signals: { group_orientation: 2, individual_ownership: -1 } } ] },
  { id: "sjt12", options: [ { key: "A", signals: { persistence: 2 } }, { key: "B", signals: { adaptability: 2, experimentation: 2 } }, { key: "C", signals: { learning_orientation: 2, coachability: 2 } }, { key: "D", signals: { progress_motivation: 3, persistence: -1 } } ] },
];

export const DRIVER_DIMENSIONS = ["AUTONOMY", "WEALTH", "SECURITY", "STATUS", "MASTERY", "COMPETITION", "CREATION", "IMPACT", "BELONGING", "ADVENTURE"];

export const DRIVER_ITEMS = [
  { id: "d1", a: { driver: "MASTERY" }, b: { driver: "STATUS" } },
  { id: "d2", a: { driver: "AUTONOMY" }, b: { driver: "WEALTH" } },
  { id: "d3", a: { driver: "CREATION" }, b: { driver: "BELONGING" } },
  { id: "d4", a: { driver: "COMPETITION" }, b: { driver: "IMPACT" } },
  { id: "d5", a: { driver: "SECURITY" }, b: { driver: "AUTONOMY" } },
  { id: "d6", a: { driver: "STATUS" }, b: { driver: "AUTONOMY" } },
  { id: "d7", a: { driver: "MASTERY" }, b: { driver: "CREATION" } },
  { id: "d8", a: { driver: "WEALTH" }, b: { driver: "IMPACT" } },
  { id: "d9", a: { driver: "BELONGING" }, b: { driver: "AUTONOMY" } },
  { id: "d10", a: { driver: "SECURITY" }, b: { driver: "ADVENTURE" } },
  { id: "d11", a: { driver: "COMPETITION" }, b: { driver: "MASTERY" } },
  { id: "d12", a: { driver: "STATUS" }, b: { driver: "WEALTH" } },
  { id: "d13", a: { driver: "CREATION" }, b: { driver: "BELONGING" } },
  { id: "d14", a: { driver: "SECURITY" }, b: { driver: "ADVENTURE" } },
  { id: "d15", a: { driver: "IMPACT" }, b: { driver: "MASTERY" } },
  { id: "d16", a: { driver: "AUTONOMY" }, b: { driver: "STATUS" } },
  { id: "d17", a: { driver: "WEALTH" }, b: { driver: "MASTERY" } },
  { id: "d18", a: { driver: "CREATION" }, b: { driver: "SECURITY" } },
  { id: "d19", a: { driver: "COMPETITION" }, b: { driver: "BELONGING" } },
  { id: "d20", a: { driver: "SECURITY" }, b: { driver: "ADVENTURE" } },
];

function scoreSjt(answers) {
  const raw = {}; const touched = {}; const maxPoss = {}; const minPoss = {};
  for (const sc of SJT_SCENARIOS) {
    const dimSet = new Set();
    for (const opt of sc.options) for (const d of Object.keys(opt.signals)) dimSet.add(d);
    for (const d of dimSet) {
      let mx = -Infinity, mn = Infinity;
      for (const opt of sc.options) { const v = opt.signals[d]; if (v != null) { if (v > mx) mx = v; if (v < mn) mn = v; } }
      maxPoss[d] = (maxPoss[d] || 0) + (mx === -Infinity ? 0 : mx);
      minPoss[d] = (minPoss[d] || 0) + (mn === Infinity ? 0 : mn);
    }
    const chosen = answers[sc.id]; if (!chosen) continue;
    const opt = sc.options.find((o) => o.key === chosen); if (!opt) continue;
    for (const [d, delta] of Object.entries(opt.signals)) { raw[d] = (raw[d] || 0) + delta; touched[d] = (touched[d] || 0) + 1; }
  }
  const dimension_scores = {};
  for (const d of new Set([...Object.keys(maxPoss), ...Object.keys(raw)])) {
    if ((touched[d] || 0) < 2) { dimension_scores[d] = null; continue; }
    const lo = minPoss[d] || 0, hi = maxPoss[d] || 0;
    let pct = hi > lo ? (((raw[d] || 0) - lo) / (hi - lo)) * 100 : 50;
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    dimension_scores[d] = pct;
  }
  return { dimension_scores, raw, touched };
}

function driverCategory(score) {
  if (score >= 75) return "Strong current driver";
  if (score >= 60) return "Meaningful driver";
  if (score >= 40) return "Moderate / context-dependent";
  if (score >= 25) return "Lower current priority";
  return "Low relative priority";
}

function scoreDrivers(choices) {
  const raw = {}; const presented = {};
  for (const it of DRIVER_ITEMS) { presented[it.a.driver] = (presented[it.a.driver] || 0) + 1; presented[it.b.driver] = (presented[it.b.driver] || 0) + 1; }
  for (const it of DRIVER_ITEMS) {
    const ch = choices[it.id]; if (!ch) continue;
    const d = ch === "A" ? it.a.driver : it.b.driver;
    raw[d] = (raw[d] || 0) + 1;
  }
  const normalized = {};
  for (const d of DRIVER_DIMENSIONS) { const p = presented[d] || 0; normalized[d] = p > 0 ? Math.round(((raw[d] || 0) / p) * 100) : 0; }
  const ranked = DRIVER_DIMENSIONS.map((d) => ({ driver: d, score: normalized[d], raw: raw[d] || 0, presented: presented[d] || 0, category: driverCategory(normalized[d]) })).sort((a, b) => b.score - a.score);
  return { raw, presented, normalized, ranked };
}

function scoreRiasec(answers) {
  const codes = ["R", "I", "A", "S", "E", "C"];
  const sums = { R: [], I: [], A: [], S: [], E: [], C: [] };
  const items = [
    ["R1","R"],["R2","R"],["R3","R"],["R4","R"],["R5","R"],
    ["I1","I"],["I2","I"],["I3","I"],["I4","I"],["I5","I"],
    ["A1","A"],["A2","A"],["A3","A"],["A4","A"],["A5","A"],
    ["S1","S"],["S2","S"],["S3","S"],["S4","S"],["S5","S"],
    ["E1","E"],["E2","E"],["E3","E"],["E4","E"],["E5","E"],
    ["C1","C"],["C2","C"],["C3","C"],["C4","C"],["C5","C"],
  ];
  for (const [id, code] of items) { const v = answers[id]; if (v != null && !isNaN(Number(v))) sums[code].push(Number(v)); }
  const scores = {};
  for (const code of codes) { const arr = sums[code]; scores[code] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 20 * 10) / 10 : 0; }
  return scores;
}

// ---------------------------------------------------------------------------
// Persona content
// ---------------------------------------------------------------------------
const PERSONA = {
  profile: { first_name: "Rio", age: 18, education_stage: "high_school", current_country: "Poland", target_country: "Australia", preferred_language: "en", onboarding_complete: true },
  responses: {
    session1: [
      { question_id: "s1_q1", question_text: "If you didn't have to choose studies or work for the next year, and had enough money for a normal life, what would you do Monday to Friday?", first_response: "Mornings I'd produce a short documentary podcast — interviewing people in my city who changed careers, then editing and publishing it. Afternoons I'd tutor younger students in maths and writing.", reflection_response: "Honestly the common thread is: figure out someone's story, then help someone else understand it." },
      { question_id: "s1_q2", question_text: "Name three moments from the last few years when you were genuinely proud of yourself. What exactly did you do?", first_response: "1) Organising a school fundraiser that hit 140% of goal by rethinking the pitch. 2) Helping a classmate pass an exam they'd failed twice, by building a study plan with them. 3) Teaching myself video editing and finishing a 20-minute documentary about my grandmother." },
      { question_id: "s1_q3", question_text: "What comes easier to you than to most people your age?", first_response: "Taking a confusing idea and explaining it so it actually clicks for someone." },
      { question_id: "s1_q5", question_text: "What have you learned on your own, even though nobody forced you to?", first_response: "Video editing, basic statistics, and a lot about nutrition and training." },
      { question_id: "s1_q6", question_text: "What required the most consistency from you over the last two years?", first_response: "Going to the gym 4x a week for two years straight.", reflection_response: "I kept it going by pairing it with a podcast I only let myself listen to at the gym." },
      { question_id: "s1_q8", question_text: "What do you often start with enthusiasm but later abandon?", first_response: "New software tools — Blender, then After Effects, then a bit of Python. I get to the basics, feel I 'can do it', then stop before I'm genuinely good." },
      { question_id: "s1_q9", question_text: "When did you last lose track of time while doing something?", first_response: "Editing a video and rewriting the script until 3am — I forgot to eat." },
      { question_id: "s1_q12", question_text: "What kind of problems do you enjoy solving?", first_response: "Problems where I get to figure out why something isn't working, then redesign it — especially anything involving people plus a system." },
      { question_id: "s1_q15", question_text: "What would you like to be genuinely good at in five years?", first_response: "Designing learning experiences — things that help people understand hard ideas." },
    ],
    sport: [
      { question_id: "sport_q1", question_text: "What did you like most about sport: the game, the competition, the team, training, improving skills, winning, or something else?", first_response: "Improving skills and the feeling of getting stronger. Competition was fine but not the main thing." },
      { question_id: "sport_q3", question_text: "If you could train very seriously six days a week for three years, how would you react?", first_response: "Exhausting, but if I had a goal and a plan I'd commit — I've kept 4x/week for two years." },
      { question_id: "sport_q5", question_text: "Are you interested in why a specific training method works?", first_response: "Yes — I read about progressive overload, recovery, why periodisation works." },
      { question_id: "sport_q7", question_text: "Could you guide for half a year a person far less disciplined than you?", first_response: "Yes. I'd build small wins and accountability, and make the first weeks stupidly easy." },
      { question_id: "sport_q8", question_text: "What would interest you more: running training sessions, running a club/gym, or the business around sport?", first_response: "Helping people train over the business side — though building the coaching system around it interests me more than the sport itself." },
    ],
    gaming: [
      { question_id: "game_q1", question_text: "Which games do you most enjoy playing?", first_response: "Story-driven single-player games and some strategy." },
      { question_id: "game_q3", question_text: "Have you ever wondered how a game was designed?", first_response: "Yes — especially pacing and reward loops, why one game feels addictive and another doesn't." },
      { question_id: "game_q4", question_text: "Would you be interested in designing game mechanics?", first_response: "Yes, more than graphics or level design." },
      { question_id: "game_q9", question_text: "Esports or business?", first_response: "Not esports. The design and business of games, maybe — but it's not a strong pull." },
    ],
    money: [
      { question_id: "money_q1", question_text: "What's more important to you: very good money, or very interesting work?", first_response: "Interesting work, but I don't want to struggle — money matters, just not first." },
      { question_id: "money_q4", question_text: "Would you prefer high pay with high pressure, or lower pay with more autonomy?", first_response: "Lower pay with more autonomy, probably." },
      { question_id: "money_q6", question_text: "Describe a thirty-year-old's life you absolutely would not want to lead.", first_response: "A 30-year-old stuck in a rigid corporate routine — Meetings and commutes, no learning, no freedom, weekends only." },
      { question_id: "money_q7", question_text: "What would a genuinely good ordinary Tuesday look like in your life at 30?", first_response: "Morning deep work on a project I care about, afternoon helping someone learn something, evening with people I love." },
    ],
    decision_ownership: [
      { question_id: "do_q3", question_text: "If your current move plan became impossible tomorrow, what would your next plan be?", first_response: "I'd look for a comparable opportunity in my own country — probably combining online study with a part-time role at an education startup." },
      { question_id: "do_q5", question_text: "Imagine that in three years your personal relationships change. Would you still be happy with your chosen education?", first_response: "If it was genuinely mine, yes. If I'd chosen it mostly to stay near someone, I'd reconsider." },
      { question_id: "do_q6", question_text: "What would have to be true for you to say: this was truly my decision?", first_response: "That I'd tested it, not just imagined it — a real project or internship in that field, and still wanting it after." },
    ],
  },
  riasec_answers: { R1:2,R2:2,R3:2,R4:3,R5:2, I1:5,I2:5,I3:5,I4:5,I5:5, A1:4,A2:5,A3:5,A4:4,A5:5, S1:5,S2:5,S3:5,S4:5,S5:5, E1:3,E2:2,E3:3,E4:4,E5:3, C1:2,C2:2,C3:3,C4:2,C5:2 },
  work_style_values: { ws1:6,ws2:4,ws3:6,ws4:3,ws5:4,ws6:5,ws7:5,ws8:4,ws9:5,ws10:6,ws11:5,ws12:5,ws13:4,ws14:5,ws15:6,ws16:5,ws17:4,ws18:3 },
  values: {
    top6: ["Freedom","Mastery","Helping Others","Creativity","Relationships","Work-Life Balance"],
    top3: ["Freedom","Mastery","Helping Others"],
    reflections: {
      Freedom: "If I can choose how and what I work on, I actually produce more and enjoy it. Constraint kills my motivation fast.",
      Mastery: "Being genuinely good at something hard is its own reward — I notice I respect people who've earned depth.",
      "Helping Others": "The moments I'm most proud of involved someone else getting better because of me.",
    },
  },
  sjt_answers: { sjt1:"B", sjt2:"D", sjt3:"B", sjt4:"C", sjt5:"B", sjt6:"B", sjt7:"B", sjt8:"C", sjt9:"B", sjt10:"B", sjt11:"B", sjt12:"B" },
  driver_choices: { d1:"A", d2:"A", d3:"B", d4:"B", d5:"B", d6:"B", d7:"A", d8:"B", d9:"B", d10:"B", d11:"B", d12:"A", d13:"A", d14:"B", d15:"B", d16:"A", d17:"B", d18:"A", d19:"B", d20:"B" },
  simulations: [
    { simulation_type: "business", response_text: "I'd sell a 4-week study-skills sprint for year-12 students, AUD 49. Buyer = parents. They'd buy because results are concrete and cheap vs tutoring. First 20 customers: 3 free pilots with parents I know, then referral + a short video testimonial on Instagram. Spend the AUD 2,000 on: a simple landing page + booking tool, paid targeted ads to local parents, printed flyers near schools. After one month I'd know it works if at least 8 of the first 20 refer someone or book a second sprint.", enjoyment: 8, repeat_willingness: 8, evaluation: { overall_simulation_performance: 74, reasoning: "Concrete customer-acquisition logic and a measurable success metric." } },
    { simulation_type: "interior", response_text: "Concept: warm minimalist, multi-use. Loft bed for sleeping + storage underneath; a fold-down desk by the window for work; a small round table that doubles as dining and resting spot; warm oak, matte white, a linen mustard cushion. Biggest compromise: no separate bedroom — sleep and work share one zone, so I'd use a curtain and lighting to separate them psychologically.", enjoyment: 6, repeat_willingness: 5, evaluation: { overall_simulation_performance: 60, reasoning: "Workable concept but generic; compromise reasoning is reasonable." } },
    { simulation_type: "sport", response_text: "First I'd ask why they keep quitting and what their three failed attempts looked like — schedule, expectations, boredom? I'd start with two easy sessions a week, fixed time, and a check-in. I'd help regularity by anchoring it to something they already do and tracking attendance visually. Progress: consistency first for 4 weeks, then add a simple strength baseline; I'd never lead with weight or aesthetics.", enjoyment: 7, repeat_willingness: 7, evaluation: { overall_simulation_performance: 70, reasoning: "Good behavioural diagnosis and progression logic." } },
    { simulation_type: "digital", response_text: "I'd pick B — promotion strategy for an existing game aimed at 16–24s. Idea: partner with 10 mid-size creators who already play the game, give them an in-game code that pays their community, run a 2-week leaderboard. First posts: a creator's 'can we hit X' challenge clip, then a behind-the-scenes on the leaderboard. Metric: cost per new active install under a target.", enjoyment: 8, repeat_willingness: 9, evaluation: { overall_simulation_performance: 80, reasoning: "Clear funnel, channel fit, and a measurable metric." } },
  ],
};

const ALL_MODULE_KEYS = ["session1","sport","gaming","money","decision_ownership","riasec","work_style","values","simulations","sjt","career_drivers"];

async function ensureSession(base44, moduleKey, complete = true) {
  let session = (await base44.entities.AssessmentSession.filter({ module: moduleKey }))[0];
  if (!session) {
    session = await base44.entities.AssessmentSession.create({ module: moduleKey, status: complete ? "complete" : "in_progress", started_at: new Date().toISOString(), ...(complete ? { completed_at: new Date().toISOString() } : {}) });
  } else if (complete && session.status !== "complete") {
    await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
  }
  return session;
}

async function ensureScore(base44, moduleKey, payload) {
  let existing = (await base44.entities.AssessmentScore.filter({ module: moduleKey }))[0];
  if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
  else await base44.entities.AssessmentScore.create({ module: moduleKey, ...payload });
}

// Persist the full persona as the INVOKING user. Idempotent: re-running updates
// in place rather than duplicating records (driven by the per-entity filter).
export async function seedPersona(base44): Promise<any> {
  const log: string[] = [];

  // Profile
  let profile = (await base44.entities.Profile.filter({}))[0];
  if (profile) await base44.entities.Profile.update(profile.id, PERSONA.profile);
  else profile = await base44.entities.Profile.create(PERSONA.profile);
  log.push("profile ok");

  // Open modules: sessions + responses
  for (const [moduleKey, rows] of Object.entries(PERSONA.responses)) {
    const session = await ensureSession(base44, moduleKey, true);
    const existing = await base44.entities.Response.filter({ session_id: session.id });
    const byId = new Map(existing.map((r) => [r.question_id, r]));
    for (const r of rows) {
      const payload = { session_id: session.id, question_id: r.question_id, question_text: r.question_text, module: moduleKey, input_mode: "text", first_response: r.first_response, reflection_response: r.reflection_response || "", audio_file_url: "" };
      const cur = byId.get(r.question_id);
      if (cur) await base44.entities.Response.update(cur.id, payload);
      else await base44.entities.Response.create(payload);
    }
    log.push(`${moduleKey}: ${rows.length} responses`);
  }

  // RIASEC
  const riasecScores = scoreRiasec(PERSONA.riasec_answers);
  const riasecSession = await ensureSession(base44, "riasec", true);
  await ensureScore(base44, "riasec", { scores: riasecScores, raw_data: PERSONA.riasec_answers, session_id: riasecSession.id });
  log.push("riasec ok");

  // Work style
  const wsSession = await ensureSession(base44, "work_style", true);
  await ensureScore(base44, "work_style", { scores: { midpoint: 4 }, raw_data: PERSONA.work_style_values, session_id: wsSession.id });
  log.push("work_style ok");

  // Values
  const valSession = await ensureSession(base44, "values", true);
  await ensureScore(base44, "values", { scores: { top_values: PERSONA.values.top3 }, raw_data: { top6: PERSONA.values.top6, top3: PERSONA.values.top3, reflections: PERSONA.values.reflections }, session_id: valSession.id });
  log.push("values ok");

  // Simulations
  const simSession = await ensureSession(base44, "simulations", true);
  for (const s of PERSONA.simulations) {
    let existing = (await base44.entities.SimulationResult.filter({ simulation_type: s.simulation_type }))[0];
    const payload = { simulation_type: s.simulation_type, wildcard_domain: "", response_text: s.response_text, enjoyment: s.enjoyment, repeat_willingness: s.repeat_willingness, follow_up_responses: {}, evaluation: s.evaluation || {} };
    if (existing) await base44.entities.SimulationResult.update(existing.id, payload);
    else await base44.entities.SimulationResult.create(payload);
  }
  log.push("simulations ok");

  // SJT
  const { dimension_scores, raw, touched } = scoreSjt(PERSONA.sjt_answers);
  const sjtSession = await ensureSession(base44, "sjt", true);
  await ensureScore(base44, "sjt", { scores: dimension_scores, raw_data: { answers: PERSONA.sjt_answers, raw, touched }, session_id: sjtSession.id });
  log.push("sjt ok");

  // Career drivers
  const { raw: dRaw, presented, normalized, ranked } = scoreDrivers(PERSONA.driver_choices);
  const drvSession = await ensureSession(base44, "career_drivers", true);
  await ensureScore(base44, "career_drivers", { scores: { normalized, ranked }, raw_data: { choices: PERSONA.driver_choices, selections: DRIVER_ITEMS.map((it) => ({ item_id: it.id, choice: PERSONA.driver_choices[it.id] })), raw: dRaw, presented }, session_id: drvSession.id });
  log.push("career_drivers ok");

  // Guarantee every module has a complete session (gating for Analysis)
  for (const mk of ALL_MODULE_KEYS) await ensureSession(base44, mk, true);

  return { ok: true, riasecScores, sjtDimensions: dimension_scores, driversRanked: ranked.slice(0, 5), values: PERSONA.values.top3, log };
}