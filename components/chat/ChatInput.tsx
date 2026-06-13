'use client';

import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MAX_CHAT_LENGTH } from '@/lib/sanitize';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 items-end p-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm"
      aria-label="Send a message"
    >
      <label htmlFor="chat-input" className="sr-only">
        Type your message
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Share what's on your mind…"
        maxLength={MAX_CHAT_LENGTH}
        disabled={disabled}
        rows={1}
        aria-label="Message input"
        className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-h-40 disabled:opacity-50 transition"
      />
      <Button
        type="submit"
        disabled={!value.trim() || disabled}
        isLoading={disabled}
        aria-label="Send message"
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
