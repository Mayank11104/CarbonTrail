import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{ uid: 'test', displayName: 'Test User', getIdToken: vi.fn().mockResolvedValue('mock-token') }, false]
}));

vi.mock('../features/users/api/auth', () => ({
  logoutUser: vi.fn()
}));

vi.mock('../features/ai/api/coach', () => ({
  fetchCoachInsight: vi.fn().mockResolvedValue({
    insight: 'Your transport emissions were high this week.',
    tip: 'Try cycling for short trips.',
    actions: ['Bike to work', 'Use public transit', 'Carpool'],
    worstCategory: 'transport',
    weeklyTotal: 18.5,
  }),
  fetchPersonalizedChallenge: vi.fn().mockResolvedValue({
    title: 'Green Commute Week',
    description: 'Swap car trips for public transit.',
    targetSaving: 6.5,
    category: 'transport',
    tasks: ['Take the bus to work', 'Walk for short errands', 'Carpool once'],
  }),
}));

vi.mock('../features/logs/api/logs', () => ({
  subscribeToDailyLogs: vi.fn((_uid, cb) => { cb([]); return () => {}; }),
  subscribeToStreak: vi.fn((_uid, cb) => { cb(3); return () => {}; }),
  subscribeToWeeklyLogs: vi.fn((_uid, cb) => { cb([]); return () => {}; }),
}));

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );

describe('DashboardPage', () => {
  beforeAll(() => {
    const mockIntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.IntersectionObserver = mockIntersectionObserver as any;
  });

  it('renders dashboard with user greeting', () => {
    renderDashboard();
    expect(screen.getByText(/Hi, Test User/i)).toBeInTheDocument();
  });

  it('shows the streak counter from live data', () => {
    renderDashboard();
    expect(screen.getByText(/3-day streak/i)).toBeInTheDocument();
  });

  it('shows zero carbon today when no logs', () => {
    renderDashboard();
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('shows the daily budget amount', () => {
    renderDashboard();
    expect(screen.getByText(/of 15 kg/i)).toBeInTheDocument();
  });

  it('renders all four category tiles', () => {
    renderDashboard();
    expect(screen.getByText(/Transport \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Food \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Energy \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Shopping \(kg\)/i)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderDashboard();
    expect(screen.getByText('Daily Check-in')).toBeInTheDocument();
    expect(screen.getByText('Scan Bill')).toBeInTheDocument();
    expect(screen.getByText('View Trends')).toBeInTheDocument();
  });

  it('shows AI coach insight after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Your transport emissions were high this week/i)).toBeInTheDocument();
    });
  });

  it('shows AI challenge after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Green Commute Week')).toBeInTheDocument();
    });
  });

  it('shows recommended actions from AI coach', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Bike to work')).toBeInTheDocument();
      expect(screen.getByText('Use public transit')).toBeInTheDocument();
    });
  });

  it('renders community section', () => {
    renderDashboard();
    expect(screen.getByText(/Community/i)).toBeInTheDocument();
  });
});
