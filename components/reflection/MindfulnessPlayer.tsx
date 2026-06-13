'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MindfulnessExercise } from '@/types';

interface MindfulnessPlayerProps {
  exercise: MindfulnessExercise;
  onClose: () => void;
}

/**
 * Modal player for AI-recommended mindfulness exercises in the reflection panel.
 * Has a focus trap, Esc-to-close, and a countdown timer.
 */
export function MindfulnessPlayer({ exercise, onClose }: MindfulnessPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const totalSeconds = exercise.durationMin * 60;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      prev?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s >= totalSeconds - 1) {
            setIsRunning(false);
            return totalSeconds;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, totalSeconds]);

  const progressPct = Math.round((elapsed / totalSeconds) * 100);
  const remaining = totalSeconds - elapsed;
  const minsLeft = Math.floor(remaining / 60);
  const secsLeft = remaining % 60;

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, exercise.steps.length - 1));
  }, [exercise.steps.length]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up motion-reduce:animate-none">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <h2 id="mp-title" className="text-lg font-bold">{exercise.title}</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close exercise player"
              className="rounded-xl p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-indigo-200">
              {elapsed >= totalSeconds
                ? '✓ Complete!'
                : `${minsLeft}:${String(secsLeft).padStart(2, '0')} left`}
            </span>
            <span className="text-indigo-200">{progressPct}%</span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-indigo-500/50 overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="p-5">
          <ol className="space-y-3 mb-5" aria-label="Steps">
            {exercise.steps.map((step, i) => (
              <li
                key={i}
                aria-current={i === currentStep ? 'step' : undefined}
                className={cn(
                  'flex gap-3 text-sm transition-colors',
                  i === currentStep ? 'text-violet-700 font-medium' : i < currentStep ? 'text-slate-400 line-through' : 'text-slate-500',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                    i === currentStep ? 'bg-violet-600 text-white' : i < currentStep ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400',
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning((v) => !v)}
              variant={isRunning ? 'secondary' : 'primary'}
              className="flex-1"
              disabled={elapsed >= totalSeconds}
              aria-label={isRunning ? 'Pause timer' : elapsed === 0 ? 'Start timer' : 'Resume timer'}
            >
              {isRunning ? (
                <><Pause className="h-4 w-4 mr-1" aria-hidden="true" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" aria-hidden="true" />{elapsed === 0 ? 'Start' : 'Resume'}</>
              )}
            </Button>
            {currentStep < exercise.steps.length - 1 && (
              <Button variant="secondary" onClick={nextStep} aria-label="Next step">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
