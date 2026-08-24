// Deterministic scoring for Behavioral Energy Profile. No LLM.
import { ENERGY_AXES, ENERGY_ITEMS } from "@/data/energyProfile";

export function energyLabel(axis, score) {
  if (score == null) return "Not enough data";
  if (score >= 55) return axis.high;
  if (score <= 45) return axis.low;
  return "Balanced";
}

export function energyCategory(score) {
  if (score == null) return "Not enough data";
  if (score >= 70) return "Strong tilt";
  if (score >= 55) return "Tilt";
  if (score >= 45) return "Balanced";
  if (score >= 30) return "Tilt (low pole)";
  return "Strong tilt (low pole)";
}

export function scoreEnergy(answers) {
  const natural = {};
  const adapted = {};
  for (const axis of ENERGY_AXES) {
    for (const mode of ["natural", "adapted"]) {
      let hi = 0, lo = 0;
      for (const it of ENERGY_ITEMS) {
        if (it.mode !== mode || it.axis !== axis.id) continue;
        const ch = answers[it.id];
        if (ch === "A") { if (it.a.pole === "high") hi++; else lo++; }
        else if (ch === "B") { if (it.b.pole === "high") hi++; else lo++; }
      }
      const total = hi + lo;
      const target = mode === "natural" ? natural : adapted;
      target[axis.id] = total >= 2 ? Math.round((hi / total) * 100) : null;
    }
  }
  const shifts = {};
  for (const axis of ENERGY_AXES) {
    const n = natural[axis.id];
    const a = adapted[axis.id];
    shifts[axis.id] = (n != null && a != null) ? a - n : null;
  }
  return { natural, adapted, shifts };
}