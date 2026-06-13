'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { WeeklySummaryCard } from '@/components/insights/WeeklySummary';
import { TriggerFrequencyList } from '@/components/insights/TriggerFrequency';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { useJournal } from '@/hooks/useJournal';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { profileStorage } from '@/lib/storage';
import type { UserProfile } from '@/types';
import { BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

// Lazy-load the chart to keep initial bundle small
const MoodChart = dynamic(
  () => import('@/components/insights/MoodChart').then((m) => ({ default: m.MoodChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

export default function InsightsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { entries } = useJournal();
  const { moodDataPoints, triggerFrequency, weeklySummary } = useMoodHistory(entries);

  useEffect(() => {
    const p = profileStorage.get();
    if (!p) {
      router.replace('/onboarding');
      return;
    }
    setProfile(p);
  }, [router]);

  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 py-6 md:px-8 pb-24 md:pb-8">
          <header className="mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Your wellness patterns for {profile.exam} preparation
            </p>
          </header>

          <div className="max-w-4xl space-y-6">
            {/* Weekly summary */}
            <section aria-labelledby="weekly-heading">
              <h2 id="weekly-heading" className="text-lg font-semibold text-slate-700 mb-3">
                This Week
              </h2>
              <WeeklySummaryCard summary={weeklySummary} />
            </section>

            {/* Mood trend */}
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-700">Mood Trend</h2>
                <span className="text-xs text-slate-400 ml-auto">Last 30 entries</span>
              </div>
              <Suspense fallback={<ChartSkeleton />}>
                <MoodChart data={moodDataPoints} />
              </Suspense>
            </Card>

            {/* Stress triggers */}
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-700">Recurring Stress Triggers</h2>
              </div>
              <TriggerFrequencyList triggers={triggerFrequency} />
            </Card>

            {entries.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                <p className="text-slate-400 text-sm">
                  Start journaling to see your insights here. Even one entry makes a difference!
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
