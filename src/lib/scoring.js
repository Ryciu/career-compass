import { RIASEC_ITEMS } from "@/data/assessment";

// Deterministic RIASEC scoring: average(item values) * 20  → 0..100
export function scoreRiasec(answers) {
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

export const FIT_WEIGHTS = {
  interest: 0.25, evidence_strength: 0.20, work_style: 0.15, values: 0.15,
  simulation_performance: 0.10, simulation_enjoyment: 0.10, lifestyle: 0.05,
};

export function calcOverallFit(parts) {
  const w = FIT_WEIGHTS;
  const score =
    (parts.interest_fit ?? 0) * w.interest + (parts.strength_fit ?? 0) * w.evidence_strength +
    (parts.work_style_fit ?? 0) * w.work_style + (parts.values_fit ?? 0) * w.values +
    (parts.simulation_fit ?? 0) * w.simulation_performance + (parts.simulation_enjoyment ?? 0) * w.simulation_enjoyment +
    (parts.lifestyle_fit ?? 0) * w.lifestyle;
  return Math.round(score * 10) / 10;
}

export function fitCategory(fitScore) {
  if (fitScore >= 75) return "Strong Fit";
  if (fitScore >= 60) return "Promising";
  if (fitScore >= 40) return "Explore Further";
  return "Weak Current Fit";
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}