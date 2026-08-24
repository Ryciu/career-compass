// Shared LLM helper — uses Base44's built-in InvokeLLM integration (server-side only),
// running on the subscription-covered model gpt_5_6_sol. No OpenAI API key or secrets required.
//
// responsesChat keeps the same return contract as the previous OpenAI Responses wrapper:
//  - if jsonSchema is provided, returns a parsed object (schema root must be type "object");
//  - otherwise returns a string.

export const LLM_MODEL = "claude-sonnet-5";

interface ResponsesChatArgs {
  base44: any;
  instructions: string;
  input: string;
  jsonSchema?: object;
}

export async function responsesChat({ base44, instructions, input, jsonSchema }: ResponsesChatArgs) {
  const prompt = `${instructions}\n\nINPUT:\n${input}`;
  const params: any = {
    prompt,
    model: LLM_MODEL,
  };
  if (jsonSchema) {
    params.response_json_schema = jsonSchema;
  }

  const out = await base44.asServiceRole.integrations.Core.InvokeLLM(params);

  // With response_json_schema, InvokeLLM returns a parsed object; otherwise a string.
  if (jsonSchema) {
    if (out && typeof out === "object") return out;
    // Defensive: if a string slipped through, parse it.
    if (typeof out === "string") {
      try {
        return JSON.parse(out);
      } catch {
        return out;
      }
    }
  }
  return out;
}