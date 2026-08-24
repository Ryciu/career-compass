import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";
import { SESSION1_QUESTIONS, SPORT_QUESTIONS, GAMING_QUESTIONS, MONEY_QUESTIONS, DECISION_OWNERSHIP_QUESTIONS } from "../../shared/assessmentConfig.ts";

// Adaptive coach: given the module + already-given answers, decide the next question to ask.
// Returns { question_id, question_text, first_instinct, is_followup } or { done: true }.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const module = body?.module; // session1 | sport | gaming | money | decision_ownership
    const answered = body?.answered || []; // [{ question_id, first_response, reflection_response }]
    const contradictions = body?.contradictions || [];

    const banks = {
      session1: SESSION1_QUESTIONS,
      sport: SPORT_QUESTIONS,
      gaming: GAMING_QUESTIONS,
      money: MONEY_QUESTIONS,
      decision_ownership: DECISION_OWNERSHIP_QUESTIONS,
    };
    const bank = banks[module];
    if (!bank) return Response.json({ error: 'Unknown module' }, { status: 400 });

    const answeredIds = new Set(answered.map((a) => a.question_id));
    const remaining = bank.filter((q) => !answeredIds.has(q.id));

    // If all core questions answered, let the coach decide whether a follow-up has high value or we're done.
    const task = `## YOUR CURRENT TASK

You are driving a single coaching module. Based on the module, the answers already given, the remaining core questions, and any open contradictions, decide your NEXT action:
- (a) ask the next core question from the remaining list (use its id and text), or
- (b) ask ONE discriminating adaptive follow-up to resolve an open contradiction or test transfer of a behaviour to another domain (id "followup_<n>"), or
- (c) declare the module complete (done: true).

Follow ADAPTIVE QUESTIONING: identify highest-information question, never repeat answered information, never ask "what career do you want". Ask only ONE main question. Keep the question warm, natural and concise — do not sound like a robot. Do not overpraise.

Respond with: question_id, question_text, rationale (one short sentence on the information value), done.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        question_id: { type: "string", description: "id from the bank for a core question, or 'followup_<n>' for an adaptive follow-up" },
        question_text: { type: "string" },
        rationale: { type: "string", description: "one short sentence of why this question has high information value" },
        done: { type: "boolean" },
      },
      required: ["question_id", "question_text", "done"],
    };

    const input = JSON.stringify({
      module,
      answered: answered.map((a) => ({ question_id: a.question_id, first_response: a.first_response, reflection_response: a.reflection_response })),
      remaining_questions: remaining.map((q) => ({ id: q.id, text: q.text })),
      contradictions: contradictions.map((c) => ({ description: c.description, follow_up_question: c.follow_up_question })),
    });

    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });

    // Safety: if the model says done but core questions remain, force next core question.
    if (out.done && remaining.length) {
      const n = remaining[0];
      return Response.json({ question_id: n.id, question_text: n.text, first_instinct: !!n.first_instinct, rationale: "Next core question.", done: false });
    }
    return Response.json({
      ...out,
      first_instinct: out.done ? false : (out.question_id || "").startsWith("followup") ? false : !!bank.find((q) => q.id === out.question_id)?.first_instinct,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Coach error' }, { status: 500 });
  }
}