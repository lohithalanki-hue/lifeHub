import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

const SYSTEM_INSTRUCTION = `You are Therapist, a warm and supportive wellness companion inside LifeHub.\n\nRespond naturally to the user's message and remember the conversation context provided. Help with everyday stress, anxiety, procrastination, loneliness, academic pressure, motivation, and personal goals. Do not claim to be a human therapist or doctor. Do not diagnose. For serious or urgent safety concerns, encourage the user to contact a trusted person and appropriate local emergency or crisis services.`;

function normalizeMessages(body: any) {
  if (Array.isArray(body?.messages)) {
    return body.messages
      .map((m: any) => ({
        role: m?.role === 'assistant' || m?.role === 'model' ? 'model' : 'user',
        text: typeof m?.content === 'string' ? m.content.trim() : '',
      }))
      .filter((m: any) => m.text);
  }

  if (Array.isArray(body?.contents)) {
    return body.contents.flatMap((c: any) => {
      const role = c?.role === 'model' ? 'model' : 'user';
      const parts = Array.isArray(c?.parts) ? c.parts : [];
      return parts
        .map((p: any) => ({ role, text: typeof p?.text === 'string' ? p.text.trim() : '' }))
        .filter((p: any) => p.text);
    });
  }

  if (typeof body?.message === 'string' && body.message.trim()) {
    return [{ role: 'user', text: body.message.trim() }];
  }

  return [];
}

function toGeminiContents(messages: Array<{ role: 'user' | 'model'; text: string }>) {
  const contents: any[] = [];
  for (const message of messages) {
    if (contents.length === 0 && message.role !== 'user') continue;
    const last = contents[contents.length - 1];
    if (last && last.role === message.role) {
      last.parts[0].text += `\n\n${message.text}`;
    } else {
      contents.push({ role: message.role, parts: [{ text: message.text }] });
    }
  }
  return contents.length ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is missing from the Vercel Production environment.',
      isError: true,
    });
  }

  try {
    const body = req.body ?? {};
    const messages = normalizeMessages(body);
    const contents = toGeminiContents(messages);
    const ai = new GoogleGenAI({ apiKey });
    let lastError: any = null;

    for (const model of MODELS) {
      try {
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 800,
        };

        // Gemini 3 models use the model's defaults for thinking/sampling.
        if (!model.startsWith('gemini-3.')) config.temperature = 0.7;

        const result = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        const text = typeof result?.text === 'string' ? result.text.trim() : '';
        if (text) {
          return res.status(200).json({
            response: text,
            text,
            message: text,
          });
        }

        lastError = new Error(`No text returned by ${model}`);
      } catch (error: any) {
        lastError = error;
        console.warn(`Gemini model ${model} failed; trying fallback`, error?.message || error);
      }
    }

    console.error('All therapist Gemini models failed:', lastError?.message || lastError);
    return res.status(502).json({
      error: 'Therapist generation failed after trying all configured Gemini models.',
      isError: true,
    });
  } catch (error: any) {
    console.error('Therapist API error:', error);
    return res.status(500).json({
      error: 'Therapist service failed unexpectedly.',
      isError: true,
    });
  }
}
