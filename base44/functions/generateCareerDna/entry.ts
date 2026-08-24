import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Generates the Career DNA summary from all accumulated evidence.
// Input: { evidence_items, contradictions, scores, simulations }
// Output: { career_dna: {...} }
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const evidenceItems = body?.evidence_items || [];
    const contradictions = body?.contradictions || [];
    const scores = body?.scores || {};
    const simulations = body?.simulations || [];
    const sjt = body?.sjt || null;
    const careerDrivers = body?.career_drivers || null;
    const crossValidation = body?.cross_validation || [];

    const task = `## YOUR TASK

Produce a Career DNA summary grounded ONLY in the provided evidence, contradictions, scores, simulations, and the two structured assessments (SJT + Career Drivers).

Use each source for the type of question it is best suited to answer — do NOT simply average tests:
- RIASEC scores (in scores.riasec): "What activities appear attractive?"
- Work Style (scores.work_style): "How does the user prefer to work?"
- Values (scores.values): "What outcomes does the user consciously value?"
- Career Drivers Forced Choice (career_drivers): "What wins when attractive values compete?" Treat high drivers as relative motivational priorities, NOT as evidence of skill. Never label low driver scores as weaknesses.
- Situational Judgment Test (sjt): "How does the user say they would behave in realistic situations?" — behavioural tendency patterns, supporting evidence only, not unquestionable truth.
- Behavioural coaching evidence + simulations: "What has the user actually done, and how did they perform?"

Incorporate cross_validation flags honestly. Where structured tests disagree with open-ended evidence, name it explicitly in cross_validation_notes. Where multiple independent sources agree, confidence rises.

- Distinguish DECLARED PREFERENCE, BEHAVIORAL EVIDENCE, ABILITY, ENERGY, VALUES, and WORK STYLE. Do not treat a stated interest as proof of fit.
- Every important claim should be traceable to evidence. Describe energy sources and drains honestly.
- Apply PSYCHOMETRIC CAUTION: use exploratory language ("current pattern", "working hypothesis", "evidence-based indication"). Never use clinical, diagnostic, certified, or scientifically-definitive language. Never diagnose conditions.
- State blind spots honestly. Be concise. No chain-of-thought.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        dominant_interest_pattern: { type: "string" },
        demonstrated_strengths: { type: "array", items: { type: "string" } },
        energy_sources: { type: "array", items: { type: "string" } },
        energy_drains: { type: "array", items: { type: "string" } },
        preferred_environment: { type: "string" },
        autonomy_need: { type: "string" },
        competition_orientation: { type: "string" },
        social_intensity: { type: "string" },
        risk_tolerance: { type: "string" },
        progress_motivation: { type: "string" },
        physical_activity_preference: { type: "string" },
        creativity_orientation: { type: "string" },
        leadership_preference: { type: "string" },
        primary_values: { type: "array", items: { type: "string" } },
        potential_blind_spots: { type: "array", items: { type: "string" } },
        motivational_drivers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              driver: { type: "string" },
              score_category: { type: "string" },
              interpretation: { type: "string" },
            },
            required: ["driver", "interpretation"],
          },
          description: "Top 3-5 Career Drivers from the forced-choice test, with interpretations grounded in the normalized scores.",
        },
        behavioral_tendencies: { type: "array", items: { type: "string" }, description: "4-6 most meaningful SJT behavioural patterns, each grounded in the dimension scores and stated only when supported." },
        cross_validation_notes: { type: "array", items: { type: "string" }, description: "Important disagreements across self-description, forced choices, situational decisions, past behaviour and simulations." },
      },
      required: ["dominant_interest_pattern", "demonstrated_strengths", "energy_sources", "energy_drains", "preferred_environment", "primary_values", "potential_blind_spots"],
    };

    const input = JSON.stringify({ evidence_items: evidenceItems, contradictions, scores, simulations, sjt, career_drivers: careerDrivers, cross_validation: crossValidation });
    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json({ career_dna: out });
  } catch (error) {
    return Response.json({ error: error.message || 'Career DNA error' }, { status: 500 });
  }
}