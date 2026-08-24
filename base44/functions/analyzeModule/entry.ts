import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Analyses a completed module's responses into structured EvidenceItems + Contradictions.
// Input: { module, responses: [{ question_id, question_text, first_response, reflection_response }] }
// Output: { evidence_items: [...], contradictions: [...] }
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const module = body?.module;
    const responses = body?.responses || [];
    const priorEvidence = body?.priorEvidence || [];

    const task = `## YOUR TASK

Distill the user's responses into structured EvidenceItems and Contradictions.

- Classify each EvidenceItem by domain (DECLARED INTEREST, BEHAVIORAL EVIDENCE, ABILITY, ENERGY, VALUES, WORK ENVIRONMENT) and whether it supports or contradicts the emerging profile.
- Apply EVIDENCE strength rules: weak = hypothetical declaration; medium = one concrete behavioural example; strong = repeated behaviour, sustained commitment, achievement, or multiple independent examples.
- NEVER infer a global trait from isolated behaviour. Apply SPORT and GAMING decompositions where relevant: do not equate gym interest with Personal Trainer fit, and treat playing games alone as insufficient evidence for a gaming career.
- If first_response and reflection_response differ, treat the difference as information requiring exploration — do not assume the first answer is more authentic.
- Detect tensions between declared goals, past behaviour, values, risk preferences, enjoyment. Each contradiction must produce a follow_up_question that can discriminate between the two directions.
- Ground every claim in the user's actual words (supporting_excerpt). Be concise. No chain-of-thought.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        evidence_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              claim: { type: "string" },
              domain: { type: "string" },
              supporting_excerpt: { type: "string" },
              source_question_id: { type: "string" },
              strength: { type: "string", enum: ["weak", "medium", "strong"] },
              supports_or_contradicts: { type: "string", enum: ["supports", "contradicts", "neutral"] },
            },
            required: ["claim", "domain", "strength", "supports_or_contradicts"],
          },
        },
        contradictions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              dimension_a: { type: "string" },
              dimension_b: { type: "string" },
              follow_up_question: { type: "string" },
            },
            required: ["description", "follow_up_question"],
          },
        },
      },
      required: ["evidence_items", "contradictions"],
    };

    const input = JSON.stringify({
      module,
      prior_evidence_domains: priorEvidence.map((e) => ({ domain: e.domain, claim: e.claim })),
      responses: responses.map((r) => ({
        question_id: r.question_id,
        question_text: r.question_text,
        first_response: r.first_response,
        reflection_response: r.reflection_response,
      })),
    });

    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Analysis error' }, { status: 500 });
  }
}