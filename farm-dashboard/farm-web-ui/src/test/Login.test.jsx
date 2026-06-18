import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';

describe('Login', () => {
  it('renders username and password fields', () => {
    render(<Login onLoginSuccess={() => {}} />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('renders the Sign In button', () => {
    render(<Login onLoginSuccess={() => {}} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the AgroSec branding', () => {
    render(<Login onLoginSuccess={() => {}} />);
    expect(screen.getByText('Sec')).toBeInTheDocument();
  });

  it('shows error when username is empty on submit', async () => {
    const user = userEvent.setup();
    render(<Login onLoginSuccess={() => {}} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
  });

  it('shows error when password is empty on submit', async () => {
    const user = userEvent.setup();
    render(<Login onLoginSuccess={() => {}} />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('shows auth error for wrong credentials', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Login onLoginSuccess={() => {}} />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'wrong');
    await user.type(screen.getByPlaceholderText('Enter password'), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Incorrect username or password.')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('calls onLoginSuccess with correct credentials', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onLoginSuccess = vi.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });

  it('disables button while logging in', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Login onLoginSuccess={() => {}} />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    vi.useRealTimers();
  });

  it('submits on Enter key in password field', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onLoginSuccess = vi.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByPlaceholderText('Enter username'), 'admin');
    await user.type(screen.getByPlaceholderText('Enter password'), 'admin123{enter}');

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });
});
