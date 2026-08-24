// Shared OpenAI helper — uses the Responses API, server-side only.
import OpenAI from "npm:openai";
import { secrets } from "base44:runtime";

export function getClient() {
  const key = secrets.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY secret is not set.");
  return new OpenAI({ apiKey: key });
}

export function model(kind) {
  // kind: "coach" | "analysis" | "final" | "transcription"
  const map = {
    coach: secrets.get("OPENAI_MODEL_COACH") || "gpt-5.6-terra",
    analysis: secrets.get("OPENAI_MODEL_ANALYSIS") || "gpt-5.6-terra",
    final: secrets.get("OPENAI_MODEL_FINAL") || "gpt-5.6-sol",
    transcription: secrets.get("OPENAI_MODEL_TRANSCRIPTION") || "gpt-transcribe",
  };
  return map[kind];
}

// Thin wrapper around the OpenAI Responses API with optional JSON schema output.
export async function responsesChat({ kind, instructions, input, jsonSchema }) {
  const client = getClient();
  const m = model(kind);
  const params = {
    model: m,
    instructions,
    input,
  };
  if (jsonSchema) {
    params.text = {
      format: {
        type: "json_schema",
        name: "result",
        strict: true,
        schema: jsonSchema,
      },
    };
  }
  const res = await client.responses.create(params);
  // Extract text output
  const text = res.output_text || "";
  if (jsonSchema) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}