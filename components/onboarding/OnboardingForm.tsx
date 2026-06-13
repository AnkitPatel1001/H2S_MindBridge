'use client';

import { useState, FormEvent, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ShieldCheck, Calendar, GraduationCap, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { profileStorage } from '@/lib/storage';
import { sanitizeName } from '@/lib/sanitize';
import { EXAM_OPTIONS } from '@/constants/exams';
import type { ExamType, UserProfile } from '@/types';

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [exam, setExam] = useState<ExamType | ''>('');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'name' | 'exam' | 'targetDate', string>>>({});

  const nameId = useId();
  const examId = useId();
  const dateId = useId();
  const nameErrorId = useId();
  const examErrorId = useId();
  const dateErrorId = useId();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!exam) next.exam = 'Please select your exam.';
    if (!targetDate) next.targetDate = 'Please select your exam target date.';
    else if (new Date(targetDate) <= new Date()) next.targetDate = 'Please select a future date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !exam) return;

    const profile: UserProfile = {
      name: sanitizeName(name),
      exam,
      targetDate,
      createdAt: new Date().toISOString(),
    };

    profileStorage.set(profile);
    router.push('/journal');
  };

  return (
    <div className="min-h-screen bg-mindbridge flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4" aria-hidden="true">
            <Brain className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">MindBridge</h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Your mental wellness companion for the exam journey
          </p>
        </div>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Let&apos;s get started</h2>
          <p className="text-sm text-slate-500 mb-6">
            Tell us a little about yourself so we can personalise your experience.
          </p>

          <form onSubmit={handleSubmit} aria-label="Onboarding form" noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor={nameId} className="block text-sm font-medium text-slate-700 mb-1.5">
                <User className="inline h-3.5 w-3.5 mr-1 text-slate-400" aria-hidden="true" />
                Your name
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Priya"
                maxLength={100}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? nameErrorId : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {errors.name && (
                <p id={nameErrorId} role="alert" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Exam */}
            <div>
              <label htmlFor={examId} className="block text-sm font-medium text-slate-700 mb-1.5">
                <GraduationCap className="inline h-3.5 w-3.5 mr-1 text-slate-400" aria-hidden="true" />
                Which exam are you preparing for?
              </label>
              <select
                id={examId}
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value as ExamType);
                  if (errors.exam) setErrors((p) => ({ ...p, exam: undefined }));
                }}
                aria-required="true"
                aria-invalid={!!errors.exam}
                aria-describedby={errors.exam ? examErrorId : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="" disabled>
                  Select your exam…
                </option>
                {EXAM_OPTIONS.map(({ value, label, description }) => (
                  <option key={value} value={value}>
                    {label} — {description}
                  </option>
                ))}
              </select>
              {errors.exam && (
                <p id={examErrorId} role="alert" className="mt-1 text-xs text-red-600">
                  {errors.exam}
                </p>
              )}
            </div>

            {/* Target date */}
            <div>
              <label htmlFor={dateId} className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1 text-slate-400" aria-hidden="true" />
                When is your exam? (approximate)
              </label>
              <input
                id={dateId}
                type="date"
                value={targetDate}
                min={minDateStr}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  if (errors.targetDate) setErrors((p) => ({ ...p, targetDate: undefined }));
                }}
                aria-required="true"
                aria-invalid={!!errors.targetDate}
                aria-describedby={errors.targetDate ? dateErrorId : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {errors.targetDate && (
                <p id={dateErrorId} role="alert" className="mt-1 text-xs text-red-600">
                  {errors.targetDate}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full">
              Start My Journey
            </Button>
          </form>
        </Card>

        {/* Privacy note */}
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 text-center px-2">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Your data stays on your device. Nothing is stored on any server.
          </p>
        </div>
      </div>
    </div>
  );
}
