import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Receives { audio_url } (a public file_url from UploadFile).
// Transcribes via Base44's built-in TranscribeAudio integration — no OpenAI key required.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const audioUrl = body?.audio_url;
    if (!audioUrl) return Response.json({ error: 'audio_url is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url: audioUrl });
    const transcript = typeof result === "string" ? result : (result?.text || result?.transcript || "");

    return Response.json({ transcript });
  } catch (error) {
    return Response.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  }
}