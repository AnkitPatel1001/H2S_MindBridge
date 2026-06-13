'use client';

import { memo } from 'react';
import { Flame, BarChart2, Target, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MOOD_OPTIONS } from '@/constants/exams';
import type { WeeklySummary } from '@/types';

interface WeeklySummaryProps {
  summary: WeeklySummary;
}

export const WeeklySummaryCard = memo(function WeeklySummaryCard({
  summary,
}: WeeklySummaryProps) {
  const moodOption = MOOD_OPTIONS.find((m) => m.value === Math.round(summary.averageMood));

  const stats = [
    {
      icon: BarChart2,
      label: 'Avg Mood',
      value: summary.averageMood > 0
        ? `${moodOption?.emoji ?? ''} ${summary.averageMood.toFixed(1)}`
        : '—',
      detail: moodOption?.label ?? 'No data',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: summary.journalingStreak > 0 ? `${summary.journalingStreak}d` : '—',
      detail: summary.journalingStreak > 0 ? 'days in a row' : 'Start today!',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: BookOpen,
      label: 'Entries',
      value: String(summary.entryCount),
      detail: 'this week',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      icon: Target,
      label: 'Top Trigger',
      value: summary.topTrigger ? '!' : '—',
      detail: summary.topTrigger
        ? summary.topTrigger.charAt(0).toUpperCase() + summary.topTrigger.slice(1)
        : 'None yet',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section aria-label="Weekly summary">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, detail, color, bg }) => (
          <Card key={label} padding="sm" className="text-center">
            <div
              className={`inline-flex items-center justify-center rounded-xl p-2 ${bg} mb-2`}
              aria-hidden="true"
            >
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
            <p className="text-xs text-slate-400">{detail}</p>
          </Card>
        ))}
      </div>
    </section>
  );
});
