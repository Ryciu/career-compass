// Shared helper for image generation with OpenAI's gpt-image-2 model.
// Server-side only; relies on the OPENAI_API_KEY secret.

import OpenAI from 'npm:openai@4.55.0';
import { secrets } from 'base44:runtime';

interface GenArgs {
  prompt: string;
  size?: string; // gpt-image-2 accepts 1024x1024, 1536x1024, 1024x1536
}

export async function generateGptImage({ prompt, size = '1536x1024' }: GenArgs) {
  const openai = new OpenAI({ apiKey: secrets.get('OPENAI_API_KEY') });
  let res;
  try {
    res = await openai.images.generate({ model: 'gpt-image-2', prompt, size, n: 1 });
  } catch (e: any) {
    // Surface the real OpenAI error (e.g. credit_balance_exhausted) instead of a
    // generic "Render failed". Rethrow so callers can store/return the message.
    const msg = e?.error?.message || e?.message || 'Image generation failed';
    throw new Error(`gpt-image-2: ${msg}`);
  }
  const item = res?.data?.[0] || {};
  return { b64_json: item.b64_json, url: item.url };
}

// Decode a base64 PNG into a File ready for Base44's UploadFile integration.
export function b64ToFile(b64: string, name: string): File {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: 'image/png' });
}