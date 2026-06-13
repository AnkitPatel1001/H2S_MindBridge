import type { JournalEntry, MoodDataPoint, TriggerFrequency, WeeklySummary } from '@/types';

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Very High'] as const;

/**
 * Converts journal entries into time-sorted chart data points.
 */
export function buildMoodDataPoints(entries: JournalEntry[]): MoodDataPoint[] {
  return entries
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((entry) => ({
      date: new Date(entry.timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      mood: entry.mood,
      label: MOOD_LABELS[entry.mood - 1],
    }));
}

/**
 * Computes the average mood across all provided entries, rounded to 1 decimal.
 * Returns 0 when the list is empty.
 */
export function computeAverageMood(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.mood, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

/**
 * Computes the current consecutive journaling streak in days.
 * A streak begins on today or yesterday and walks backward through entry dates.
 */
export function computeJournalingStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entryDateSet = new Set<number>(
    entries.map((e) => {
      const d = new Date(e.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  let cursor = new Date(today);

  // Streak must start today or yesterday
  if (!entryDateSet.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!entryDateSet.has(cursor.getTime())) return 0;
  }

  let streak = 0;
  while (entryDateSet.has(cursor.getTime())) {
    streak++;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Aggregates detected stress triggers from AI analyses into a frequency list,
 * normalised to lowercase, sorted by count descending, capped at 10.
 */
export function computeTriggerFrequency(entries: JournalEntry[]): TriggerFrequency[] {
  const freq = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.analysis) continue;
    for (const trigger of entry.analysis.detectedStressTriggers) {
      const key = trigger.toLowerCase().trim();
      if (key) freq.set(key, (freq.get(key) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Builds a summary of the last 7 days' activity.
 */
export function buildWeeklySummary(entries: JournalEntry[]): WeeklySummary {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);

  const weekEntries = entries.filter((e) => new Date(e.timestamp) >= cutoff);
  const triggers = computeTriggerFrequency(weekEntries);

  return {
    averageMood: computeAverageMood(weekEntries),
    journalingStreak: computeJournalingStreak(entries),
    topTrigger: triggers[0]?.trigger ?? null,
    entryCount: weekEntries.length,
  };
}
