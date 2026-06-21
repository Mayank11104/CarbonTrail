import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{ uid: 'test', displayName: 'Test User' }, false]
}));

vi.mock('../features/users/api/auth', () => ({
  logoutUser: vi.fn()
}));

vi.mock('../features/ai/api/coach', () => ({
  fetchCoachInsight: vi.fn().mockResolvedValue({ message: 'Great job!' }),
  fetchPersonalizedChallenge: vi.fn().mockResolvedValue({ title: 'Walk 5km' })
}));

describe('DashboardPage', () => {
  beforeAll(() => {
    // Mock IntersectionObserver for Framer Motion
    const mockIntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.IntersectionObserver = mockIntersectionObserver as any;
  });

  it('renders dashboard with user name', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Hi, Test User/i)).toBeInTheDocument();
  });
});
