import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";

// Generates career hypotheses from evidence + scores + simulations + career DNA.
// Input: { career_dna, evidence_items, contradictions, scores, simulations }
// Output: { hypotheses: [...] } — 3 strongest, 2 wildcard, up to 3 weak_current_fit
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const careerDna = body?.career_dna || {};
    const evidenceItems = body?.evidence_items || [];
    const contradictions = body?.contradictions || [];
    const scores = body?.scores || {};
    const simulations = body?.simulations || [];

    const instructions = `You are Career Compass. Generate career hypotheses with explicit uncertainty. Produce exactly:
- 3 strongest-fit hypotheses
- 2 wildcard / non-obvious hypotheses
- up to 3 poor-current-fit directions
Each hypothesis must include per-dimension fit scores (0-100), supporting/contradictory evidence, unknowns, a reality check, a suggested experiment, and education implication. Do NOT force business, design, sport or gaming unless evidence supports them. Confidence is separate from fit and depends on evidence amount/quality, consistency, simulation exposure, and unresolved contradictions. Avoid false precision.`;

    const hypothesisSchema = {
      type: "object",
      properties: {
        hypothesis_type: { type: "string", enum: ["strongest", "wildcard", "weak_current_fit"] },
        career_family: { type: "string" },
        example_roles: { type: "array", items: { type: "string" } },
        fit_score: { type: "number" },
        confidence_score: { type: "number" },
        interest_fit: { type: "number" },
        strength_fit: { type: "number" },
        work_style_fit: { type: "number" },
        values_fit: { type: "number" },
        simulation_fit: { type: "number" },
        simulation_enjoyment: { type: "number" },
        lifestyle_fit: { type: "number" },
        supporting_evidence: { type: "array", items: { type: "string" } },
        contradictory_evidence: { type: "array", items: { type: "string" } },
        unknowns: { type: "array", items: { type: "string" } },
        reality_check: { type: "string" },
        suggested_experiment: { type: "string" },
        education_implication: { type: "string" },
      },
      required: ["hypothesis_type", "career_family", "fit_score", "confidence_score", "interest_fit", "strength_fit", "work_style_fit", "values_fit", "simulation_fit", "supporting_evidence", "unknowns", "reality_check", "suggested_experiment", "education_implication"],
    };

    const schema = {
      type: "object",
      properties: {
        hypotheses: { type: "array", items: hypothesisSchema },
      },
      required: ["hypotheses"],
    };

    const input = JSON.stringify({ career_dna: careerDna, evidence_items: evidenceItems, contradictions, scores, simulations });
    const out = await responsesChat({ kind: "final", instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Hypotheses error' }, { status: 500 });
  }
}