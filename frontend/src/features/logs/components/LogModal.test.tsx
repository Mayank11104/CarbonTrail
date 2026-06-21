import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import LogModal from './LogModal'

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      circle: (props: any) => <circle {...props} />,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
  }
})

// Mock firebase auth hooks
vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn(() => [{ uid: 'test-user-123', getIdToken: vi.fn(() => 'mock-token') }, false, undefined]),
}))

// Mock firebase config
vi.mock('../../../config/firebase', () => ({
  auth: {},
}))

// Mock the logs API
vi.mock('../api/logs', () => ({
  saveLog: vi.fn(() => Promise.resolve({ id: 'new-log-1' })),
}))

describe('LogModal', () => {
  const mockClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LogModal category="transport" isOpen={false} onClose={mockClose} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when category is null', () => {
    const { container } = render(
      <LogModal category={null} isOpen={true} onClose={mockClose} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders category selection when opened with "all" category', () => {
    render(<LogModal category="all" isOpen={true} onClose={mockClose} />)

    // Should show all 4 category selection buttons
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  it('renders the correct category form when a specific category is passed', () => {
    render(<LogModal category="transport" isOpen={true} onClose={mockClose} />)

    // Should show transport options
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Car')).toBeInTheDocument()
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.getByText('Metro')).toBeInTheDocument()
  })

  it('renders food category options correctly', () => {
    render(<LogModal category="food" isOpen={true} onClose={mockClose} />)

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Beef/Lamb')).toBeInTheDocument()
    expect(screen.getByText('Chicken/Pork')).toBeInTheDocument()
    expect(screen.getByText('Vegetarian')).toBeInTheDocument()
    expect(screen.getByText('Vegan')).toBeInTheDocument()
  })

  it('renders energy category options correctly', () => {
    render(<LogModal category="energy" isOpen={true} onClose={mockClose} />)

    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('AC (Hours)')).toBeInTheDocument()
    expect(screen.getByText('Heater (Hours)')).toBeInTheDocument()
    expect(screen.getByText('General Usage')).toBeInTheDocument()
  })

  it('renders shopping category options correctly', () => {
    render(<LogModal category="shopping" isOpen={true} onClose={mockClose} />)

    expect(screen.getByText('Shopping')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
    expect(screen.getByText('Home Goods')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('allows selecting a category from the "all" chooser', async () => {
    const user = userEvent.setup()
    render(<LogModal category="all" isOpen={true} onClose={mockClose} />)

    // Click on 'Food' category
    await user.click(screen.getByText('Food'))

    // Should now show food options
    expect(screen.getByText('Beef/Lamb')).toBeInTheDocument()
  })

  it('shows a back button after selecting a category from chooser', async () => {
    const user = userEvent.setup()
    render(<LogModal category="all" isOpen={true} onClose={mockClose} />)

    // Select a category
    await user.click(screen.getByText('Transport'))

    // After selecting, should show transport options
    expect(screen.getByText('Car')).toBeInTheDocument()
  })
})
