import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from '../../shared/openai.ts';

// Stage 1 — analyse the finished report and surface the key narrative threads
// that should become a visual story for a teenage reader.
// Input:  { report_id }
// Output: { stories, analysis_id } — persisted to VisualStoryAnalysis.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const report = await base44.entities.Report.get(report_id);
    const instructions = `You are a visual-storytelling strategist for Career Compass, a teen career-exploration app.

Read the full career report below and identify the 5-8 most important narrative threads — the ideas a teenager would actually remember and care about. Think: "what is the one-line story this report is telling?"

For each thread, name it, explain why it matters to this specific person, and list the concrete evidence/scores that support it. Stay grounded in the report — do not invent new facts. Use the person's own evidence, not generic advice. No chain-of-thought.`;

    const schema = {
      type: 'object',
      properties: {
        stories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              narrative_thread: { type: 'string', description: 'A short, memorable title for this story thread.' },
              why_it_matters: { type: 'string', description: 'Why this matters to THIS person, in 1-2 sentences.' },
              supporting_evidence: { type: 'array', items: { type: 'string' }, description: 'Concrete scores/quotes/behaviours from the report that ground this thread.' },
            },
            required: ['narrative_thread', 'why_it_matters', 'supporting_evidence'],
          },
        },
      },
      required: ['stories'],
    };

    const out: any = await responsesChat({ base44, instructions, input: JSON.stringify(report), jsonSchema: schema });

    const prior = await base44.entities.VisualStoryAnalysis.filter({ report_id });
    for (const p of prior) await base44.entities.VisualStoryAnalysis.delete(p.id);
    const record = await base44.entities.VisualStoryAnalysis.create({ report_id, stories: out.stories, status: 'complete' });

    return Response.json({ stories: out.stories, analysis_id: record.id });
  } catch (error) {
    return Response.json({ error: error.message || 'Visual story analysis failed' }, { status: 500 });
  }
}