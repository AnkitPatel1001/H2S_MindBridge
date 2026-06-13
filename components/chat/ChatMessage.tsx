import { memo } from 'react';
import { Brain, User } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessageItem = memo(function ChatMessageItem({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <li
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse',
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1',
          isAssistant ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600',
        )}
        aria-hidden="true"
      >
        {isAssistant ? (
          <Brain className="h-4 w-4" aria-hidden="true" />
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
      </div>

      <div>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isAssistant
              ? 'bg-white/80 border border-slate-100 text-slate-700 rounded-tl-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm',
          )}
        >
          {message.content}
        </div>
        <time
          dateTime={message.timestamp}
          className={cn(
            'block text-xs text-slate-400 mt-1',
            isAssistant ? 'text-left' : 'text-right',
          )}
        >
          {formatTimestamp(message.timestamp)}
        </time>
      </div>
    </li>
  );
});
