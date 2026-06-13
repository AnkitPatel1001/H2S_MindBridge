'use client';

import { useState, useEffect, useCallback, FormEvent, useId } from 'react';
import { Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MoodSelector } from './MoodSelector';
import { TagSelector } from './TagSelector';
import { useJournal } from '@/hooks/useJournal';
import { useDebounce } from '@/hooks/useDebounce';
import { draftStorage } from '@/lib/storage';
import { detectCrisisLanguage } from '@/lib/crisisDetector';
import { MAX_JOURNAL_LENGTH } from '@/lib/sanitize';
import type { AIAnalysis, MoodLevel, QuickTag, UserProfile } from '@/types';

interface JournalFormProps {
  profile: UserProfile;
  onAnalysisComplete: (analysis: AIAnalysis, wasCrisis: boolean) => void;
  onSubmitStart?: () => void;
}

interface FormErrors {
  text?: string;
  mood?: string;
}

export function JournalForm({ profile, onAnalysisComplete, onSubmitStart }: JournalFormProps) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [tags, setTags] = useState<QuickTag[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [autosaved, setAutosaved] = useState(false);

  const { submitEntry, isSubmitting, submitError } = useJournal();
  const debouncedText = useDebounce(text, 600);

  const textErrorId = useId();
  const moodErrorId = useId();
  const charCount = text.length;
  const charRemaining = MAX_JOURNAL_LENGTH - charCount;

  // Load draft on mount
  useEffect(() => {
    const saved = draftStorage.get();
    if (saved) setText(saved);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (debouncedText) {
      draftStorage.set(debouncedText);
      setAutosaved(true);
      const t = setTimeout(() => setAutosaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [debouncedText]);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!text.trim()) next.text = 'Please share how you are feeling.';
    if (text.length > MAX_JOURNAL_LENGTH)
      next.text = `Entry must be under ${MAX_JOURNAL_LENGTH} characters.`;
    if (!mood) next.mood = 'Please select your current mood.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [text, mood]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !mood) return;

    onSubmitStart?.();
    const crisisDetected = detectCrisisLanguage(text);
    const analysis = await submitEntry(text, mood, tags, {
      exam: profile.exam,
      targetDate: profile.targetDate,
    });

    if (analysis) {
      const isCrisis = crisisDetected || analysis.riskLevel === 'high';
      onAnalysisComplete(analysis, isCrisis);
      setText('');
      setMood(null);
      setTags([]);
      setErrors({});
      document.getElementById('reflection-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card
      aria-labelledby="journal-heading"
      className="animate-fade-in motion-reduce:animate-none"
    >
      <h2 id="journal-heading" className="text-xl font-bold text-slate-800 mb-1">
        How are you feeling today?
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Share freely — your thoughts are private and stay on your device.
      </p>

      <form onSubmit={handleSubmit} aria-label="Daily journal entry" noValidate className="space-y-5">
        {/* Journal text */}
        <div>
          <label htmlFor="journal-text" className="block text-sm font-medium text-slate-700 mb-1.5">
            What&apos;s on your mind?{' '}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="journal-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errors.text) setErrors((prev) => ({ ...prev, text: undefined }));
            }}
            placeholder="Write about your study session, how you're feeling about the exam, anything weighing on you…"
            rows={6}
            maxLength={MAX_JOURNAL_LENGTH}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.text}
            aria-describedby={errors.text ? textErrorId : undefined}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition"
          />
          <div className="flex items-center justify-between mt-1">
            {errors.text ? (
              <p id={textErrorId} role="alert" className="text-xs text-red-600">
                {errors.text}
              </p>
            ) : (
              <span
                className="text-xs text-slate-400 flex items-center gap-1"
                aria-live="polite"
                aria-atomic="true"
              >
                {autosaved && (
                  <>
                    <Save className="h-3 w-3" aria-hidden="true" /> Saved
                  </>
                )}
              </span>
            )}
            <span
              className={`text-xs ${charRemaining < 100 ? 'text-amber-600' : 'text-slate-400'}`}
              aria-live="polite"
            >
              {charRemaining} characters remaining
            </span>
          </div>
        </div>

        {/* Mood */}
        <MoodSelector
          value={mood}
          onChange={setMood}
          disabled={isSubmitting}
          errorId={errors.mood ? moodErrorId : undefined}
        />
        {errors.mood && (
          <p id={moodErrorId} role="alert" className="text-xs text-red-600 -mt-3">
            {errors.mood}
          </p>
        )}

        {/* Tags */}
        <TagSelector selected={tags} onChange={setTags} disabled={isSubmitting} />

        {/* Server error */}
        {submitError && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Send className="h-4 w-4" />}
          size="lg"
          className="w-full"
        >
          Get My Reflection
        </Button>
      </form>
    </Card>
  );
}
