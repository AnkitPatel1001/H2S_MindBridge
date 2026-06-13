'use client';

import { PhoneCall, Heart, X } from 'lucide-react';
import { useState } from 'react';
import { HELPLINES, SAFETY_MESSAGE } from '@/constants/helplines';

export function SafetyBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      role="complementary"
      aria-label="Mental health support resources"
      className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 animate-fade-in motion-reduce:animate-none"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 rounded-full bg-red-100 p-2 text-red-600"
          aria-hidden="true"
        >
          <Heart className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="flex-1">
          <h2 className="text-base font-semibold text-red-800 mb-1">
            We&apos;re here for you
          </h2>
          <p className="text-sm text-red-700 mb-4">{SAFETY_MESSAGE}</p>

          <ul className="space-y-2" aria-label="Helpline numbers">
            {HELPLINES.map((line) => (
              <li key={line.name} className="flex items-start gap-2">
                <PhoneCall
                  className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <a
                    href={`tel:${line.number.replace(/\D/g, '')}`}
                    className="font-semibold text-red-800 underline underline-offset-2 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 rounded"
                    aria-label={`Call ${line.name} at ${line.number}`}
                  >
                    {line.name}: {line.number}
                    {line.alt && ` / ${line.alt}`}
                  </a>
                  <span className="text-red-600 text-xs ml-1">
                    — {line.description} ({line.available})
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-red-600 mt-3 italic">
            Reaching out is a sign of strength, not weakness. You matter.
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss safety banner"
          className="flex-shrink-0 rounded-lg p-1 text-red-400 hover:text-red-600 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
