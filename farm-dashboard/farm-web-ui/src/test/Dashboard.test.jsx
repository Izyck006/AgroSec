import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows syncing indicator while loading', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(<Dashboard />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('renders header and branding', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Hey, Welcome Farmer!')).toBeInTheDocument();
    });
    expect(screen.getByText('Agro')).toBeInTheDocument();
    expect(screen.getByText('Sec')).toBeInTheDocument();
  });

  it('displays empty state when no alerts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No movement detected/)).toBeInTheDocument();
    });
  });

  it('renders alert data in the table', async () => {
    const mockAlerts = [
      {
        id: 1,
        intruderType: 'person',
        confidence: 92.5,
        timestamp: '2026-06-18T12:00:00',
        status: 'Dog Bark',
        imageData: null,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlerts),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('person')).toBeInTheDocument();
    });
    expect(screen.getByText('92.5%')).toBeInTheDocument();
    expect(screen.getByText('Dog Bark')).toBeInTheDocument();
  });

  it('shows "No Image" when imageData is null', async () => {
    const mockAlerts = [
      {
        id: 1,
        intruderType: 'cow',
        confidence: 88.0,
        timestamp: '2026-06-18T12:00:00',
        status: 'Hyena Audio',
        imageData: null,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlerts),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });
  });

  it('shows connection warning on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reconnecting Link...')).toBeInTheDocument();
    });
  });

  it('shows Active status on successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('displays analytics cards', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });
    expect(screen.getByText('ARMED')).toBeInTheDocument();
    expect(screen.getByText('Total Intrusions')).toBeInTheDocument();
    expect(screen.getByText('Latest Threat')).toBeInTheDocument();
    expect(screen.getByText('NONE')).toBeInTheDocument();
  });

  it('shows latest intruder type when alerts exist', async () => {
    const mockAlerts = [
      {
        id: 1,
        intruderType: 'sheep',
        confidence: 85.0,
        timestamp: '2026-06-18T12:00:00',
        status: 'Hyena Audio',
        imageData: null,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAlerts),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('SHEEP')).toBeInTheDocument();
    });
  });

  it('renders the copyright footer', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/2026 AgroSec/)).toBeInTheDocument();
    });
  });
});
