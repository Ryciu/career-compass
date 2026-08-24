// Deterministic scoring for Natural Strength Patterns. No LLM.
import { PATTERNS, STRENGTH_ITEMS } from "@/data/strengths";

export function strengthCategory(score) {
  if (score >= 70) return "Very natural pattern";
  if (score >= 55) return "Natural pattern";
  if (score >= 45) return "Situational pattern";
  if (score >= 30) return "Less typical";
  return "Rarely dominant";
}

export function scoreStrengths(choices) {
  const presented = {};
  for (const it of STRENGTH_ITEMS) {
    presented[it.a.pattern] = (presented[it.a.pattern] || 0) + 1;
    presented[it.b.pattern] = (presented[it.b.pattern] || 0) + 1;
  }
  const raw = {};
  for (const it of STRENGTH_ITEMS) {
    const ch = choices[it.id];
    if (!ch) continue;
    const p = ch === "A" ? it.a.pattern : it.b.pattern;
    raw[p] = (raw[p] || 0) + 1;
  }
  const normalized = {};
  for (const p of PATTERNS) {
    const pr = presented[p.code] || 0;
    normalized[p.code] = pr > 0 ? Math.round(((raw[p.code] || 0) / pr) * 100) : 0;
  }
  const ranked = PATTERNS
    .map((p) => ({
      pattern: p.code,
      label: p.label,
      desc: p.desc,
      score: normalized[p.code],
      raw: raw[p.code] || 0,
      presented: presented[p.code] || 0,
      category: strengthCategory(normalized[p.code]),
    }))
    .sort((a, b) => b.score - a.score);

  const top5 = ranked.slice(0, 5).map((r) => r.pattern);
  const supporting = ranked.slice(5, 10).map((r) => r.pattern);
  return { raw, presented, normalized, ranked, top5, supporting };
}