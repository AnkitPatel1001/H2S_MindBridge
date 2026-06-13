'use client';

import { useEffect, useRef } from 'react';
import { Trash2, Brain } from 'lucide-react';
import { ChatMessageItem } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import type { UserProfile, JournalEntry } from '@/types';

interface ChatInterfaceProps {
  profile: UserProfile;
  latestEntry?: JournalEntry;
}

function TypingIndicator() {
  return (
    <li className="flex gap-3 max-w-[80%] mr-auto" aria-label="MindBridge is typing">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-1" aria-hidden="true">
        <Brain className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white/80 border border-slate-100 px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </li>
  );
}

export function ChatInterface({ profile, latestEntry }: ChatInterfaceProps) {
  const { messages, sendMessage, isLoading, chatError, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (content: string) => {
    void sendMessage(
      content,
      { exam: profile.exam, targetDate: profile.targetDate },
      latestEntry?.mood,
    );
  };

  return (
    <div className="flex flex-col h-full" aria-label="Chat with MindBridge">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center" aria-hidden="true">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">MindBridge</p>
            <p className="text-xs text-green-500 font-medium">Here for you</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            aria-label="Clear chat history"
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center" aria-hidden="true">
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold">Hi, I&apos;m MindBridge</p>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Your empathetic companion for your {profile.exam} journey. Share anything —
                I&apos;m here to listen and support you.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "I'm feeling overwhelmed with syllabus",
                "How do I manage exam anxiety?",
                "I failed a mock test today",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4" role="list">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </ul>
        )}

        {chatError && (
          <p role="alert" className="text-xs text-red-600 text-center mt-3 bg-red-50 rounded-xl px-4 py-2">
            {chatError}
          </p>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
