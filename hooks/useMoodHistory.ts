'use client';

import { useMemo } from 'react';
import type { JournalEntry, MoodDataPoint, TriggerFrequency, WeeklySummary } from '@/types';
import {
  buildMoodDataPoints,
  computeTriggerFrequency,
  buildWeeklySummary,
} from '@/lib/aggregations';

/**
 * Derives memoized mood trend data, trigger frequencies, and a weekly
 * summary from the provided journal entries.
 */
export function useMoodHistory(entries: JournalEntry[]) {
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
