'use client';

import { memo, useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Tag } from 'lucide-react';
import { MOOD_OPTIONS } from '@/constants/exams';
import { formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@/types';

interface JournalHistoryProps {
  entries: JournalEntry[];
}

const EntryItem = memo(function EntryItem({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);
  const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);

  return (
    <li className="border border-slate-100 rounded-xl bg-white/70 hover:bg-white/90 transition-colors">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded-xl"
        aria-expanded={expanded}
        aria-controls={`entry-body-${entry.id}`}
      >
        <span
          className="text-2xl leading-none flex-shrink-0"
          role="img"
          aria-label={moodOption?.label ?? 'mood'}
        >
          {moodOption?.emoji}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">
            {entry.text.slice(0, 80)}
            {entry.text.length > 80 ? '…' : ''}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {formatTimestamp(entry.timestamp)}
            </span>
            {entry.tags.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Tag className="h-3 w-3" aria-hidden="true" />
                {entry.tags.join(', ')}
              </span>
            )}
          </div>
        </div>

        {entry.analysis && (
          <span
            className={cn(
              'flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
              entry.analysis.riskLevel === 'high'
                ? 'bg-red-100 text-red-700'
                : entry.analysis.riskLevel === 'moderate'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700',
            )}
          >
            {entry.analysis.riskLevel}
          </span>
        )}

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div
          id={`entry-body-${entry.id}`}
          className="px-4 pb-4 pt-0 border-t border-slate-100 mt-0"
        >
          <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
            {entry.text}
          </p>

          {entry.analysis && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-indigo-600 mb-1">AI Reflection:</p>
              <p className="text-xs text-slate-600 italic">{entry.analysis.encouragement}</p>
              {entry.analysis.detectedStressTriggers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.analysis.detectedStressTriggers.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
});

export function JournalHistory({ entries }: JournalHistoryProps) {
  if (entries.length === 0) {
    return (
      <section aria-label="Past journal entries">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Past Entries</h2>
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-400 text-sm">
            Your entries will appear here. Start journaling above!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Past journal entries">
      <h2 className="text-lg font-semibold text-slate-700 mb-3">
        Past Entries{' '}
        <span className="text-slate-400 text-sm font-normal">({entries.length})</span>
      </h2>
      <ul className="space-y-2" aria-label="Journal entry list">
        {entries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
