# Testing — CarbonTrail

## Test Architecture
Three-layer testing strategy powered by **Vitest** + **React Testing Library**:
- **Unit Tests** — Pure function logic, API clients, service mocking
- **Integration Tests** — Component rendering, user interactions, state management
- **E2E Tests** — Playwright full browser automation

## Running Tests

### Backend Tests
```bash
cd backend
npm test                  # run all backend tests
npx vitest run --coverage # with coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                 # unit + integration
npm run test:watch       # watch mode (re-run on save)
npm run test:coverage    # with coverage report (text + html + lcov)
npm run test:e2e         # end-to-end browser tests
npm run test:all         # everything
```

## Coverage Targets
- Lines: 70%+
- Functions: 70%+
- Branches: 60%+

---

## What is Tested

### Backend Tests (26 tests, 4 test files)

#### `ai.routes.test.ts` — AI API Endpoints (13 tests)
| Test | What It Validates |
|------|-------------------|
| POST /api/ai/coach — 401 no auth | Rejects requests without Authorization header |
| POST /api/ai/coach — 401 wrong scheme | Rejects non-Bearer auth (e.g. Basic) |
| POST /api/ai/coach — 200 success | Returns AI coach insight with correct structure |
| POST /api/ai/coach — 500 service error | Handles Gemini API timeouts gracefully |
| POST /api/ai/coach — 401 expired token | Returns auth error for expired Firebase tokens |
| POST /api/ai/challenge — 401 no auth | Rejects unauthenticated challenge requests |
| POST /api/ai/challenge — 200 success | Returns personalized challenge with tasks array |
| POST /api/ai/challenge — 500 error | Handles AI service failures gracefully |
| POST /api/ai/scan — 401 no auth | Rejects unauthenticated scan requests |
| POST /api/ai/scan — 400 no image | Validates base64Image is required |
| POST /api/ai/scan — 400 no mimeType | Validates mimeType is required |
| POST /api/ai/scan — 200 success | Returns parsed scan result with carbon impact |
| POST /api/ai/scan — 500 error | Handles Vision API failures gracefully |

#### `auth.routes.test.ts` — Authentication Endpoints (4 tests)
| Test | What It Validates |
|------|-------------------|
| POST /api/auth/session — no token | Returns 401 when no idToken in body |
| POST /api/auth/session — invalid token | Returns 401 for invalid Firebase tokens |
| POST /api/auth/logout — success | Returns 200 with `{ status: 'success' }` |
| POST /api/auth/logout — cookie | Sets `Set-Cookie` header to clear session |

#### `users.test.ts` — User API Endpoints (3 tests)
| Test | What It Validates |
|------|-------------------|
| GET /api/users/profile — 401 no token | Rejects requests without Bearer token |
| GET /api/users/profile — 401 bad token | Rejects invalid tokens |
| GET /api/users/profile — 200 valid | Returns user uid + email from decoded token |

#### `server.test.ts` — Server Core & Security (6 tests)
| Test | What It Validates |
|------|-------------------|
| GET /health — 200 | Health endpoint returns `{ status: 'ok' }` |
| GET /health — JSON | Response Content-Type is application/json |
| Security — X-Content-Type-Options | Helmet sets `nosniff` header |
| Security — X-Frame-Options | Helmet prevents clickjacking |
| CORS — cross-origin | CORS headers are present for cross-origin requests |
| 404 — unknown route | Returns 404 for undefined API paths |

---

### Frontend Tests (48 tests, 5 test files)

#### `AuthModal.test.tsx` — Authentication Modal (11 tests)
| Test | What It Validates |
|------|-------------------|
| isOpen=false | Renders nothing when closed |
| Login mode rendering | Shows "Welcome back", email/password fields |
| Signup mode rendering | Shows "Start your trail", name field |
| Mode switching | Tab click switches login ↔ signup |
| Required field validation | Shows "Email is required" / "Password is required" |
| Email format validation | Rejects "notanemail", shows "Enter a valid email" |
| Password length validation | Rejects <6 chars, shows "At least 6 characters" |
| Password visibility toggle | Eye button toggles type password ↔ text |
| Error clearing on type | Errors disappear when user starts typing |
| Forgot password visibility | Shows only in login mode, hides in signup |
| Google sign-in button | "Continue with Google" button is rendered |

#### `LogModal.test.tsx` — Carbon Log Entry Modal (9 tests)
| Test | What It Validates |
|------|-------------------|
| isOpen=false | Renders nothing when closed |
| category=null | Returns null (no render) |
| category="all" | Shows 4 category chooser buttons |
| category="transport" | Shows Car, Bus, Metro, Walk/Bike options |
| category="food" | Shows Beef/Lamb, Chicken/Pork, Vegetarian, Vegan |
| category="energy" | Shows AC, Heater, General Usage |
| category="shopping" | Shows Electronics, Clothing, Home Goods, Other |
| Category selection | Clicking "Food" from chooser shows food options |
| Back navigation | After selecting Transport, shows Car option |

#### `ScanModal.test.tsx` — AI Bill Scanner Modal (8 tests)
| Test | What It Validates |
|------|-------------------|
| isOpen=false | Renders nothing when closed |
| Heading | Shows "Scan Bill or Receipt" |
| Subtitle | Shows upload instruction text |
| Drag-and-drop area | Shows "Drag and drop your image here" |
| File format hints | Shows "Supports PNG, JPEG, or WebP" |
| Browse files button | "Browse files" button is rendered |
| Close button | At least one close button exists |
| State reset | Re-opening modal resets to upload state |

#### `TrendsModal.test.tsx` — Weekly Trends Visualization (13 tests)
| Test | What It Validates |
|------|-------------------|
| isOpen=false | Renders nothing when closed |
| Heading | Shows "Emissions Trends" |
| Subtitle | Shows analysis description |
| Zero state | Shows 0.0 when no logs exist |
| Weekly total | Correctly sums 5 logs = 20.0 kg |
| Stats grid labels | "Weekly Total", "Daily Average", "Budget Days" |
| Category names | All 4 categories in breakdown |
| Budget line | Shows "Budget Limit (15 kg)" |
| History heading | Shows "7-Day Emissions History" |
| Breakdown heading | Shows "Category Breakdown (7 Days)" |
| Close button | "Close" button exists |
| Multi-day logs | Logs across 2 days sum correctly (5.0) |
| Budget days count | All 7 days under budget when no logs |

#### `coach.test.ts` — Frontend AI API Client (7 tests)
| Test | What It Validates |
|------|-------------------|
| fetchCoachInsight — request | Sends POST with Bearer token to /api/ai/coach |
| fetchCoachInsight — error | Throws error with server message on failure |
| fetchCoachInsight — non-JSON | Throws fallback "status 500" error |
| fetchPersonalizedChallenge — request | Sends POST to /api/ai/challenge |
| fetchPersonalizedChallenge — error | Throws server error message |
| uploadAndScanBill — request | Sends POST with base64 + mimeType |
| uploadAndScanBill — error | Throws error for missing fields |

---

## Test File Locations

### Backend
```
backend/src/
├── features/
│   ├── ai/ai.routes.test.ts
│   ├── auth/auth.routes.test.ts
│   └── users/users.test.ts
└── test/
    ├── setup.ts          # Firebase Admin mock setup
    └── server.test.ts    # Health, security, CORS tests
```

### Frontend
```
frontend/src/
├── features/
│   ├── ai/api/coach.test.ts
│   ├── logs/components/
│   │   ├── LogModal.test.tsx
│   │   ├── ScanModal.test.tsx
│   │   └── TrendsModal.test.tsx
│   └── users/components/
│       └── AuthModal.test.tsx
└── test-setup.ts         # jest-dom matchers
```

## Adding Tests
- Place unit tests next to the component: `ComponentName.test.tsx`
- Place E2E tests in the `e2e/` directory: `feature-name.spec.ts`
- Run `npm test` before every commit to ensure nothing is broken.
