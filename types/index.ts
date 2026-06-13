export type ExamType = 'NEET' | 'JEE' | 'CUET' | 'CAT' | 'GATE' | 'UPSC' | 'Other';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type QuickTag = 'Sleep' | 'Study Pressure' | 'Family' | 'Health' | 'Confidence';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface UserProfile {
  name: string;
  exam: ExamType;
  targetDate: string;
  createdAt: string;
}

export interface MindfulnessExercise {
  title: string;
  steps: string[];
  durationMin: number;
}

export interface AIAnalysis {
  detectedStressTriggers: string[];
  emotionalPattern: string;
  riskLevel: RiskLevel;
  copingStrategies: string[];
  mindfulnessExercise: MindfulnessExercise;
  encouragement: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  mood: MoodLevel;
  tags: QuickTag[];
  timestamp: string;
  analysis?: AIAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MoodDataPoint {
  date: string;
  mood: number;
  label: string;
}

export interface TriggerFrequency {
  trigger: string;
  count: number;
}

export interface WeeklySummary {
  averageMood: number;
  journalingStreak: number;
  topTrigger: string | null;
  entryCount: number;
}

export interface MindfulnessExerciseTemplate {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'grounding' | 'body' | 'cognitive';
  durationMin: number;
  steps: string[];
  bestFor: string[];
  icon: string;
}

export interface ExamOption {
  value: ExamType;
  label: string;
  description: string;
}

export interface Helpline {
  name: string;
  number: string;
  alt?: string;
  description: string;
  available: string;
}
