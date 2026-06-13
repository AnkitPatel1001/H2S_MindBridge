'use client';

import { useState, memo } from 'react';
import { Clock, Play, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExercisePlayer } from './ExercisePlayer';
import { MINDFULNESS_EXERCISES } from '@/constants/mindfulness';
import { cn } from '@/lib/utils';
import type { MindfulnessExerciseTemplate } from '@/types';

interface MindfulnessLibraryProps {
  recommendedId?: string;
}

const CATEGORY_LABELS: Record<MindfulnessExerciseTemplate['category'], string> = {
  breathing: 'Breathing',
  grounding: 'Grounding',
  body: 'Body',
  cognitive: 'Cognitive',
};

const CATEGORY_COLORS: Record<MindfulnessExerciseTemplate['category'], string> = {
  breathing: 'bg-sky-100 text-sky-700',
  grounding: 'bg-green-100 text-green-700',
  body: 'bg-violet-100 text-violet-700',
  cognitive: 'bg-amber-100 text-amber-700',
};

const ExerciseCard = memo(function ExerciseCard({
  exercise,
  isRecommended,
  onPlay,
}: {
  exercise: MindfulnessExerciseTemplate;
  isRecommended: boolean;
  onPlay: (e: MindfulnessExerciseTemplate) => void;
}) {
  return (
    <Card
      padding="md"
      className={cn(
        'flex flex-col gap-3 transition-all hover:shadow-glass-lg',
        isRecommended && 'ring-2 ring-indigo-300',
      )}
    >
      {isRecommended && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Recommended for you
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label={exercise.title}>
          {exercise.icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{exercise.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                CATEGORY_COLORS[exercise.category],
              )}
            >
              {CATEGORY_LABELS[exercise.category]}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {exercise.durationMin} min
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{exercise.description}</p>

      <div className="flex flex-wrap gap-1">
        {exercise.bestFor.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <Button
        onClick={() => onPlay(exercise)}
        size="sm"
        variant={isRecommended ? 'primary' : 'secondary'}
        leftIcon={<Play className="h-3.5 w-3.5" />}
        className="mt-auto"
        aria-label={`Start ${exercise.title}`}
      >
        Start Exercise
      </Button>
    </Card>
  );
});

export function MindfulnessLibrary({ recommendedId }: MindfulnessLibraryProps) {
  const [active, setActive] = useState<MindfulnessExerciseTemplate | null>(null);

  return (
    <>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-label="Mindfulness exercise library"
      >
        {MINDFULNESS_EXERCISES.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            isRecommended={ex.id === recommendedId}
            onPlay={setActive}
          />
        ))}
      </div>

      {active && <ExercisePlayer exercise={active} onClose={() => setActive(null)} />}
    </>
  );
}
