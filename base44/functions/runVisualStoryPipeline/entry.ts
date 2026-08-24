import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Orchestrator — runs the full 5-stage visual-story pipeline for a report:
//   analyze → select → briefs → prompts → render
// Each stage is its own backend function; this one calls them in order and
// surfaces per-stage results. Use after the final report is generated.
// Input:  { report_id }
// Output: { ok, steps }
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return Response.json({ error: 'report_id required' }, { status: 400 });

    const steps: any = {};

    const a = await base44.functions.invoke('analyzeReportForVisualStory', { report_id });
    steps.analyze = a?.data;
    const s = await base44.functions.invoke('selectVisualStories', { report_id });
    steps.select = s?.data;
    const b = await base44.functions.invoke('generateSlideBriefs', { report_id });
    steps.briefs = b?.data;
    const p = await base44.functions.invoke('generateImagePrompts', { report_id });
    steps.prompts = p?.data;
    const r = await base44.functions.invoke('renderVisualSlides', { report_id });
    steps.render = r?.data;

    return Response.json({ ok: true, steps });
  } catch (error) {
    return Response.json({ error: error.message || 'Pipeline failed' }, { status: 500 });
  }
}