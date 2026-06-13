import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  buildMoodDataPoints,
  computeAverageMood,
  computeJournalingStreak,
  computeTriggerFrequency,
  buildWeeklySummary,
} from '@/lib/aggregations';
import type { JournalEntry } from '@/types';

function makeEntry(
  id: string,
  mood: 1 | 2 | 3 | 4 | 5,
  daysAgo: number,
  triggers: string[] = [],
): JournalEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  return {
    id,
    text: 'test entry',
    mood,
    tags: [],
    timestamp: date.toISOString(),
    analysis: triggers.length > 0
      ? {
          detectedStressTriggers: triggers,
          emotionalPattern: '',
          riskLevel: 'low',
          copingStrategies: [],
          mindfulnessExercise: { title: '', steps: [], durationMin: 5 },
          encouragement: '',
        }
      : undefined,
  };
}

describe('computeAverageMood', () => {
  it('returns 0 for empty entries', () => {
    expect(computeAverageMood([])).toBe(0);
  });

  it('computes correct average', () => {
    const entries = [makeEntry('1', 2, 0), makeEntry('2', 4, 1), makeEntry('3', 3, 2)];
    expect(computeAverageMood(entries)).toBe(3.0);
  });

  it('rounds to 1 decimal', () => {
    const entries = [makeEntry('1', 1, 0), makeEntry('2', 2, 1)];
    expect(computeAverageMood(entries)).toBe(1.5);
  });
});

describe('computeJournalingStreak', () => {
  it('returns 0 for empty entries', () => {
    expect(computeJournalingStreak([])).toBe(0);
  });

  it('returns 1 for only today', () => {
    const entries = [makeEntry('1', 3, 0)];
    expect(computeJournalingStreak(entries)).toBe(1);
  });

  it('counts consecutive days correctly', () => {
    const entries = [
      makeEntry('1', 3, 0),
      makeEntry('2', 3, 1),
      makeEntry('3', 3, 2),
    ];
    expect(computeJournalingStreak(entries)).toBe(3);
  });

  it('stops streak at a gap', () => {
    const entries = [
      makeEntry('1', 3, 0),
      makeEntry('2', 3, 1),
      // gap on day 2
      makeEntry('3', 3, 3),
    ];
    expect(computeJournalingStreak(entries)).toBe(2);
  });

  it('returns 0 when last entry is 2+ days ago', () => {
    const entries = [makeEntry('1', 3, 3)];
    expect(computeJournalingStreak(entries)).toBe(0);
  });
});

describe('computeTriggerFrequency', () => {
  it('returns empty array for entries with no analysis', () => {
    const entries = [makeEntry('1', 3, 0)];
    expect(computeTriggerFrequency(entries)).toEqual([]);
  });

  it('counts and sorts triggers by frequency', () => {
    const entries = [
      makeEntry('1', 3, 0, ['exam pressure', 'sleep']),
      makeEntry('2', 3, 1, ['exam pressure', 'family']),
      makeEntry('3', 3, 2, ['exam pressure']),
    ];
    const result = computeTriggerFrequency(entries);
    expect(result[0]).toEqual({ trigger: 'exam pressure', count: 3 });
    expect(result).toHaveLength(3);
  });

  it('normalises trigger casing', () => {
    const entries = [
      makeEntry('1', 3, 0, ['Exam Pressure']),
      makeEntry('2', 3, 1, ['exam pressure']),
    ];
    const result = computeTriggerFrequency(entries);
    expect(result[0]).toEqual({ trigger: 'exam pressure', count: 2 });
  });
});

describe('buildWeeklySummary', () => {
  it('returns zeros for empty entries', () => {
    const summary = buildWeeklySummary([]);
    expect(summary.averageMood).toBe(0);
    expect(summary.journalingStreak).toBe(0);
    expect(summary.topTrigger).toBeNull();
    expect(summary.entryCount).toBe(0);
  });

  it('includes only entries from the last 7 days', () => {
    const entries = [
      makeEntry('1', 5, 0),
      makeEntry('2', 5, 6),
      makeEntry('3', 1, 8), // outside window
    ];
    const summary = buildWeeklySummary(entries);
    expect(summary.entryCount).toBe(2);
    expect(summary.averageMood).toBe(5);
  });
});

describe('buildMoodDataPoints', () => {
  it('sorts entries chronologically', () => {
    const entries = [makeEntry('1', 5, 0), makeEntry('2', 2, 3), makeEntry('3', 4, 1)];
    const points = buildMoodDataPoints(entries);
    expect(points[0]?.mood).toBe(2); // oldest first
    expect(points[2]?.mood).toBe(5); // newest last
  });
});
