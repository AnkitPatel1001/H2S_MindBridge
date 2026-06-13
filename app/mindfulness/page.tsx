'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import { profileStorage, entriesStorage } from '@/lib/storage';
import type { UserProfile } from '@/types';
import { Sparkles } from 'lucide-react';

// Lazy-load the library grid
const MindfulnessLibrary = dynamic(
  () =>
    import('@/components/mindfulness/MindfulnessLibrary').then((m) => ({
      default: m.MindfulnessLibrary,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    ),
    ssr: false,
  },
);

export default function MindfulnessPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendedId, setRecommendedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const p = profileStorage.get();
    if (!p) {
      router.replace('/onboarding');
      return;
    }
    setProfile(p);

    // Derive recommended exercise from latest AI analysis
    const entries = entriesStorage.getAll();
    const latest = entries[0];
    if (latest?.analysis) {
      const title = latest.analysis.mindfulnessExercise.title.toLowerCase();
      const TITLE_TO_ID: Record<string, string> = {
        'box breathing': 'box-breathing',
        '5-4-3-2-1 grounding': 'grounding-54321',
        'body scan': 'body-scan',
        '4-7-8 breathing': 'breathing-478',
        'stop technique': 'stop-technique',
        'loving-kindness': 'loving-kindness',
      };
      const matched = Object.entries(TITLE_TO_ID).find(([key]) => title.includes(key));
      if (matched) setRecommendedId(matched[1]);
    }
  }, [router]);

  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" className="flex-1 px-4 py-6 md:px-8 pb-24 md:pb-8">
          <header className="mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-slate-800">Mindfulness</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Short, science-backed exercises to reset your mind between study sessions
            </p>
          </header>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-2xl" />
                ))}
              </div>
            }
          >
            <MindfulnessLibrary recommendedId={recommendedId} />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  );
}
