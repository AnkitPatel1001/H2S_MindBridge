'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { MOOD_OPTIONS } from '@/constants/exams';
import type { MoodDataPoint } from '@/types';

interface MoodChartProps {
  data: MoodDataPoint[];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const moodOption = MOOD_OPTIONS.find((m) => m.value === value);

  return (
    <div
      className="rounded-xl bg-white/95 border border-slate-100 shadow-lg px-3 py-2 text-sm"
      role="status"
    >
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-indigo-600">
        {moodOption?.emoji} {moodOption?.label ?? String(value)}
      </p>
    </div>
  );
}

const Y_TICKS = [1, 2, 3, 4, 5];
const Y_LABELS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export function MoodChart({ data }: MoodChartProps) {
  const trimmedData = useMemo(() => data.slice(-30), [data]);

  if (trimmedData.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 text-sm text-center px-4">
          Record at least 2 entries to see your mood trend.
        </p>
      </div>
    );
  }

  return (
    <div aria-label="Mood trend chart" role="img">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={trimmedData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={Y_TICKS}
            tickFormatter={(v: number) => Y_LABELS[v] ?? String(v)}
            tick={{ fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#4f46e5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
