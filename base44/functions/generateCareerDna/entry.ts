import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";

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

    const instructions = `You are Career Compass. Produce a Career DNA summary grounded ONLY in the provided evidence. Every important claim should be traceable to evidence. State blind spots honestly. Be concise.`;

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
      },
      required: ["dominant_interest_pattern", "demonstrated_strengths", "energy_sources", "energy_drains", "preferred_environment", "primary_values", "potential_blind_spots"],
    };

    const input = JSON.stringify({ evidence_items: evidenceItems, contradictions, scores, simulations });
    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json({ career_dna: out });
  } catch (error) {
    return Response.json({ error: error.message || 'Career DNA error' }, { status: 500 });
  }
}