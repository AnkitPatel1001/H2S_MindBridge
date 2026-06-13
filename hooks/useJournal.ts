'use client';

import { useState, useEffect, useCallback } from 'react';
import { entriesStorage, draftStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { JournalEntry, AIAnalysis, MoodLevel, QuickTag } from '@/types';

/**
 * Manages journal entries: loading from storage, submitting to the AI analysis
 * endpoint, and persisting results. Does NOT handle debouncing — callers
 * should manage their own draft text with useDebounce.
 */
export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(entriesStorage.getAll());
  }, []);

  const reloadEntries = useCallback(() => {
    setEntries(entriesStorage.getAll());
  }, []);

  /**
   * Submits a journal entry to /api/analyze, stores the result,
   * and returns the AI analysis (or null on failure).
   */
  const submitEntry = useCallback(
    async (
      text: string,
      mood: MoodLevel,
      tags: QuickTag[],
      examContext: { exam: string; targetDate: string },
    ): Promise<AIAnalysis | null> => {
      setIsSubmitting(true);
      setSubmitError(null);

      const recentMoods = entries.slice(0, 7).map((e) => e.mood);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, mood, tags, examContext, recentMoods }),
        });

        const data = (await res.json()) as { analysis?: AIAnalysis; error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'Analysis failed. Please try again.');
        }

        const newEntry: JournalEntry = {
          id: generateId(),
          text,
          mood,
          tags,
          timestamp: new Date().toISOString(),
          analysis: data.analysis,
        };

        entriesStorage.addOrUpdate(newEntry);
        draftStorage.clear();
        setEntries(entriesStorage.getAll());

        return data.analysis ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setSubmitError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entries],
  );

  return { entries, reloadEntries, submitEntry, isSubmitting, submitError };
}
