import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{ uid: 'test', displayName: 'Test User' }, false]
}));

describe('LandingPage', () => {
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

  it('renders landing page headline', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Track less/i)).toBeInTheDocument();
  });
});
