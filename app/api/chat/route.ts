import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chatSubmitSchema } from '@/types/schemas';
import { checkRateLimit } from '@/lib/rateLimiter';
import { detectCrisisLanguage } from '@/lib/crisisDetector';
import { getClientId } from '@/lib/apiUtils';

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_TOKENS = 600;
const MODEL = process.env.GROQ_CHAT_MODEL ?? 'llama-3.1-8b-instant';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      throw new Error('GROQ_API_KEY is not configured in .env.local');
    }
    _client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
  }
  return _client;
}

function buildSystemPrompt(exam: string, targetDate: string, currentMood?: number): string {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000),
  );

  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Very High'] as const;
  const moodContext = currentMood
    ? `Current mood level: ${currentMood}/5 (${moodLabels[currentMood - 1]}).`
    : '';

  return `You are MindBridge — a warm, empathetic mental wellness companion for Indian students preparing for high-stakes exams.

Student context:
- Preparing for: ${exam}
- Exam date: ${targetDate} (${daysLeft} days away)
${moodContext}

Your personality:
- Deeply empathetic and validating — make the student feel truly heard
- Warm and supportive, like a caring senior who has been through exam stress
- Non-judgmental; never minimise their feelings
- Gently curious — ask follow-up questions to understand their experience better
- Grounded and practical — offer specific, actionable perspective when appropriate
- Use simple, warm language — not clinical or formal

CRITICAL BOUNDARIES:
1. You are NOT a therapist or doctor. Never diagnose, prescribe, or give medical advice.
2. You are NOT a replacement for professional mental health support.
3. If the student expresses suicidal thoughts, self-harm, or serious crisis:
   - Respond with deep empathy and validation
   - STRONGLY encourage contacting a trusted adult and/or a helpline
   - Mention: Tele-MANAS (14416 / 1-800-891-4416, free, 24/7) or iCall (9152987821)
4. Keep responses concise — 2–4 paragraphs maximum.
5. End with one gentle, open-ended question when appropriate.`;
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before continuing.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = chatSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid message. Please check your input and try again.' },
      { status: 422 },
    );
  }

  const { message, history, examContext, currentMood } = parsed.data;

  const userMessage = detectCrisisLanguage(message)
    ? message + '\n\n[SYSTEM NOTE: Crisis language detected — prioritise empathy and safety resources.]'
    : message;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(examContext.exam, examContext.targetDate, currentMood) },
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages,
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    if (!reply) {
      return NextResponse.json({ error: 'Empty response from AI. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/chat] Error:', message);

    if (process.env.NODE_ENV === 'development' && message.includes('GROQ_API_KEY')) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (
      message.includes('Incorrect API key') ||
      message.includes('401') ||
      message.includes('authentication') ||
      message.includes('invalid_api_key')
    ) {
      return NextResponse.json(
        { error: 'Groq authentication failed. Check your GROQ_API_KEY in .env.local.' },
        { status: 500 },
      );
    }
    if (message.includes('rate_limit') || message.includes('429')) {
      return NextResponse.json(
        { error: 'Too many requests to AI. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: 'Chat temporarily unavailable. Please try again in a moment.' },
      { status: 503 },
    );
  }
}
