import { describe, it, expect } from 'vitest';
import { detectCrisisLanguage } from '@/lib/crisisDetector';

describe('detectCrisisLanguage', () => {
  const crisisTexts = [
    'I want to kill myself',
    'I am thinking of suicide',
    'I want to end my life',
    "I don't want to live anymore",
    'I feel like self-harm is the only option',
    'I want to hurt myself',
    'everyone would be better off without me',
    'I cannot go on like this',
    "There's no reason to live",
    'I am suicidal',
  ];

  crisisTexts.forEach((text) => {
    it(`detects crisis in: "${text.slice(0, 40)}…"`, () => {
      expect(detectCrisisLanguage(text)).toBe(true);
    });
  });

  const safeTexts = [
    'I am feeling stressed about my exam.',
    'I failed my mock test today and I am sad.',
    'My parents are pressuring me a lot.',
    'I am very tired from studying.',
    "I don't think I will clear the exam.",
    'Today was difficult but I will try again.',
  ];

  safeTexts.forEach((text) => {
    it(`does NOT flag as crisis: "${text.slice(0, 40)}…"`, () => {
      expect(detectCrisisLanguage(text)).toBe(false);
    });
  });

  it('is case-insensitive', () => {
    expect(detectCrisisLanguage('I WANT TO KILL MYSELF')).toBe(true);
    expect(detectCrisisLanguage('Thinking about SUICIDE')).toBe(true);
  });
});
