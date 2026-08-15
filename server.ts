import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import apiMiddleware from './src/server-api';

const THERAPIST_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

function buildTherapistContents(messages: any[]) {
  const raw = (Array.isArray(messages) ? messages : [])
    .map((m: any) => ({
      role: m?.role === 'model' || m?.role === 'assistant' ? 'model' : 'user',
      text: typeof m?.content === 'string' ? m.content.trim() : '',
    }))
    .filter((m: any) => m.text.length > 0);

  const contents: any[] = [];
  for (const item of raw) {
    if (contents.length === 0) {
      if (item.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: item.text }] });
      }
      continue;
    }

    const last = contents[contents.length - 1];
    if (last.role === item.role) {
      last.parts[0].text += `\n\n${item.text}`;
    } else {
      contents.push({ role: item.role, parts: [{ text: item.text }] });
    }
  }

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  // Gemini rejects a conversation ending with a model turn when there is no new user turn.
  if (contents[contents.length - 1]?.role === 'model') {
    contents.push({ role: 'user', parts: [{ text: 'Please continue the conversation naturally.' }] });
  }

  return contents;
}

async function handleTherapist(req: express.Request, res: express.Response) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'Therapist is not configured: GEMINI_API_KEY is missing in the production environment.',
      isError: true,
    });
  }

  try {
    const { messages = [], mood = 'Neutral' } = req.body ?? {};
    const contents = buildTherapistContents(messages);
    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are "Therapist", an empathetic, warm, supportive, and active-listening AI wellness companion inside the LifeHub dashboard.
The user is currently checked in with a mood of "${String(mood)}".

Guidelines:
- Respond to the user's actual message, not a generic template.
- Actively listen and reflect specific details the user shared.
- Help with stress, anxiety, burnout, loneliness, procrastination, academic pressure, and everyday personal goals.
- For very short messages such as ".", acknowledge them gently and ask what is on their mind.
- For greetings, respond naturally and invite the user to share how they are doing.
- Keep multi-turn context in mind.
- Do not claim to be a licensed therapist or replace professional care.
- For any immediate safety crisis, encourage the user to contact a trusted adult or appropriate emergency support in their area.`;

    let lastError: unknown = null;
    for (const model of THERAPIST_MODELS) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens: 800,
          },
        });

        const text = response?.text?.trim();
        if (text) {
          return res.status(200).json({ response: text });
        }

        throw new Error(`Gemini returned an empty response from ${model}`);
      } catch (error) {
        lastError = error;
        console.error(`[Therapist] ${model} failed; trying fallback.`, error);
      }
    }

    console.error('[Therapist] all Gemini models failed', lastError);
    return res.status(502).json({
      error: 'The therapist could not generate a response right now. Please try again.',
      isError: true,
    });
  } catch (error: any) {
    console.error('[Therapist] request failed', error);
    return res.status(500).json({
      error: 'Therapist request failed. Please try again.',
      isError: true,
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Setup body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Dedicated therapist route FIRST so it bypasses the legacy model list.
  app.post('/api/chat', handleTherapist);

  // All remaining API routes keep using the existing middleware.
  app.use('/api', apiMiddleware);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
