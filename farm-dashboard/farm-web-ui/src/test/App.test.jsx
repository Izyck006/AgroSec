import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders Login by default when not authenticated', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('does not render Dashboard when not authenticated', () => {
    render(<App />);
    expect(screen.queryByText('Hey, Welcome Farmer!')).not.toBeInTheDocument();
  });

  it('switches to Dashboard after successful login', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Mock fetch for Dashboard alerts
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<App />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Hey, Welcome Farmer!')).toBeInTheDocument();
    });

    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
