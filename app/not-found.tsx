import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      aria-labelledby="notfound-heading"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mx-auto"
          aria-hidden="true"
        >
          <Brain className="h-7 w-7" />
        </div>
        <h1 id="notfound-heading" className="text-xl font-bold text-slate-800">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm">
          This page doesn&apos;t exist. Head back to your journal.
        </p>
        <Link href="/journal">
          <Button className="mx-auto">Go to Journal</Button>
        </Link>
      </div>
    </div>
  );
}
