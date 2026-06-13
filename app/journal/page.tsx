'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { JournalForm } from '@/components/journal/JournalForm';
import { JournalHistory } from '@/components/journal/JournalHistory';
import { ReflectionPanel } from '@/components/reflection/ReflectionPanel';
import { ReflectionSkeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { profileStorage, entriesStorage } from '@/lib/storage';
import { daysUntil } from '@/lib/utils';
import type { AIAnalysis, UserProfile, JournalEntry } from '@/types';
import { Calendar, Target } from 'lucide-react';

export default function JournalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const p = profileStorage.get();
    if (!p) {
      router.replace('/onboarding');
      return;
    }
    setProfile(p);
    setEntries(entriesStorage.getAll());
  }, [router]);

  const handleAnalysisStart = () => {
    setIsSubmitting(true);
    setAnalysis(null);
  };

  const handleAnalysisComplete = (result: AIAnalysis, wasCrisis: boolean) => {
    setIsSubmitting(false);
    setAnalysis(result);
    setShowSafety(wasCrisis || result.riskLevel === 'high');
    setEntries(entriesStorage.getAll());
  };

  if (!profile) return null;

  const days = daysUntil(profile.targetDate);

  return (
    <div className="flex min-h-screen">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 py-6 md:px-8 pb-24 md:pb-8" id="main-content">
          {/* Greeting header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Hello, {profile.name} 👋
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Target className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                {profile.exam} Aspirant
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                {days > 0 ? `${days} days to go` : 'Exam day!'}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            {/* Left: Journal form + history */}
            <div className="space-y-6">
              <JournalFormWrapper
                profile={profile}
                onStart={handleAnalysisStart}
                onComplete={(result, crisis) => {
                  handleAnalysisComplete(result, crisis);
                }}
              />
              <JournalHistory entries={entries} />
            </div>

            {/* Right: AI reflection */}
            <div>
              {isSubmitting ? (
                <Card padding="md">
                  <ReflectionSkeleton />
                </Card>
              ) : analysis ? (
                <ReflectionPanel analysis={analysis} showSafetyBanner={showSafety} />
              ) : (
                <div className="hidden lg:flex rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center min-h-[300px] text-center p-8">
                  <div>
                    <p className="text-2xl mb-3" aria-hidden="true">✍️</p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Write your first journal entry and click{' '}
                      <strong>Get My Reflection</strong> to receive personalised AI insights.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

// Wrapper to intercept submission start
function JournalFormWrapper({
  profile,
  onStart,
  onComplete,
}: {
  profile: UserProfile;
  onStart: () => void;
  onComplete: (analysis: AIAnalysis, crisis: boolean) => void;
}) {
  return (
    <JournalForm
      profile={profile}
      onSubmitStart={onStart}
      onAnalysisComplete={onComplete}
    />
  );
}
