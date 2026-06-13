'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to your error reporting service in production
    console.error('[ErrorBoundary]', error.message);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      role="alert"
      aria-labelledby="error-heading"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mx-auto"
          aria-hidden="true"
        >
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 id="error-heading" className="text-xl font-bold text-slate-800">
          Something went wrong
        </h1>
        <p className="text-slate-500 text-sm">
          An unexpected error occurred. Your journal data is safe — it&apos;s stored locally on
          your device.
        </p>
        <Button onClick={reset} className="mx-auto">
          Try again
        </Button>
      </div>
    </div>
  );
}
