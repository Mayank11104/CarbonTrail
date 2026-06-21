/**
 * Application-wide constants to avoid magic numbers and improve code maintainability.
 */
export const APP_CONSTANTS = {
  LOGS: {
    MAX_AMOUNT: 10000,
    MIN_AMOUNT: 0,
    SUCCESS_TIMEOUT_MS: 1200,
  },
  ANIMATION: {
    DEFAULT_DURATION: 0.2,
    SLOW_DURATION: 0.3,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 7, // e.g., 7 days for trends
  },
} as const;
