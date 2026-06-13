import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { chatSubmitSchema } from '@/types/schemas';
import { checkRateLimit } from '@/lib/rateLimiter';
import { detectCrisisLanguage } from '@/lib/crisisDetector';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getClientId(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function buildChatSystemPrompt(
  exam: string,
  targetDate: string,
  currentMood?: number,
): string {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000),
  );

  const moodContext = currentMood
    ? `Current mood level: ${currentMood}/5 (${['Very Low', 'Low', 'Neutral', 'Good', 'Very High'][currentMood - 1]}).`
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
- Occasionally bring in exam-relevant context (study strategies, time management)
- Use simple, warm language — not clinical or formal

CRITICAL BOUNDARIES:
1. You are NOT a therapist or doctor. Never diagnose, prescribe, or give medical advice.
2. You are NOT a replacement for professional mental health support.
3. If the student expresses suicidal thoughts, self-harm, or serious crisis:
   - Respond with deep empathy and validation
   - STRONGLY encourage contacting a trusted adult and/or a helpline
   - Mention: Tele-MANAS (14416 / 1-800-891-4416, free, 24/7) or iCall (9152987821)
   - Do not minimise, dismiss, or pivot away from the crisis
4. Keep responses concise — 2–4 paragraphs maximum. Students are busy.
5. End with one gentle, open-ended question when appropriate.

You genuinely care about this student's well-being and believe in their ability to navigate this challenging time.`;
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId, 20, 60_000)) {
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

  // Build message array for the API
  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  // If crisis language detected, add a context note for the AI
  const crisisNote = detectCrisisLanguage(message)
    ? '\n\n[SYSTEM NOTE: Crisis language has been detected in this message. Prioritise empathy and safety resources.]'
    : '';

  if (crisisNote) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg) {
      (lastMsg as { role: 'user' | 'assistant'; content: string }).content += crisisNote;
    }
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: buildChatSystemPrompt(examContext.exam, examContext.targetDate, currentMood),
      messages,
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected AI response. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: firstBlock.text }, { status: 200 });
  } catch (err) {
    console.error('[/api/chat] AI call failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Chat temporarily unavailable. Please try again in a moment.' },
      { status: 503 },
    );
  }
}
