'use client';

import { QUICK_TAGS } from '@/constants/exams';
import { cn } from '@/lib/utils';
import type { QuickTag } from '@/types';

interface TagSelectorProps {
  selected: QuickTag[];
  onChange: (tags: QuickTag[]) => void;
  disabled?: boolean;
}

export function TagSelector({ selected, onChange, disabled }: TagSelectorProps) {
  const toggle = (tag: QuickTag) => {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag],
    );
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700 mb-2">
        Quick tags{' '}
        <span className="text-slate-400 font-normal text-xs">(optional)</span>
      </legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick tags">
        {QUICK_TAGS.map((tag) => {
          const active = selected.includes(tag);
          return (
            <label
              key={tag}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer',
                'border transition-all duration-150 motion-reduce:transition-none',
                'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1',
                active
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(tag)}
                disabled={disabled}
                className="sr-only"
                aria-label={tag}
              />
              {active && (
                <span aria-hidden="true" className="text-indigo-500">
                  ✓
                </span>
              )}
              {tag}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
