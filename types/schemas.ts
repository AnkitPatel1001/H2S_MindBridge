import { z } from 'zod';

export const mindfulnessExerciseSchema = z.object({
  title: z.string().min(1).max(200),
  steps: z.array(z.string().min(1)).min(1).max(15),
  durationMin: z.number().positive().max(60),
});

export const aiAnalysisSchema = z.object({
  detectedStressTriggers: z.array(z.string().min(1).max(200)).max(10),
  emotionalPattern: z.string().min(1).max(1000),
  riskLevel: z.enum(['low', 'moderate', 'high']),
  copingStrategies: z.array(z.string().min(1).max(500)).min(1).max(5),
  mindfulnessExercise: mindfulnessExerciseSchema,
  encouragement: z.string().min(1).max(1000),
});

export const journalSubmitSchema = z.object({
  text: z
    .string()
    .min(1, 'Journal text is required')
    .max(5000, 'Journal text must be under 5000 characters')
    .transform((s) => s.trim()),
  mood: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(50)).max(10),
  examContext: z.object({
    exam: z.string().min(1).max(50),
    targetDate: z.string().min(1).max(30),
  }),
  recentMoods: z.array(z.number().int().min(1).max(5)).max(7),
});

export const chatSubmitSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be under 2000 characters')
    .transform((s) => s.trim()),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(20),
  examContext: z.object({
    exam: z.string().min(1).max(50),
    targetDate: z.string().min(1).max(30),
  }),
  currentMood: z.number().int().min(1).max(5).optional(),
});

export type JournalSubmitInput = z.infer<typeof journalSubmitSchema>;
export type ChatSubmitInput = z.infer<typeof chatSubmitSchema>;
export type AIAnalysisOutput = z.infer<typeof aiAnalysisSchema>;
