'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart2, MessageCircle, Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/mindfulness', label: 'Mindfulness', icon: Sparkles },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex flex-col w-60 min-h-screen bg-white/80 backdrop-blur-md border-r border-white/60 shadow-glass px-4 py-6 gap-1"
      >
        <Link
          href="/journal"
          className="flex items-center gap-2 px-3 py-2 mb-6 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="MindBridge home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-300">
            <Brain className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold text-slate-800">MindBridge</span>
        </Link>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400')}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 safe-area-inset-bottom"
      >
        <ul className="flex" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-1 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                    active ? 'text-indigo-600' : 'text-slate-500',
                  )}
                >
                  <Icon
                    className={cn('h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400')}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
