import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/40 backdrop-blur-sm mt-auto py-4 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" aria-hidden="true" />
        <p>
          <strong className="text-slate-600">MindBridge</strong> is a supportive companion, not a
          substitute for professional mental health care. Your journal data stays on your device
          only — nothing is stored on our servers.
        </p>
      </div>
    </footer>
  );
}
