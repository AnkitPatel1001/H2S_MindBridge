'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileStorage } from '@/lib/storage';
import { Brain } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const profile = profileStorage.get();
    if (profile) {
      router.replace('/journal');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      aria-label="Loading MindBridge"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse-slow">
          <Brain className="h-9 w-9 text-white" aria-hidden="true" />
        </div>
        <p className="text-slate-500 text-sm">Loading MindBridge…</p>
      </div>
    </div>
  );
}
