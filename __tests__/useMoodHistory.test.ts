import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import type { JournalEntry, MoodLevel } from '@/types';

function makeEntry(id: string, mood: MoodLevel, daysAgo = 0): JournalEntry {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id, text: 'test', mood, tags: [], timestamp: d.toISOString() };
}

describe('useMoodHistory', () => {
  it('returns empty arrays and zero summary for no entries', () => {
    const { result } = renderHook(() => useMoodHistory([]));
    expect(result.current.moodDataPoints).toHaveLength(0);
    expect(result.current.triggerFrequency).toHaveLength(0);
    expect(result.current.weeklySummary.averageMood).toBe(0);
    expect(result.current.weeklySummary.entryCount).toBe(0);
    expect(result.current.weeklySummary.journalingStreak).toBe(0);
    expect(result.current.weeklySummary.topTrigger).toBeNull();
  });

  it('builds mood data points sorted by date', () => {
    const entries = [makeEntry('b', 4, 1), makeEntry('a', 2, 2)];
    const { result } = renderHook(() => useMoodHistory(entries));
    const points = result.current.moodDataPoints;
    expect(points).toHaveLength(2);
    expect(points[0].mood).toBe(2);
    expect(points[1].mood).toBe(4);
  });

  it('computes correct average mood', () => {
    const entries = [makeEntry('a', 2), makeEntry('b', 4)];
    const { result } = renderHook(() => useMoodHistory(entries));
    expect(result.current.weeklySummary.averageMood).toBe(3);
  });

  it('extracts trigger frequency from analyses', () => {
    const entries: JournalEntry[] = [
      {
        ...makeEntry('a', 3),
        analysis: {
          detectedStressTriggers: ['mock test', 'sleep'],
          emotionalPattern: '',
          riskLevel: 'low',
          copingStrategies: [],
          mindfulnessExercise: { title: '', steps: [], durationMin: 5 },
          encouragement: '',
        },
      },
      {
        ...makeEntry('b', 4),
        analysis: {
          detectedStressTriggers: ['mock test'],
          emotionalPattern: '',
          riskLevel: 'low',
          copingStrategies: [],
          mindfulnessExercise: { title: '', steps: [], durationMin: 5 },
          encouragement: '',
        },
      },
    ];
    const { result } = renderHook(() => useMoodHistory(entries));
    expect(result.current.triggerFrequency[0].trigger).toBe('mock test');
    expect(result.current.triggerFrequency[0].count).toBe(2);
  });

  it('returns 0 streak when entries list is empty', () => {
    const { result } = renderHook(() => useMoodHistory([]));
    expect(result.current.weeklySummary.journalingStreak).toBe(0);
  });
});
