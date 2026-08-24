import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Evaluates a simulation response using a structured rubric. Separate performance from enjoyment.
// Input: { simulation_type, prompt, response_text, follow_up_responses? }
// Output: rubric scores + summary.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const simulationType = body?.simulation_type;
    const prompt = body?.prompt;
    const responseText = body?.response_text;
    const followUps = body?.follow_up_responses || {};

    const task = `## YOUR TASK

Score this simulation response against a structured rubric (0-10 each).

Apply SIMULATIONS rules: separate PERFORMANCE from ENJOYMENT. Someone may be good at a task and dislike it; someone may love a task but currently lack competence. Both are meaningful and must be scored independently.

Do NOT confuse writing eloquence with underlying ability. Be calibrated and avoid inflated scores.

Provide an overall_simulation_performance (0-100 composite) and a concise summary grounded in the response. If follow_up_responses are present, use their qualitative signal for reasoning, but keep performance and enjoyment conceptually separate.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        problem_framing: { type: "number" },
        creativity: { type: "number" },
        practicality: { type: "number" },
        prioritisation: { type: "number" },
        commercial_reasoning: { type: "number" },
        social_reasoning: { type: "number" },
        technical_reasoning: { type: "number" },
        communication_clarity: { type: "number" },
        overall_simulation_performance: { type: "number", description: "0-100 composite" },
        summary: { type: "string", description: "2-3 sentences, grounded in the response" },
      },
      required: ["problem_framing", "creativity", "practicality", "prioritisation", "communication_clarity", "overall_simulation_performance", "summary"],
    };

    const input = JSON.stringify({
      simulation_type: simulationType,
      prompt,
      response_text: responseText,
      follow_up_responses: followUps,
    });

    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Evaluation error' }, { status: 500 });
  }
}