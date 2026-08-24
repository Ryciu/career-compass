import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getClient, model } from "../../shared/openai.ts";

// Receives { audio_url } (a public file_url from UploadFile).
// Transcribes via OpenAI gpt-transcribe. Never loses the answer — returns a clear error on failure.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const audioUrl = body?.audio_url;
    if (!audioUrl) return Response.json({ error: 'audio_url is required' }, { status: 400 });

    const client = getClient();
    // Fetch the audio bytes from the uploaded file URL
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return Response.json({ error: 'Could not fetch audio file' }, { status: 502 });
    }
    const audioBlob = await audioRes.blob();
    const file = new File([audioBlob], "recording.webm", { type: audioBlob.type || "audio/webm" });

    const transcription = await client.audio.transcriptions.create({
      model: model("transcription"),
      file,
    });

    return Response.json({ transcript: transcription.text || "" });
  } catch (error) {
    return Response.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  }
}