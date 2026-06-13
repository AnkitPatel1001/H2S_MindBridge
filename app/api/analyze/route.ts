import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { journalSubmitSchema } from '@/types/schemas';
import { parseAIResponse } from '@/lib/aiResponseParser';
import { checkRateLimit } from '@/lib/rateLimiter';
import { detectCrisisLanguage } from '@/lib/crisisDetector';
import { getClientId } from '@/lib/apiUtils';

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_TOKENS = 1200;
const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

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

function buildSystemPrompt(exam: string, targetDate: string): string {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000),
  );

  return `You are MindBridge's wellness analysis engine — empathetic, insightful, and trauma-informed.

Context:
- Student is preparing for: ${exam}
- Exam date: ${targetDate} (${daysLeft} days away)

Your role is to analyse the student's journal entry and provide supportive, personalised insights.

CRITICAL RULES:
1. You are NOT a doctor or therapist. Never diagnose. Never claim to replace professional care.
2. For ANY sign of serious distress, emphasise reaching out to a trusted person or mental health helpline.
3. Be warm, validating, and non-judgmental. Avoid clinical language.
4. Keep insights specific to exam-preparation context — not generic.

You MUST respond with ONLY a valid JSON object — no prose, no markdown fences, no explanation:
{
  "detectedStressTriggers": ["specific trigger from text", "another specific trigger"],
  "emotionalPattern": "one clear sentence describing the pattern across this entry and mood history",
  "riskLevel": "low",
  "copingStrategies": ["specific actionable strategy 1", "strategy 2", "strategy 3"],
  "mindfulnessExercise": {
    "title": "Exercise Name",
    "steps": ["Step 1 instruction", "Step 2", "Step 3", "Step 4", "Step 5"],
    "durationMin": 5
  },
  "encouragement": "2-3 warm sentences specific to their exam journey"
}

Field guidelines:
- detectedStressTriggers: 1–5 items; identify SPECIFIC stressors mentioned or implied
- riskLevel: "low" = mild everyday stress; "moderate" = significant distress; "high" = crisis signs only
- copingStrategies: exactly 3; specific and immediately actionable for a student
- mindfulnessExercise: 4–7 clear step-by-step instructions tailored to current emotional state
- encouragement: genuine, warm, 2–3 sentences; acknowledge difficulty while uplifting`;
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = journalSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input. Please check your entry and try again.' },
      { status: 422 },
    );
  }

  const { text, mood, tags, examContext, recentMoods } = parsed.data;

  const userContent = `Journal entry:
"${text}"

Current mood: ${mood}/5
Quick tags selected: ${tags.length > 0 ? tags.join(', ') : 'none'}
Recent mood history (newest first, 1=Very Low, 5=Very High): [${recentMoods.join(', ')}]

Analyse this entry and respond with the JSON object as instructed.`;

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: buildSystemPrompt(examContext.exam, examContext.targetDate) },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const analysis = parseAIResponse(raw);

    // Upgrade risk level when crisis language is present but model returned low
    if (detectCrisisLanguage(text) && analysis.riskLevel === 'low') {
      analysis.riskLevel = 'moderate';
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/analyze] Error:', message);

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
    if (message.includes('model') || message.includes('404')) {
      return NextResponse.json(
        { error: 'AI model unavailable. Check GROQ_MODEL in .env.local.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Analysis temporarily unavailable. Please try again in a moment.' },
      { status: 503 },
    );
  }
}
