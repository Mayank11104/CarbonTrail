import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { TrendsModal } from './TrendsModal'
import type { CarbonLog } from '../api/logs'

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

// ── Helpers ──────────────────────────────────────────────────────────
const makeLogs = (overrides: Partial<CarbonLog>[] = []): CarbonLog[] => {
  const today = new Date()
  return overrides.map((o, i) => ({
    id: `log-${i}`,
    category: 'transport' as const,
    option: 'Car',
    amount: 10,
    carbonImpact: 2.4,
    timestamp: today,
    ...o,
  }))
}

const yesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d
}

describe('TrendsModal', () => {
  const mockClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <TrendsModal isOpen={false} onClose={mockClose} weeklyLogs={[]} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders the modal heading when open', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Emissions Trends')).toBeInTheDocument()
  })

  it('shows the subtitle description', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText(/Analysis of your daily logs/)).toBeInTheDocument()
  })

  it('shows zero state when no logs are provided', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    // Weekly Total stat card should show 0.0
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('renders correct weekly total', () => {
    const logs = makeLogs([
      { category: 'transport', carbonImpact: 5.5 },
      { category: 'transport', carbonImpact: 3.0 },
      { category: 'food', carbonImpact: 2.0 },
      { category: 'energy', carbonImpact: 8.0 },
      { category: 'shopping', carbonImpact: 1.5 },
    ])

    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={logs} />)

    // Total = 5.5 + 3.0 + 2.0 + 8.0 + 1.5 = 20.0
    expect(screen.getByText('20.0')).toBeInTheDocument()
  })

  it('shows the stats grid labels', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Weekly Total')).toBeInTheDocument()
    expect(screen.getByText('Daily Average')).toBeInTheDocument()
    expect(screen.getByText('Budget Days')).toBeInTheDocument()
  })

  it('displays all four category names in the breakdown', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  it('shows the budget limit indicator', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Budget Limit (15 kg)')).toBeInTheDocument()
  })

  it('shows the 7-Day history section heading', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('7-Day Emissions History')).toBeInTheDocument()
  })

  it('shows the category breakdown section heading', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Category Breakdown (7 Days)')).toBeInTheDocument()
  })

  it('has a close button', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('correctly handles logs spread across multiple days', () => {
    const logs = makeLogs([
      { category: 'transport', carbonImpact: 3.0, timestamp: new Date() },
      { category: 'food', carbonImpact: 2.0, timestamp: yesterday() },
    ])

    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={logs} />)

    // Total should be 5.0
    expect(screen.getByText('5.0')).toBeInTheDocument()
  })

  it('shows budget days count out of 7', () => {
    render(<TrendsModal isOpen={true} onClose={mockClose} weeklyLogs={[]} />)

    // With no logs, all 7 days should be under budget
    expect(screen.getByText('7/7')).toBeInTheDocument()
  })
})
