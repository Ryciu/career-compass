// Deterministic scoring — never delegated to the LLM.
import { RIASEC_ITEMS, WORK_STYLE_PAIRS } from "./assessmentConfig.ts";

// RIASEC: average(item values) * 20  → 0..100 scale per dimension
export function scoreRiasec(answers) {
  // answers: { [itemId]: 1..5 }
  const sums = { R: [], I: [], A: [], S: [], E: [], C: [] };
  for (const item of RIASEC_ITEMS) {
    const v = answers[item.id];
    if (v != null && !isNaN(Number(v))) sums[item.code].push(Number(v));
  }
  const scores = {};
  for (const code of ["R", "I", "A", "S", "E", "C"]) {
    const arr = sums[code];
    scores[code] = arr.length
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 20 * 10) / 10
      : 0;
  }
  return scores;
}

// Work style: store raw 1..7 values + derive a neutral-coded interpretation map
export function scoreWorkStyle(answers) {
  // answers: { [pairId]: 1..7 }
  const raw = {};
  for (const pair of WORK_STYLE_PAIRS) {
    raw[pair.id] = answers[pair.id] != null ? Number(answers[pair.id]) : 4;
  }
  return raw;
}

// Overall career fit from validated numeric components (0..100 each)
// Weighting per spec section 25
export const FIT_WEIGHTS = {
  interest: 0.25,
  evidence_strength: 0.20,
  work_style: 0.15,
  values: 0.15,
  simulation_performance: 0.10,
  simulation_enjoyment: 0.10,
  lifestyle: 0.05,
};

export function calcOverallFit(parts) {
  // parts: { interest_fit, strength_fit, work_style_fit, values_fit, simulation_fit, simulation_enjoyment, lifestyle_fit }
  const w = FIT_WEIGHTS;
  const score =
    (parts.interest_fit ?? 0) * w.interest +
    (parts.strength_fit ?? 0) * w.evidence_strength +
    (parts.work_style_fit ?? 0) * w.work_style +
    (parts.values_fit ?? 0) * w.values +
    (parts.simulation_fit ?? 0) * w.simulation_performance +
    (parts.simulation_enjoyment ?? 0) * w.simulation_enjoyment +
    (parts.lifestyle_fit ?? 0) * w.lifestyle;
  return Math.round(score * 10) / 10;
}

export function fitCategory(fitScore) {
  if (fitScore >= 75) return "Strong Fit";
  if (fitScore >= 60) return "Promising";
  if (fitScore >= 40) return "Explore Further";
  return "Weak Current Fit";
}

// Confidence: 0..100 from evidence amount + quality + consistency + sim exposure - unresolved contradictions
export function calcConfidence({ evidenceCount, strongCount, contradictionCount, simCount, consistency }) {
  let c = 30;
  c += Math.min(evidenceCount, 20) * 2;
  c += Math.min(strongCount, 6) * 3;
  c -= Math.min(contradictionCount, 6) * 4;
  c += Math.min(simCount, 5) * 2;
  if (consistency) c += consistency * 5;
  c = Math.max(10, Math.min(95, c));
  return Math.round(c);
}