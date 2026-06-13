import { aiAnalysisSchema } from '@/types/schemas';
import type { AIAnalysis } from '@/types';

/** Safe fallback returned when the AI response cannot be parsed or validated. */
export const FALLBACK_ANALYSIS: AIAnalysis = {
  detectedStressTriggers: ['Exam pressure', 'Study workload'],
  emotionalPattern: 'Unable to determine your emotional pattern at this moment.',
  riskLevel: 'low',
  copingStrategies: [
    'Take a 5-minute break: step outside or look out a window to reset your mind.',
    'Break your study plan into 25-minute focused sessions followed by short breaks.',
    'Reach out to a friend, family member, or counsellor to share how you are feeling.',
  ],
  mindfulnessExercise: {
    title: 'Box Breathing',
    steps: [
      'Sit comfortably and exhale fully.',
      'Inhale slowly through your nose for 4 counts.',
      'Hold your breath for 4 counts.',
      'Exhale slowly through your mouth for 4 counts.',
      'Hold for 4 counts. Repeat 4 times.',
    ],
    durationMin: 4,
  },
  encouragement:
    'Every single day you show up to prepare, you are proving your dedication. You are stronger than you think, and your effort is never wasted.',
};

/**
 * Parses and validates the raw text returned by the AI into an AIAnalysis object.
 * Handles JSON wrapped in markdown code fences gracefully.
 * Falls back to a safe default on any parse or validation failure.
 */
export function parseAIResponse(raw: string): AIAnalysis {
  let cleaned = raw.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
  }

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    const result = aiAnalysisSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    console.error('[AIParser] Schema validation failed:', result.error.issues);
    return FALLBACK_ANALYSIS;
  } catch (err) {
    console.error('[AIParser] JSON parse failed:', err instanceof Error ? err.message : err);
    return FALLBACK_ANALYSIS;
  }
}
