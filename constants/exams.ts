import type { ExamOption, MoodLevel } from '@/types';

export const EXAM_OPTIONS: ExamOption[] = [
  { value: 'NEET', label: 'NEET', description: 'Medical Entrance Examination' },
  { value: 'JEE', label: 'JEE', description: 'Joint Entrance Examination (Mains & Advanced)' },
  { value: 'CUET', label: 'CUET', description: 'Common University Entrance Test' },
  { value: 'CAT', label: 'CAT', description: 'Common Admission Test (MBA)' },
  { value: 'GATE', label: 'GATE', description: 'Graduate Aptitude Test in Engineering' },
  { value: 'UPSC', label: 'UPSC', description: 'Civil Services Examination' },
  { value: 'Other', label: 'Other', description: 'Other Competitive Examination' },
];

export interface MoodOption {
  value: MoodLevel;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    emoji: '😔',
    label: 'Very Low',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
  },
  {
    value: 2,
    emoji: '😕',
    label: 'Low',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
  {
    value: 3,
    emoji: '😐',
    label: 'Neutral',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
  },
  {
    value: 4,
    emoji: '🙂',
    label: 'Good',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
  },
  {
    value: 5,
    emoji: '😊',
    label: 'Very High',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-400',
  },
];

export const QUICK_TAGS = [
  'Sleep',
  'Study Pressure',
  'Family',
  'Health',
  'Confidence',
] as const;

export const MOOD_CHART_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#6366f1',
};
