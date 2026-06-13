'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { profileStorage, entriesStorage } from '@/lib/storage';
import type { UserProfile, JournalEntry } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestEntry, setLatestEntry] = useState<JournalEntry | undefined>(undefined);

  useEffect(() => {
    const p = profileStorage.get();
    if (!p) {
      router.replace('/onboarding');
      return;
    }
    setProfile(p);
    const entries = entriesStorage.getAll();
    setLatestEntry(entries[0]);
  }, [router]);

  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat takes full height — no footer padding needed */}
        <main
          className="flex-1 flex flex-col pb-16 md:pb-0"
          style={{ height: 'calc(100vh - 0px)' }}
          aria-label="Chat with MindBridge"
        >
          <div className="flex-1 flex flex-col overflow-hidden max-w-3xl w-full mx-auto md:my-4 md:rounded-2xl md:shadow-glass overflow-auto bg-white/50 backdrop-blur-sm">
            <ChatInterface profile={profile} latestEntry={latestEntry} />
          </div>
        </main>
      </div>
    </div>
  );
}
