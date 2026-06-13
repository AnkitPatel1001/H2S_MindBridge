'use client';

import { useMemo } from 'react';
import type { JournalEntry, MoodDataPoint, TriggerFrequency, WeeklySummary } from '@/types';
import {
  buildMoodDataPoints,
  computeTriggerFrequency,
  buildWeeklySummary,
} from '@/lib/aggregations';

/**
 * Derives memoised mood trend data, trigger frequencies, and a weekly
 * summary from the provided journal entries. All values are recomputed
 * only when `entries` reference changes.
 */
export function useMoodHistory(entries: JournalEntry[]): {
  moodDataPoints: MoodDataPoint[];
  triggerFrequency: TriggerFrequency[];
  weeklySummary: WeeklySummary;
} {
  const moodDataPoints = useMemo<MoodDataPoint[]>(
    () => buildMoodDataPoints(entries),
    [entries],
  );

  const triggerFrequency = useMemo<TriggerFrequency[]>(
    () => computeTriggerFrequency(entries),
    [entries],
  );

  const weeklySummary = useMemo<WeeklySummary>(
    () => buildWeeklySummary(entries),
    [entries],
  );

  return { moodDataPoints, triggerFrequency, weeklySummary };
}
