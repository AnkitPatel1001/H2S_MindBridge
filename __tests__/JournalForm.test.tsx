import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalForm } from '@/components/journal/JournalForm';
import type { UserProfile } from '@/types';

// Mock the hooks that hit external storage/network
vi.mock('@/hooks/useJournal', () => ({
  useJournal: () => ({
    entries: [],
    isSubmitting: false,
    submitError: null,
    submitEntry: vi.fn().mockResolvedValue({
      detectedStressTriggers: ['exam pressure'],
      emotionalPattern: 'mild anxiety',
      riskLevel: 'low',
      copingStrategies: ['strategy 1', 'strategy 2', 'strategy 3'],
      mindfulnessExercise: { title: 'Box Breathing', steps: ['step1'], durationMin: 5 },
      encouragement: 'You are doing great!',
    }),
  }),
}));

vi.mock('@/lib/storage', () => ({
  draftStorage: {
    get: () => '',
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

const mockProfile: UserProfile = {
  name: 'Priya',
  exam: 'NEET',
  targetDate: '2025-05-04',
  createdAt: new Date().toISOString(),
};

describe('JournalForm', () => {
  const onAnalysisComplete = vi.fn();

  beforeEach(() => {
    onAnalysisComplete.mockClear();
  });

  it('renders the journal textarea', () => {
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);
    expect(screen.getByRole('textbox', { name: /what's on your mind/i })).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);
    expect(screen.getByRole('button', { name: /get my reflection/i })).toBeInTheDocument();
  });

  it('shows a validation error when submitting without text', async () => {
    const user = userEvent.setup();
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);

    await user.click(screen.getByRole('button', { name: /get my reflection/i }));

    // Multiple alerts may appear (text + mood) — check for the text one specifically
    expect(await screen.findByText(/please share how you are feeling/i)).toBeInTheDocument();
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows a mood validation error when no mood selected', async () => {
    const user = userEvent.setup();
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);

    await user.type(
      screen.getByRole('textbox', { name: /what's on your mind/i }),
      'I feel stressed about tomorrow',
    );
    await user.click(screen.getByRole('button', { name: /get my reflection/i }));

    expect(await screen.findByText(/please select your current mood/i)).toBeInTheDocument();
  });

  it('shows a character remaining counter', async () => {
    const user = userEvent.setup();
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);

    await user.type(
      screen.getByRole('textbox', { name: /what's on your mind/i }),
      'Hello',
    );

    expect(screen.getByText(/4995 characters remaining/i)).toBeInTheDocument();
  });

  it('submits successfully with text and mood selected', async () => {
    const user = userEvent.setup();
    render(<JournalForm profile={mockProfile} onAnalysisComplete={onAnalysisComplete} />);

    await user.type(
      screen.getByRole('textbox', { name: /what's on your mind/i }),
      'I am feeling quite anxious about my NEET preparation today.',
    );

    // Select "Good" mood
    await user.click(screen.getByRole('radio', { name: /good/i }));

    await user.click(screen.getByRole('button', { name: /get my reflection/i }));

    await waitFor(() => {
      expect(onAnalysisComplete).toHaveBeenCalledTimes(1);
    });
  });
});
