// Cross-validation layer: compare structured tests with each other and with
// open-ended evidence. Deterministic. Produces flags, not verdicts.
// flag.type: "contradiction" | "uncertainty" | "alignment"
//
// Input:
//   scoreMap: { [module]: { scores, raw_data } }
//   sjt: scoreMap["sjt"]
//   drivers: scoreMap["career_drivers"]
//   evidence: [{ domain, claim, supports_or_contradicts }]
//   simulations: [{ evaluation, enjoyment, repeat_willingness }]
export function crossValidate({ scoreMap, sjt, drivers, evidence, simulations }) {
  const flags = [];
  const workStyle = scoreMap?.["work_style"]?.raw_data || {}; // slider values 1..7
  const valuesScores = scoreMap?.["values"]?.scores || {}; // { top_values: [...] }
  const topValues = valuesScores.top_values || [];

  const sjtDims = sjt?.scores || {};
  const driversNorm = drivers?.scores?.normalized || {};

  const sjtVal = (d) => (sjtDims[d] == null ? null : sjtDims[d]);

  // 1. High AUTONOMY driver vs preference for clear instructions (work_style ws1).
  if ((driversNorm.AUTONOMY ?? 0) >= 70 && (workStyle.ws1 ?? 4) <= 3) {
    flags.push({
      type: "contradiction",
      dimension_a: "career_drivers.autonomy",
      dimension_b: "work_style.clear_instructions",
      description: "Career Drivers show a strong drive for autonomy, but Work Style leans toward clear instructions and structure.",
      follow_up_question: "You value autonomy highly, yet you also prefer clear instructions. How do you imagine these two fitting together in a real job?",
    });
  }

  // 2. COMPETITION high in drivers but low competition in work_style.
  if ((driversNorm.COMPETITION ?? 0) >= 65 && (workStyle.ws4 ?? 4) <= 3) {
    flags.push({
      type: "uncertainty",
      dimension_a: "career_drivers.competition",
      dimension_b: "work_style.collaboration",
      description: "Competition wins in forced choice, but Work Style favours collaboration over competition.",
      follow_up_question: "You chose competition as a driver, but you prefer collaborative environments. Is it the energy of competition, or the status of winning, that appeals to you?",
    });
  }

  // 3. SJT ownership low but autonomy driver high.
  if ((sjtVal("ownership") ?? null) !== null && sjtVal("ownership") <= 40 && (driversNorm.AUTONOMY ?? 0) >= 65) {
    flags.push({
      type: "uncertainty",
      dimension_a: "sjt.ownership",
      dimension_b: "career_drivers.autonomy",
      description: "You want autonomy, but your situational choices suggest a lower tendency to take ownership of difficult situations.",
      follow_up_question: "You value autonomy, but in scenarios you sometimes defer ownership. What conditions make you take full ownership?",
    });
  }

  // 4. Security signals across sources — alignment raises confidence.
  const sjtSecurity = sjtVal("security_motivation");
  if ((driversNorm.SECURITY ?? 0) >= 60 && (workStyle.ws12 ?? 4) <= 3 && sjtSecurity != null && sjtSecurity >= 60) {
    flags.push({
      type: "alignment",
      dimension_a: "career_drivers.security",
      dimension_b: "work_style.security",
      description: "Security orientation appears consistently across Career Drivers, Work Style and the Situational Judgement Test.",
    });
  }

  // 5. Money follow-up: says money is not a top value, but WEALTH wins forced trade-offs.
  if ((driversNorm.WEALTH ?? 0) >= 60 && !topValues.includes("Money")) {
    flags.push({
      type: "uncertainty",
      dimension_a: "career_drivers.wealth",
      dimension_b: "values.money",
      description: "Money is not among your stated top values, yet the financial option often won when directly compared with other outcomes.",
      follow_up_question: "You've said that money is not one of your main priorities, but when it was directly compared with several other outcomes you often chose the financial option. What do you think explains that difference?",
    });
  }

  // 6. SJT initiative high but evidence contains avoidance/deferral signals.
  const sjtInit = sjtVal("initiative");
  if (sjtInit != null && sjtInit >= 70 && Array.isArray(evidence)) {
    const avoid = evidence.some((e) => /avoid|defer|procrastinat|quit|abandon/i.test(e.claim || "") && e.supports_or_contradicts !== "supports");
    if (avoid) {
      flags.push({
        type: "uncertainty",
        dimension_a: "sjt.initiative",
        dimension_b: "open_evidence",
        description: "The Situational Judgement Test indicates high initiative, but some coaching evidence mentions avoidance or giving up.",
        follow_up_question: "In the scenarios you take initiative strongly, but you've also described abandoning some projects. What usually triggers the difference?",
      });
    }
  }

  // 7. Simulation performance vs enjoyment mismatch.
  if (Array.isArray(simulations)) {
    for (const s of simulations) {
      const perf = s.evaluation?.overall_simulation_performance;
      if (perf != null && s.enjoyment != null && perf >= 70 && s.enjoyment <= 4) {
        flags.push({
          type: "uncertainty",
          dimension_a: `simulation.${s.simulation_type}.performance`,
          dimension_b: `simulation.${s.simulation_type}.enjoyment`,
          description: `In the ${s.simulation_type} simulation you performed well but reported low enjoyment — high ability without interest is a caution signal for fit.`,
        });
      }
    }
  }

  return flags;
}