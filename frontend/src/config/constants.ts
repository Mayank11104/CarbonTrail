export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const APP_CONSTANTS = {
  LOGS: {
    MAX_AMOUNT: 10000,
    MIN_AMOUNT: 0,
    SUCCESS_TIMEOUT_MS: 1200,
    DAILY_BUDGET_KG: 15,
  },
  ANIMATION: {
    DEFAULT_DURATION: 0.2,
    SLOW_DURATION: 0.3,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 7,
  },
} as const;
