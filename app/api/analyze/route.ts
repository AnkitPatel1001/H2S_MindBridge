import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { journalSubmitSchema } from '@/types/schemas';
import { parseAIResponse } from '@/lib/aiResponseParser';
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

Respond with ONLY a valid JSON object and absolutely nothing else — no prose, no markdown fences, no explanation:
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
- detectedStressTriggers: 1–5 items; identify SPECIFIC stressors mentioned or implied (e.g. "mock test performance anxiety", not "stress")
- riskLevel: "low" = mild everyday stress; "moderate" = significant distress but coping; "high" = crisis signs, self-harm ideation, hopelessness — use "high" sparingly and only when clearly indicated
- copingStrategies: exactly 3; specific and immediately actionable for a student; tie to their exam context
- mindfulnessExercise: 4–7 clear step-by-step instructions; tailor to current emotional state
- encouragement: genuine, warm, never toxic positivity; acknowledge difficulty while uplifting`;
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId, 20, 60_000)) {
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

Please analyse this entry and respond with the JSON object as instructed.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: buildSystemPrompt(examContext.exam, examContext.targetDate),
      messages: [{ role: 'user', content: userContent }],
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response from AI. Please try again.' },
        { status: 502 },
      );
    }

    const analysis = parseAIResponse(firstBlock.text);

    // Server-side crisis override: if crisis language detected and AI didn't flag it, upgrade risk
    if (detectCrisisLanguage(text) && analysis.riskLevel === 'low') {
      analysis.riskLevel = 'moderate';
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err) {
    console.error('[/api/analyze] AI call failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Analysis temporarily unavailable. Please try again in a moment.' },
      { status: 503 },
    );
  }
}
