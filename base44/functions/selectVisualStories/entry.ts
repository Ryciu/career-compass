import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from '../../shared/openai.ts';

// Stage 2 — turn the narrative threads into 5-10 concrete slides.
// Each slide = one key piece of information worth its own infographic.
// Input:  { report_id }
// Output: { slides, storyboard_id } — persisted to VisualStoryboard.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const analysis = await base44.entities.VisualStoryAnalysis.filter({ report_id });
    if (!analysis.length) return Response.json({ error: 'Run analyze stage first' }, { status: 400 });
    const stories = analysis[0].stories || [];

    const instructions = `You are designing a 5-10 slide visual summary of a teen's career report.

Take the narrative threads below and decide which deserve their own infographic. For each slide:
- slide_number (ordered starting at 1)
- slide_title (short, punchy, teen-friendly — not clinical)
- key_information (3-5 bullet points the infographic must communicate — concrete, from the report)
- visual_angle (one sentence: the metaphor or visual concept that makes this slide click for a 16-19 year old)

Keep the total between 5 and 10 slides. Prioritise clarity and honesty over hype. No chain-of-thought.`;

    const schema = {
      type: 'object',
      properties: {
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slide_number: { type: 'number' },
              slide_title: { type: 'string' },
              key_information: { type: 'array', items: { type: 'string' } },
              visual_angle: { type: 'string' },
            },
            required: ['slide_number', 'slide_title', 'key_information', 'visual_angle'],
          },
        },
      },
      required: ['slides'],
    };

    const out: any = await responsesChat({ base44, instructions, input: JSON.stringify({ stories }), jsonSchema: schema });

    const prior = await base44.entities.VisualStoryboard.filter({ report_id });
    for (const p of prior) await base44.entities.VisualStoryboard.delete(p.id);
    const record = await base44.entities.VisualStoryboard.create({ report_id, sequence: out.slides, status: 'complete' });

    return Response.json({ slides: out.slides, storyboard_id: record.id });
  } catch (error) {
    return Response.json({ error: error.message || 'Slide selection failed' }, { status: 500 });
  }
}