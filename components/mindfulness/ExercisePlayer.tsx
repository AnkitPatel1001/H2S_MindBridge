'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { MindfulnessExerciseTemplate } from '@/types';

interface ExercisePlayerProps {
  exercise: MindfulnessExerciseTemplate;
  onClose: () => void;
}

export function ExercisePlayer({ exercise, onClose }: ExercisePlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const totalSeconds = exercise.durationMin * 60;

  // Focus trap
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

  // Timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s >= totalSeconds - 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current ?? undefined);
            return totalSeconds;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current ?? undefined);
    }
    return () => clearInterval(intervalRef.current ?? undefined);
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
      aria-labelledby="player-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up motion-reduce:animate-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">{exercise.icon} {exercise.category}</p>
              <h2 id="player-title" className="text-xl font-bold">
                {exercise.title}
              </h2>
              <p className="text-indigo-200 text-sm mt-1">{exercise.durationMin} minutes</p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close exercise player"
              className="rounded-xl p-2 text-indigo-200 hover:text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Timer */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-indigo-200">
                {elapsed >= totalSeconds ? 'Complete!' : `${minsLeft}:${String(secsLeft).padStart(2, '0')} remaining`}
              </span>
              <span className="text-sm text-indigo-200">{progressPct}%</span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-indigo-500/50 overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Exercise progress"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step list */}
        <div className="p-6">
          <ol className="space-y-3 mb-6" aria-label="Exercise steps">
            {exercise.steps.map((step, i) => (
              <li
                key={i}
                className={cn(
                  'flex gap-3 text-sm transition-all duration-300',
                  i === currentStep
                    ? 'text-indigo-700 font-medium'
                    : i < currentStep
                      ? 'text-slate-400 line-through'
                      : 'text-slate-500',
                )}
                aria-current={i === currentStep ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5',
                    i === currentStep
                      ? 'bg-indigo-600 text-white'
                      : i < currentStep
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-slate-100 text-slate-400',
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning((v) => !v)}
              variant={isRunning ? 'secondary' : 'primary'}
              className="flex-1"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              disabled={elapsed >= totalSeconds}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {elapsed === 0 ? 'Start' : 'Resume'}
                </>
              )}
            </Button>
            {currentStep < exercise.steps.length - 1 && (
              <Button
                onClick={nextStep}
                variant="secondary"
                aria-label="Next step"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
