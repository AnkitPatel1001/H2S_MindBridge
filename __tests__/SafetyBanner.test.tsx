import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SafetyBanner } from '@/components/ui/SafetyBanner';

describe('SafetyBanner', () => {
  it('renders with the correct ARIA role', () => {
    render(<SafetyBanner />);
    expect(screen.getByRole('complementary', { name: /mental health support/i })).toBeInTheDocument();
  });

  it('displays the Tele-MANAS helpline', () => {
    render(<SafetyBanner />);
    expect(screen.getByText(/Tele-MANAS/i)).toBeInTheDocument();
    expect(screen.getByText(/14416/)).toBeInTheDocument();
  });

  it('displays the iCall helpline', () => {
    render(<SafetyBanner />);
    expect(screen.getByText(/iCall/i)).toBeInTheDocument();
  });

  it('renders helpline links with tel: hrefs', () => {
    render(<SafetyBanner />);
    const links = screen.getAllByRole('link');
    const telLinks = links.filter((l) => l.getAttribute('href')?.startsWith('tel:'));
    expect(telLinks.length).toBeGreaterThan(0);
  });

  it('can be dismissed via the close button', async () => {
    const user = userEvent.setup();
    render(<SafetyBanner />);

    const closeBtn = screen.getByRole('button', { name: /dismiss/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('close button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<SafetyBanner />);

    const closeBtn = screen.getByRole('button', { name: /dismiss/i });
    closeBtn.focus();
    await user.keyboard('{Enter}');

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('shows a supportive message', () => {
    render(<SafetyBanner />);
    expect(screen.getByText(/you don't have to face this alone/i)).toBeInTheDocument();
  });
});
