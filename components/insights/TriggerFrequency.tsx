'use client';

import { memo } from 'react';
import type { TriggerFrequency } from '@/types';

interface TriggerFrequencyProps {
  triggers: TriggerFrequency[];
}

export const TriggerFrequencyList = memo(function TriggerFrequencyList({
  triggers,
}: TriggerFrequencyProps) {
  if (triggers.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center">
        <p className="text-slate-400 text-sm">
          Triggers will appear here once you&apos;ve submitted a few journal entries.
        </p>
      </div>
    );
  }

  const max = triggers[0]?.count ?? 1;

  return (
    <ul className="space-y-2.5" aria-label="Recurring stress triggers by frequency">
      {triggers.map(({ trigger, count }) => {
        const pct = Math.round((count / max) * 100);
        return (
          <li key={trigger} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700 capitalize font-medium">{trigger}</span>
              <span className="text-xs text-slate-500 font-medium">
                {count} {count === 1 ? 'time' : 'times'}
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${trigger}: ${count} occurrences`}
            >
              <div
                className="h-full rounded-full bg-indigo-400 group-hover:bg-indigo-500 transition-colors"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
});
