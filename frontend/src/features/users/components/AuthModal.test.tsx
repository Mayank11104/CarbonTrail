import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AuthModal from './AuthModal'
import { fireEvent } from '@testing-library/react'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      circle: (props: any) => <circle {...props} />,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
  }
})

// Helper to wrap with Router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AuthModal', () => {
  const mockClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithRouter(
      <AuthModal isOpen={false} onClose={mockClose} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders login form when opened in login mode', () => {
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Log in to continue your journey')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders signup form when opened in signup mode', () => {
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="signup" />)

    expect(screen.getByText('Start your trail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('switches between login and signup modes', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    // Start in login — no name field
    expect(screen.queryByPlaceholderText('Your name')).not.toBeInTheDocument()

    // Click Sign up tab
    const signupTab = screen.getAllByText('Sign up')[0]
    await user.click(signupTab)

    // Now name field should appear
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    // Submit empty form — filter to the submit button specifically
    const allLoginBtns = screen.getAllByRole('button', { name: /log in/i })
    const formSubmitBtn = allLoginBtns.find(btn => btn.getAttribute('type') === 'submit')!
    await user.click(formSubmitBtn)

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    // Use fireEvent to set values, bypassing HTML5 type="email" constraint validation
    fireEvent.change(emailInput, { target: { value: 'notanemail' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit the form directly to bypass HTML5 constraint validation
    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
  })

  it('validates password minimum length', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), '123')

    const allLoginBtns = screen.getAllByRole('button', { name: /log in/i })
    const formSubmitBtn = allLoginBtns.find(btn => btn.getAttribute('type') === 'submit')!
    await user.click(formSubmitBtn)

    expect(screen.getByText('At least 6 characters')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Find and click the eye toggle button
    const toggleBtn = passwordInput.parentElement?.querySelector('button')
    if (toggleBtn) {
      await user.click(toggleBtn)
      expect(passwordInput).toHaveAttribute('type', 'text')
    }
  })

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)

    // Submit empty to trigger errors — use the submit button specifically
    const allLoginBtns = screen.getAllByRole('button', { name: /log in/i })
    const formSubmitBtn = allLoginBtns.find(btn => btn.getAttribute('type') === 'submit')!
    await user.click(formSubmitBtn)
    expect(screen.getByText('Email is required')).toBeInTheDocument()

    // Start typing — error should clear
    await user.type(screen.getByPlaceholderText('you@example.com'), 'a')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('shows forgot password link only in login mode', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockClose} initialMode="login" />
    )
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()

    // Switch to signup mode by clicking the tab
    const signupTab = screen.getAllByText('Sign up')[0]
    await user.click(signupTab)

    // Forgot password should disappear
    expect(screen.queryByText('Forgot password?')).not.toBeInTheDocument()
  })

  it('shows Google sign-in button', () => {
    renderWithRouter(<AuthModal isOpen={true} onClose={mockClose} initialMode="login" />)
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })
})
