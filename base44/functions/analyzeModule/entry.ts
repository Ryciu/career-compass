import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";

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

    const instructions = `You are Career Compass's analysis engine. Distill the user's responses into structured EvidenceItems and Contradictions. Rules:
- Distinguish DECLARED INTEREST, BEHAVIORAL EVIDENCE, ABILITY, ENERGY, VALUES, WORK ENVIRONMENT.
- Strength: weak = hypothetical declaration; medium = one concrete behavioural example; strong = repeated behaviour, sustained commitment, meaningful achievement, or multiple independent examples.
- NEVER infer a global trait from isolated behaviour. e.g. do NOT say "User is highly conscientious" from gym training; say "User demonstrates sustained discipline in a domain with measurable progress."
- Detect tensions between declared goals, past behaviour, values, risk preferences, enjoyment. A contradiction must create a question.
- Claims must be grounded in the user's actual words (supporting_excerpt).
- Be concise. No chain-of-thought.`;

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