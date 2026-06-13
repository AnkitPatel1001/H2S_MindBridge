import { describe, it, expect } from 'vitest';
import { parseAIResponse, FALLBACK_ANALYSIS } from '@/lib/aiResponseParser';

const VALID_RESPONSE = JSON.stringify({
  detectedStressTriggers: ['mock test pressure', 'sleep deprivation'],
  emotionalPattern: 'Student is showing signs of accumulating exam anxiety.',
  riskLevel: 'moderate',
  copingStrategies: [
    'Take a 10-minute walk after each mock test.',
    'Use the Pomodoro technique for study sessions.',
    'Call a friend or family member this evening.',
  ],
  mindfulnessExercise: {
    title: 'Box Breathing',
    steps: ['Inhale 4', 'Hold 4', 'Exhale 4', 'Hold 4', 'Repeat'],
    durationMin: 5,
  },
  encouragement: 'You are doing great. Every practice session counts.',
});

describe('parseAIResponse', () => {
  it('parses a valid JSON string', () => {
    const result = parseAIResponse(VALID_RESPONSE);
    expect(result.riskLevel).toBe('moderate');
    expect(result.detectedStressTriggers).toHaveLength(2);
    expect(result.copingStrategies).toHaveLength(3);
    expect(result.mindfulnessExercise.durationMin).toBe(5);
  });

  it('strips markdown code fences before parsing', () => {
    const withFences = '```json\n' + VALID_RESPONSE + '\n```';
    const result = parseAIResponse(withFences);
    expect(result.riskLevel).toBe('moderate');
  });

  it('strips bare code fences before parsing', () => {
    const withFences = '```\n' + VALID_RESPONSE + '\n```';
    const result = parseAIResponse(withFences);
    expect(result.encouragement).toBeTruthy();
  });

  it('returns fallback on invalid JSON', () => {
    const result = parseAIResponse('not json at all');
    expect(result).toEqual(FALLBACK_ANALYSIS);
  });

  it('returns fallback when schema is wrong', () => {
    const bad = JSON.stringify({ riskLevel: 'unknown', foo: 'bar' });
    const result = parseAIResponse(bad);
    expect(result).toEqual(FALLBACK_ANALYSIS);
  });

  it('returns fallback on empty string', () => {
    const result = parseAIResponse('');
    expect(result).toEqual(FALLBACK_ANALYSIS);
  });

  it('validates riskLevel enum strictly', () => {
    const invalid = JSON.parse(VALID_RESPONSE) as Record<string, unknown>;
    invalid.riskLevel = 'critical'; // not a valid enum value
    const result = parseAIResponse(JSON.stringify(invalid));
    expect(result).toEqual(FALLBACK_ANALYSIS);
  });
});
