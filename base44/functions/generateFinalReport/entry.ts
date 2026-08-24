import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";

// Generates the full final report. Two parallel outputs:
//  - English structured sections for the user
//  - Polish full markdown for the Admin view
// Input: full assessment bundle
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const bundle = body || {};

    const instructions = `You are Career Compass. Write the final report from the user's evidence. Use language such as "The evidence currently suggests…", "Confidence is moderate because…", "This hypothesis requires testing…". NEVER say "This is what you should do with your life." Separate the CAREER DECISION from the EDUCATION DECISION, and never assume university is automatically the best path. Suggest inexpensive real-world experiments before expensive education decisions. Include a 30-day plan.

Produce BOTH:
1. structured English sections (object fields)
2. a complete Polish markdown summary (full_markdown_pl) — this is for the admin/researcher view.`;

    const experimentSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        domain: { type: "string" },
        description: { type: "string" },
        success_indicator: { type: "string" },
      },
      required: ["title", "description"],
    };
    const actionItemSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        timing: { type: "string" },
      },
      required: ["title", "description"],
    };

    const schema = {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        energizers: { type: "array", items: { type: "string" } },
        demonstrated_strengths: { type: "array", items: { type: "string" } },
        work_environment_fit: { type: "string" },
        values_summary: { type: "string" },
        important_contradictions: { type: "array", items: { type: "string" } },
        top_hypotheses_summary: { type: "array", items: { type: "string" } },
        wildcard_hypotheses_summary: { type: "array", items: { type: "string" } },
        weak_fit_directions: { type: "array", items: { type: "string" } },
        education_implication: { type: "string" },
        education_direction_type: {
          type: "string",
          enum: ["university_degree", "vocational_vet", "professional_certification", "portfolio_based", "work_experience", "apprenticeship", "entrepreneurial_experiment", "unclear_explore_first"],
        },
        what_we_still_do_not_know: { type: "array", items: { type: "string" } },
        experiments: { type: "array", items: experimentSchema },
        action_plan_30_day: { type: "array", items: actionItemSchema },
        twelve_month_direction: { type: "string" },
        full_markdown_pl: { type: "string", description: "Pełny raport po polsku w formacie Markdown dla administratora/badacza" },
      },
      required: ["executive_summary", "education_direction_type", "experiments", "action_plan_30_day", "full_markdown_pl"],
    };

    const input = JSON.stringify(bundle);
    const out = await responsesChat({ kind: "final", instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Report error' }, { status: 500 });
  }
}