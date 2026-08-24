import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from '../../shared/openai.ts';

// Stage 4 — turn each slide brief into a final image-generation prompt
// for gpt-image-2. Persisted as one SlidePrompt per slide.
// Input:  { report_id }
// Output: { prompts, count } — persisted to SlidePrompt.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const briefs = await base44.entities.SlideBrief.filter({ report_id });
    if (!briefs.length) return Response.json({ error: 'Run brief stage first' }, { status: 400 });

    const instructions = `You are a prompt engineer for gpt-image-2, writing final image-generation prompts for teen-friendly career infographics.

For each slide brief, write ONE self-contained image prompt that:
- describes a clean, modern editorial infographic (NOT a photo of a person, NOT cluttered)
- uses the recommended infographic_type and layout
- includes only the validated_scores and short_takeaway as on-image text (no invented numbers)
- is visually engaging for a 16-19 year old — bold, clear, modern illustration style, restrained palette
- respects must_include / must_not_include as hard guardrails
- avoids text walls (max ~12 words of on-image text total)
- is a single paragraph, ready to feed directly to an image model

Return one prompt object per slide. No chain-of-thought.`;

    const schema = {
      type: 'object',
      properties: {
        prompts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slide_number: { type: 'number' },
              slide_title: { type: 'string' },
              prompt: { type: 'string' },
            },
            required: ['slide_number', 'slide_title', 'prompt'],
          },
        },
      },
      required: ['prompts'],
    };

    const out: any = await responsesChat({ base44, instructions, input: JSON.stringify({ briefs }), jsonSchema: schema });

    const prior = await base44.entities.SlidePrompt.filter({ report_id });
    for (const p of prior) await base44.entities.SlidePrompt.delete(p.id);
    for (const p of out.prompts) {
      await base44.entities.SlidePrompt.create({ report_id, slide_number: p.slide_number, slide_title: p.slide_title, prompt: p.prompt, provider: 'openai_gpt_image_2', validation_status: 'valid' });
    }

    return Response.json({ prompts: out.prompts, count: out.prompts.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Prompt generation failed' }, { status: 500 });
  }
}