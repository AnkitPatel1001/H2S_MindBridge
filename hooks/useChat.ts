'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { ChatMessage } from '@/types';

/**
 * Manages the chat conversation: loads history from localStorage,
 * sends messages to /api/chat, and persists responses.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(chatStorage.get());
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      examContext: { exam: string; targetDate: string },
      currentMood?: number,
    ): Promise<void> => {
      setChatError(null);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      const withUser = [...messages, userMsg];
      setMessages(withUser);
      chatStorage.save(withUser);
      setIsLoading(true);

      // Send only the last 10 turns to the API to limit token usage
      const historyForAPI = withUser
        .slice(-11, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: historyForAPI,
            examContext,
            currentMood,
          }),
        });

        const data = (await res.json()) as { reply?: string; error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'Could not get a response. Please try again.');
        }

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply ?? "I'm here for you. Please try sending your message again.",
          timestamp: new Date().toISOString(),
        };

        const final = [...withUser, assistantMsg];
        setMessages(final);
        chatStorage.save(final);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        setChatError(msg);
        // Revert to state before the failed request
        setMessages(withUser);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    chatStorage.clear();
  }, []);

  return { messages, sendMessage, isLoading, chatError, clearChat };
}
