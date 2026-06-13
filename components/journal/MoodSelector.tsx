'use client';

import { MOOD_OPTIONS } from '@/constants/exams';
import { cn } from '@/lib/utils';
import type { MoodLevel } from '@/types';

interface MoodSelectorProps {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
  disabled?: boolean;
  errorId?: string;
}

export function MoodSelector({ value, onChange, disabled, errorId }: MoodSelectorProps) {
  return (
    <fieldset aria-describedby={errorId}>
      <legend className="text-sm font-medium text-slate-700 mb-3">
        How is your mood today?{' '}
        <span className="text-red-500" aria-hidden="true">
          *
        </span>
      </legend>

      <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Mood level">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer',
                'transition-all duration-150 motion-reduce:transition-none',
                'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2',
                isSelected
                  ? `${option.borderColor} ${option.bgColor} ${option.color}`
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
            >
              <input
                type="radio"
                name="mood"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
                aria-label={option.label}
              />
              <span
                className="text-2xl leading-none"
                role="img"
                aria-hidden="true"
              >
                {option.emoji}
              </span>
              <span className="text-xs font-medium whitespace-nowrap">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
