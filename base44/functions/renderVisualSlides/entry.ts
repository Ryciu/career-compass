import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateGptImage, b64ToFile } from '../../shared/openaiImage.ts';

// Stage 5 — render each slide with OpenAI gpt-image-2 and store the asset URL.
// Input:  { report_id }
// Output: { assets, count } — persisted to GeneratedVisualAsset.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const prompts = await base44.entities.SlidePrompt.filter({ report_id });
    if (!prompts.length) return Response.json({ error: 'Run prompt stage first' }, { status: 400 });

    const prior = await base44.entities.GeneratedVisualAsset.filter({ report_id });
    for (const p of prior) await base44.entities.GeneratedVisualAsset.delete(p.id);

    const assets = [];
    for (const p of prompts) {
      let file_url = '';
      let status = 'complete';
      try {
        const { b64_json, url } = await generateGptImage({ prompt: p.prompt, size: '1536x1024' });
        if (url) {
          file_url = url;
        } else if (b64_json) {
          const file = b64ToFile(b64_json, `slide-${p.slide_number}.png`);
          const up: any = await base44.asServiceRole.integrations.Core.UploadFile({ file });
          file_url = up?.file_url || '';
        }
        if (!file_url) status = 'failed';
      } catch {
        status = 'failed';
      }
      const asset = await base44.entities.GeneratedVisualAsset.create({
        report_id,
        slide_number: p.slide_number,
        title: p.slide_title,
        source_brief: {},
        generation_prompt: p.prompt,
        provider: 'openai_gpt_image_2',
        generated_asset_url: file_url,
        generation_status: status,
        validation_status: status === 'complete' ? 'valid' : 'invalid',
      });
      assets.push(asset);
    }

    return Response.json({ assets, count: assets.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Render failed' }, { status: 500 });
  }
}