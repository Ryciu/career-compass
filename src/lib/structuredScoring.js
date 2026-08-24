// Deterministic scoring for the two structured assessments.
// No LLM here — pure deterministic math.

import { SJT_SCENARIOS, DRIVER_ITEMS, DRIVER_DIMENSIONS } from "@/data/structuredAssessments";

// SJT: aggregate behavioural-tendency deltas, normalize to 0–100 exploratory scale.
// A dimension needs at least 2 chosen-item signals, otherwise INSUFFICIENT DATA (null).
export function scoreSjt(answers) {
  const raw = {};
  const touched = {};
  const maxPoss = {};
  const minPoss = {};

  for (const sc of SJT_SCENARIOS) {
    const dimSet = new Set();
    for (const opt of sc.options) {
      for (const d of Object.keys(opt.signals)) dimSet.add(d);
    }
    for (const d of dimSet) {
      let mx = -Infinity, mn = Infinity;
      for (const opt of sc.options) {
        const v = opt.signals[d];
        if (v != null) { if (v > mx) mx = v; if (v < mn) mn = v; }
      }
      maxPoss[d] = (maxPoss[d] || 0) + (mx === -Infinity ? 0 : mx);
      minPoss[d] = (minPoss[d] || 0) + (mn === Infinity ? 0 : mn);
    }
    const chosen = answers[sc.id];
    if (!chosen) continue;
    const opt = sc.options.find((o) => o.key === chosen);
    if (!opt) continue;
    for (const [d, delta] of Object.entries(opt.signals)) {
      raw[d] = (raw[d] || 0) + delta;
      touched[d] = (touched[d] || 0) + 1;
    }
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

export function driverCategory(score) {
  if (score >= 75) return "Strong current driver";
  if (score >= 60) return "Meaningful driver";
  if (score >= 40) return "Moderate / context-dependent";
  if (score >= 25) return "Lower current priority";
  return "Low relative priority";
}

// Drivers: each selection +1 to its driver; normalized = raw/presented*100.
export function scoreDrivers(selections) {
  const raw = {};
  const presented = {};
  for (const it of DRIVER_ITEMS) {
    presented[it.a.driver] = (presented[it.a.driver] || 0) + 1;
    presented[it.b.driver] = (presented[it.b.driver] || 0) + 1;
  }
  const selMap = {};
  for (const s of selections) selMap[s.item_id] = s.choice;
  for (const it of DRIVER_ITEMS) {
    const ch = selMap[it.id];
    if (!ch) continue;
    const d = ch === "A" ? it.a.driver : it.b.driver;
    raw[d] = (raw[d] || 0) + 1;
  }
  const normalized = {};
  for (const d of DRIVER_DIMENSIONS) {
    const p = presented[d] || 0;
    normalized[d] = p > 0 ? Math.round(((raw[d] || 0) / p) * 100) : 0;
  }
  const ranked = DRIVER_DIMENSIONS
    .map((d) => ({ driver: d, score: normalized[d], raw: raw[d] || 0, presented: presented[d] || 0, category: driverCategory(normalized[d]) }))
    .sort((a, b) => b.score - a.score);
  return { raw, presented, normalized, ranked };
}