import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from '../../shared/openai.ts';

// Stage 3 — write a detailed brief for each slide: message, evidence, flags,
// infographic type and layout. Persisted as one SlideBrief per slide.
// Input:  { report_id }
// Output: { briefs, count } — persisted to SlideBrief.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const storyboard = await base44.entities.VisualStoryboard.filter({ report_id });
    if (!storyboard.length) return Response.json({ error: 'Run select stage first' }, { status: 400 });
    const slides = storyboard[0].sequence || [];
    const report = await base44.entities.Report.get(report_id);

    const instructions = `You are an editorial designer briefing an image generator on a set of teen-friendly career infographics.

For EACH slide provided, produce a full brief. Pull validated scores/quotes from the report. Be honest: include green flags AND red flags where they exist. Each slide must have:
- core_message (the ONE thing the slide must say)
- supporting_points (2-4 concrete points from the report)
- validated_scores (object of any score/number to display, e.g. {"Investigative":70})
- career_implications (1-3 honest implications)
- green_flags / red_flags (arrays)
- short_takeaway (one line a teen remembers)
- infographic_type (e.g. "radar chart", "timeline", "before/after split", "icon grid")
- recommended_layout (e.g. "left text, right visual")
- must_include / must_not_include (arrays — guardrails for the image prompt)

Do NOT invent scores. If a number isn't in the report, leave it out. No chain-of-thought.`;

    const schema = {
      type: 'object',
      properties: {
        briefs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slide_number: { type: 'number' },
              slide_title: { type: 'string' },
              core_message: { type: 'string' },
              supporting_points: { type: 'array', items: { type: 'string' } },
              validated_scores: { type: 'object' },
              career_implications: { type: 'array', items: { type: 'string' } },
              green_flags: { type: 'array', items: { type: 'string' } },
              red_flags: { type: 'array', items: { type: 'string' } },
              short_takeaway: { type: 'string' },
              infographic_type: { type: 'string' },
              recommended_layout: { type: 'string' },
              must_include: { type: 'array', items: { type: 'string' } },
              must_not_include: { type: 'array', items: { type: 'string' } },
            },
            required: ['slide_number', 'slide_title', 'core_message', 'short_takeaway', 'infographic_type'],
          },
        },
      },
      required: ['briefs'],
    };

    const out: any = await responsesChat({ base44, instructions, input: JSON.stringify({ slides, report }), jsonSchema: schema });

    const prior = await base44.entities.SlideBrief.filter({ report_id });
    for (const p of prior) await base44.entities.SlideBrief.delete(p.id);
    for (const b of out.briefs) {
      await base44.entities.SlideBrief.create({ report_id, slide_number: b.slide_number, slide_title: b.slide_title, core_message: b.core_message, supporting_points: b.supporting_points || [], validated_scores: b.validated_scores || {}, career_implications: b.career_implications || [], green_flags: b.green_flags || [], red_flags: b.red_flags || [], short_takeaway: b.short_takeaway, infographic_type: b.infographic_type, recommended_layout: b.recommended_layout, must_include: b.must_include || [], must_not_include: b.must_not_include || [] });
    }

    return Response.json({ briefs: out.briefs, count: out.briefs.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Brief generation failed' }, { status: 500 });
  }
}