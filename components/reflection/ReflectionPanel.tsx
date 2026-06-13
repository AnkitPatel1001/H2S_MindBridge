'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Heart, Brain, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SafetyBanner } from '@/components/ui/SafetyBanner';
import { MindfulnessPlayer } from './MindfulnessPlayer';
import { cn } from '@/lib/utils';
import type { AIAnalysis } from '@/types';

interface ReflectionPanelProps {
  analysis: AIAnalysis;
  showSafetyBanner: boolean;
}

const RISK_STYLES = {
  low: {
    icon: TrendingUp,
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-200',
    label: 'Low Stress',
  },
  moderate: {
    icon: AlertTriangle,
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    label: 'Moderate Stress',
  },
  high: {
    icon: AlertTriangle,
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    label: 'High Stress',
  },
} as const;

export function ReflectionPanel({ analysis, showSafetyBanner }: ReflectionPanelProps) {
  const [showMindfulness, setShowMindfulness] = useState(false);
  const risk = RISK_STYLES[analysis.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <section
      id="reflection-panel"
      aria-label="Your AI reflection"
      aria-live="polite"
      className="space-y-4 animate-slide-up motion-reduce:animate-none"
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-800">Your Reflection</h2>
        <span
          className={cn('ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', risk.badge, risk.border)}
        >
          <RiskIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {risk.label}
        </span>
      </div>

      {showSafetyBanner && <SafetyBanner />}

      {/* Emotional pattern */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-indigo-100 p-2 text-indigo-600 flex-shrink-0" aria-hidden="true">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Emotional Pattern</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.emotionalPattern}</p>
          </div>
        </div>
      </Card>

      {/* Stress triggers */}
      {analysis.detectedStressTriggers.length > 0 && (
        <Card padding="md">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-amber-100 p-2 text-amber-600 flex-shrink-0" aria-hidden="true">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Detected Stress Triggers</h3>
              <ul className="flex flex-wrap gap-2" aria-label="Stress triggers">
                {analysis.detectedStressTriggers.map((trigger) => (
                  <li
                    key={trigger}
                    className="text-xs px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200"
                  >
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Coping strategies */}
      <Card padding="md">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-teal-100 p-2 text-teal-600 flex-shrink-0" aria-hidden="true">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Personalised Coping Strategies</h3>
            <ol className="space-y-2.5" aria-label="Coping strategies">
              {analysis.copingStrategies.map((strategy, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <span
                    className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mt-0.5"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  {strategy}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      {/* Mindfulness exercise — opens a full player modal */}
      <Card padding="md" className="cursor-pointer hover:ring-2 hover:ring-indigo-200 transition-all">
        <button
          onClick={() => setShowMindfulness(true)}
          className="w-full text-left"
          aria-haspopup="dialog"
          aria-label={`Start ${analysis.mindfulnessExercise.title} exercise`}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-100 p-2 text-violet-600 flex-shrink-0" aria-hidden="true">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-violet-600 font-medium mb-0.5">Recommended Exercise</p>
              <h3 className="text-sm font-semibold text-slate-700">
                {analysis.mindfulnessExercise.title}
              </h3>
              <p className="text-xs text-slate-400">
                {analysis.mindfulnessExercise.durationMin} minutes · guided with timer
              </p>
            </div>
            <span className="text-xs text-indigo-600 font-medium">Start →</span>
          </div>
        </button>
      </Card>

      {showMindfulness && (
        <MindfulnessPlayer
          exercise={analysis.mindfulnessExercise}
          onClose={() => setShowMindfulness(false)}
        />
      )}

      {/* Encouragement */}
      <Card
        padding="md"
        className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100"
      >
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-indigo-100 p-2 text-indigo-600 flex-shrink-0" aria-hidden="true">
            <Heart className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-indigo-800 mb-1">From MindBridge</h3>
            <p className="text-sm text-indigo-700 leading-relaxed italic">
              &ldquo;{analysis.encouragement}&rdquo;
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
