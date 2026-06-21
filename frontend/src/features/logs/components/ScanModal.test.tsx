import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ScanModal } from './ScanModal'

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
    },
  }
})

// Mock firebase auth hooks
vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn(() => [{ uid: 'test-user-123', getIdToken: vi.fn(() => Promise.resolve('mock-token')) }, false, undefined]),
}))

// Mock firebase config
vi.mock('../../../config/firebase', () => ({
  auth: {},
}))

// Mock the logs and coach APIs
vi.mock('../api/logs', () => ({
  saveScannedLog: vi.fn(() => Promise.resolve({ id: 'scanned-log-1' })),
}))

vi.mock('../../ai/api/coach', () => ({
  uploadAndScanBill: vi.fn(),
}))

describe('ScanModal', () => {
  const mockClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ScanModal isOpen={false} onClose={mockClose} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders the scan modal heading when open', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    expect(screen.getByText('Scan Bill or Receipt')).toBeInTheDocument()
  })

  it('shows the subtitle description', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    expect(screen.getByText(/Upload a utility bill or ticket/)).toBeInTheDocument()
  })

  it('shows the drag-and-drop upload area', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    expect(screen.getByText(/Drag and drop your image here/)).toBeInTheDocument()
  })

  it('shows supported file format hints', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    expect(screen.getByText(/Supports PNG, JPEG, or WebP/)).toBeInTheDocument()
  })

  it('has a browse files button', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    expect(screen.getByText('Browse files')).toBeInTheDocument()
  })

  it('has a close button', () => {
    render(<ScanModal isOpen={true} onClose={mockClose} />)

    const closeButtons = screen.getAllByRole('button')
    expect(closeButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('resets state when modal is closed and reopened', () => {
    const { rerender } = render(
      <ScanModal isOpen={true} onClose={mockClose} />
    )

    // Close it
    rerender(<ScanModal isOpen={false} onClose={mockClose} />)

    // Reopen it
    rerender(<ScanModal isOpen={true} onClose={mockClose} />)

    // Should be back to initial upload state
    expect(screen.getByText(/Drag and drop your image here/)).toBeInTheDocument()
  })
})
