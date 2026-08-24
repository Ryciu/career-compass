import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateGptImage, b64ToFile } from '../../shared/openaiImage.ts';

// Regenerate a SINGLE slide asset (PART 27). Reuses the validated prompt for
// that slide, re-renders with gpt-image-2, and upserts the GeneratedVisualAsset.
// Input:  { report_id, slide_number }
// Output: { asset }
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id, slide_number } = await req.json();
    if (!report_id || slide_number == null) return Response.json({ error: 'report_id and slide_number required' }, { status: 400 });

    const prompt = (await base44.entities.SlidePrompt.filter({ report_id, slide_number }))[0];
    if (!prompt) return Response.json({ error: 'Prompt not found for slide' }, { status: 404 });

    let file_url = '';
    let generation_status = 'complete';
    try {
      const { b64_json, url } = await generateGptImage({ prompt: prompt.prompt, size: '1536x1024' });
      if (url) {
        file_url = url;
      } else if (b64_json) {
        const file = b64ToFile(b64_json, `slide-${slide_number}.png`);
        const up: any = await base44.asServiceRole.integrations.Core.UploadFile({ file });
        file_url = up?.file_url || '';
      }
      if (!file_url) generation_status = 'failed';
    } catch {
      generation_status = 'failed';
    }

    const validation_status = generation_status === 'complete' ? 'valid' : 'invalid';
    const existing = (await base44.entities.GeneratedVisualAsset.filter({ report_id, slide_number }))[0];

    let asset;
    if (existing) {
      asset = await base44.entities.GeneratedVisualAsset.update(existing.id, {
        generated_asset_url: file_url,
        generation_prompt: prompt.prompt,
        generation_status,
        validation_status,
      });
    } else {
      asset = await base44.entities.GeneratedVisualAsset.create({
        report_id,
        slide_number,
        title: prompt.slide_title,
        source_brief: {},
        generation_prompt: prompt.prompt,
        provider: 'openai_gpt_image_2',
        generated_asset_url: file_url,
        generation_status,
        validation_status,
      });
    }

    return Response.json({ asset });
  } catch (error) {
    return Response.json({ error: error.message || 'Single slide render failed' }, { status: 500 });
  }
}