import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

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

    const task = `## YOUR TASK

Write the final report from the user's evidence. Apply FINAL TONE: never write "You should become X." Use "The strongest current hypothesis is…", "The evidence supporting this is…", "This remains uncertain because…", "Before committing to expensive education, test this by…".

Structure (FINAL REPORT):
- Prioritize 3 strongest hypotheses, 2 wildcard hypotheses, up to 3 directions currently showing weak fit.
- For every strong hypothesis include WHY IT MAY FIT, EVIDENCE, CONTRARY EVIDENCE, WHAT WE DO NOT KNOW, REALITY CHECK, LOW-COST EXPERIMENT, EDUCATION IMPLICATION, CONFIDENCE.

Education (EDUCATION rules):
- Separate the CAREER DECISION from the EDUCATION DECISION. Do not assume a university degree is automatically the best path. Use the English education labels for education_direction_type (university_degree, vocational_vet, professional_certification, portfolio_based, work_experience, entrepreneurial_experiment, unclear_explore_first).
- Suggest inexpensive real-world experiments before expensive education decisions.
- Include a 30-day action plan.

Cautions (PSYCHOMETRIC CAUTION): exploratory framing only — never clinical, diagnostic, certified, or scientifically-definitive language. Never diagnose conditions.

Also incorporate the two structured assessments (input keys: sjt, career_drivers, and cross_validation flags). Produce these additional English sections:

- motivational_drivers: top 3-5 Career Drivers from the forced-choice test. For each give driver, category (from normalized score band), a brief interpretation, supporting evidence, and any possible tension with other findings. Never label low drivers as weaknesses.
- sjt_behavioral_patterns: the 4-6 most meaningful behavioural patterns from the Situational Judgment Test. Do NOT list every score. State each only when supported.
- where_tests_disagree: where self-description, forced choices, situational decisions, past behaviour and simulations conflict, state the disagreements explicitly as useful diagnostic information.

Do not over-interpret small differences. A career recommendation must never rest on a single structured test; confidence rises only when a finding appears in at least TWO independent sources.

Produce BOTH:
1. structured English sections (object fields)
2. a complete Polish markdown summary (full_markdown_pl) — this is for the admin/researcher view.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

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
        motivational_drivers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              driver: { type: "string" },
              category: { type: "string" },
              interpretation: { type: "string" },
              supporting_evidence: { type: "array", items: { type: "string" } },
              possible_tension: { type: "string" },
            },
            required: ["driver", "interpretation"],
          },
        },
        sjt_behavioral_patterns: { type: "array", items: { type: "string" } },
        where_tests_disagree: { type: "array", items: { type: "string" } },
        full_markdown_pl: { type: "string", description: "Pełny raport po polsku w formacie Markdown dla administratora/badacza" },
      },
      required: ["executive_summary", "education_direction_type", "experiments", "action_plan_30_day", "full_markdown_pl"],
    };

    const input = JSON.stringify(bundle);
    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Report error' }, { status: 500 });
  }
}