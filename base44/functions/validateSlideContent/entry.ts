import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from '../../shared/openai.ts';

// Stage 6 — fact validation. Before rendering, verify every slide prompt
// against the final structured report. Any fact/number/ranking/career not
// grounded in the report is removed; the prompt is corrected in place.
// The image generator only renders validated content — it is never the
// source of truth.
// Input:  { report_id }
// Output: { checks } — persisted to SlidePrompt (prompt + validation_status).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const briefs = await base44.entities.SlideBrief.filter({ report_id });
    const prompts = await base44.entities.SlidePrompt.filter({ report_id });
    if (!prompts.length) return Response.json({ error: 'Run prompt stage first' }, { status: 400 });

    const report = await base44.entities.Report.get(report_id);

    const instructions = `You are a strict fact-checker for Career Compass visual slides.

For EACH slide prompt, compare it against the report and slide brief. Verify every number, ranking, label, career suggestion, green/red flag and quote. 
- If the prompt contains anything NOT in the report/brief, rewrite it to remove the unsupported content (keeping the visual direction) and set valid=false-with-correction.
- If everything checks out, return the prompt unchanged and valid=true.
- Never invent new scores, facts, careers or recommendations.

Return one check per slide.`;

    const schema = {
      type: 'object',
      properties: {
        checks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slide_number: { type: 'number' },
              valid: { type: 'boolean' },
              removed: { type: 'array', items: { type: 'string' }, description: 'unsupported facts that were removed' },
              corrected_prompt: { type: 'string' },
            },
            required: ['slide_number', 'valid', 'removed', 'corrected_prompt'],
            additionalProperties: false,
          },
        },
      },
      required: ['checks'],
      additionalProperties: false,
    };

    const out: any = await responsesChat({ base44, instructions, input: JSON.stringify({ briefs, prompts, report }), jsonSchema: schema });

    for (const c of out.checks) {
      const sp = prompts.find((p) => p.slide_number === c.slide_number);
      if (sp) {
        await base44.entities.SlidePrompt.update(sp.id, {
          prompt: c.corrected_prompt || sp.prompt,
          validation_status: 'valid',
        });
      }
    }

    return Response.json({ checks: out.checks });
  } catch (error) {
    return Response.json({ error: error.message || 'Validation failed' }, { status: 500 });
  }
}