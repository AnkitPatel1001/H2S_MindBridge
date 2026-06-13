import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoodSelector } from '@/components/journal/MoodSelector';

describe('MoodSelector', () => {
  it('renders all 5 mood options', () => {
    render(<MoodSelector value={null} onChange={() => undefined} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('renders within a fieldset with a legend', () => {
    render(<MoodSelector value={null} onChange={() => undefined} />);
    expect(screen.getByRole('group', { name: /mood/i })).toBeInTheDocument();
  });

  it('marks the selected option as checked', () => {
    render(<MoodSelector value={3} onChange={() => undefined} />);
    const neutralRadio = screen.getByRole('radio', { name: /neutral/i });
    expect(neutralRadio).toBeChecked();
  });

  it('calls onChange with the correct mood level when a user selects a mood', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MoodSelector value={null} onChange={onChange} />);

    const goodRadio = screen.getByRole('radio', { name: /good/i });
    await user.click(goodRadio);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('is keyboard accessible — user can tab to and select a mood', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MoodSelector value={null} onChange={onChange} />);

    const firstRadio = screen.getAllByRole('radio')[0];
    firstRadio?.focus();
    await user.keyboard(' '); // space selects
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables all radios when disabled prop is set', () => {
    render(<MoodSelector value={null} onChange={() => undefined} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it('has no unchecked radio when value is null', () => {
    render(<MoodSelector value={null} onChange={() => undefined} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).not.toBeChecked());
  });
});
