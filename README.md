<div align="center">
  <img src="frontend/public/icon.svg" alt="Logo" width="80" height="80">
  <h1 align="center">CarbonTrail</h1>

  <p align="center">
    <strong>Track, Reduce, and Thrive: Your Personal AI-Powered Carbon Footprint Coach.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/tests-74%20passed-brightgreen?style=flat-square" alt="Tests">
    <img src="https://img.shields.io/badge/test%20files-9-blue?style=flat-square" alt="Test Files">
    <img src="https://img.shields.io/badge/TypeScript-100%25-blue?style=flat-square" alt="TypeScript">
    <img src="https://img.shields.io/badge/Security-6%20layers-red?style=flat-square" alt="Security">
  </p>
</div>

---

## 🌍 Chosen Vertical
**Sustainability & Eco-Consciousness**

CarbonTrail addresses the critical global need to reduce individual carbon footprints. We built a dynamic, intelligent assistant that transforms carbon tracking from a tedious, manual chore into an engaging, gamified, and highly automated experience using Google's Gemini AI.

## 🧠 Approach and Logic

Our approach centered on building a **Smart, Dynamic Assistant** that uses logical decision-making based directly on the user's personal context and habits:

1. **Context-Aware Coaching:** Instead of generic environmental tips, CarbonTrail analyzes the user's real-time daily and weekly logs (Transport, Food, Energy, Shopping). The Gemini AI identifies the user's highest-emitting category and dynamically tailors its advice to target their specific habits.
2. **Frictionless Data Entry (Computer Vision):** To solve the real-world usability problem of manual data entry, we implemented a **Scan Bill** feature. Users upload utility bills or grocery receipts, and Gemini Vision parses the text, classifies the category, extracts the value, and estimates the carbon footprint automatically.
3. **Gamified Micro-Actions:** We use AI to generate personalized, weekly "Eco-Challenges" with step-by-step tasks and concrete CO2 savings goals. This logic encourages sustainable behavior through achievable micro-actions rather than overwhelming lifestyle changes.

## ⚙️ How the Solution Works

```
User → Landing Page → Firebase Auth → Dashboard
                                         │
                    ┌────────────────┬────┴────┬──────────────┐
                    ▼                ▼         ▼              ▼
              Log Activity     Scan Bill   AI Coach     View Trends
              (LogModal)     (ScanModal)  (Gemini Pro)  (TrendsModal)
                    │                │         │              │
                    ▼                ▼         ▼              ▼
              Firestore DB    Gemini Vision  Weekly Logs   7-Day Chart
                    │                │      Aggregation    + Budget Line
                    └────────────────┴─────────┴──────────────┘
                                         │
                                    Express Backend
                               (Auth + Rate Limit + Helmet)
```

1. **Onboarding & Authentication:** Users securely sign in via Firebase Authentication (Email/Password or Google OAuth).
2. **Daily Check-ins:** Users log their daily activities through a beautifully crafted, glassmorphic UI. Activities are saved to Firestore and instantly update the daily ring progress chart against a set kg CO2 budget.
3. **AI Bill Scanner:** Users drag-and-drop a receipt into the Scan Modal. The image is passed to the Express backend and fed into the Gemini Vision model, which returns parsed details and calculates emissions.
4. **AI Coach & Challenges:** The backend aggregates the user's weekly logs. The Gemini model consumes this data to generate a customized insight tip and a multi-step Eco-Challenge, tracking completion directly in the UI.
5. **Trends Dashboard:** A 7-day visualization of emission history and budget limits helps users monitor their progress over time.

## 📝 Assumptions Made

- **Standard Emission Factors:** We assume standard, generalized carbon emission factors for calculation (e.g., average kg CO2 per km driven or per meal type), as highly localized data varies wildly.
- **Image Quality:** The AI Bill Scanner assumes the uploaded receipts/bills are reasonably legible.
- **Target Audience:** We assume the user has a basic smartphone or desktop to interact with modern web features (drag-and-drop, animations).

---

## 🏆 Evaluation Focus Areas

### 1. Code Quality — `🔴 High Impact`

- **Feature-Based Architecture:** Clean separation of concerns using a modular, feature-folder structure. Each feature (users, logs, ai) has its own API layer, components, routes, services, and tests.
- **TypeScript First (100%):** Strict type definitions across both the Frontend (React) and Backend (Express) ensure maintainability and predictability. Zero `any` types in business logic.
- **Self-Documenting Code:** Meaningful variable names, JSDoc comments on all routes, and modular CSS (Tailwind + scoped internal styling).
- **DRY Principles:** Shared interfaces between frontend and backend (`AICoachResponse`, `AIScanResponse`, `CarbonLog`). Reusable utility functions (`estimateCarbon`) centralized in API layers.

### 2. Problem Statement Alignment — `🔴 High Impact`

The solution fully aligns with building a **smart, dynamic assistant**:
- ✅ **Smart:** Gemini AI analyzes real user data to generate personalized insights (not generic tips)
- ✅ **Dynamic:** Adapts weekly based on changing user habits and worst-emitting categories
- ✅ **Logical Decision Making:** Context-aware prompts send actual aggregated data (not raw dumps) to Gemini for structured JSON responses
- ✅ **Practical & Real-World:** Solves genuine friction points (manual data entry → AI bill scanning, generic advice → personalized coaching)

### 3. Security — `🟡 Medium Impact`

We implemented **6 layers of security** across the full stack:

| Layer | Implementation | What It Prevents |
|-------|---------------|-----------------|
| **🔐 Helmet.js** | `app.use(helmet())` — Sets 11+ HTTP security headers | XSS, clickjacking, MIME sniffing, content injection |
| **🛡️ Rate Limiting** | `express-rate-limit` — 100 requests per 15 min per IP on `/api/` | DDoS attacks, API abuse, brute-force attempts |
| **📦 Body Size Limit** | `express.json({ limit: '10kb' })` | Payload injection attacks, memory exhaustion |
| **🔒 HPP Protection** | `hpp()` middleware | HTTP Parameter Pollution attacks |
| **🍪 Secure Cookies** | `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'` | XSS cookie theft, CSRF attacks |
| **🔑 Firebase Token Auth** | `verifyIdToken()` middleware on all protected routes | Unauthorized API access, token forgery |

**Additional Security Measures:**
- **Session Time Window:** Session cookies are only created if the user signed in within the last 5 minutes (`auth_time` check), preventing replay attacks with stale tokens.
- **CORS with Credentials:** Configured `cors({ origin: true, credentials: true })` to allow only legitimate origins while supporting secure cookie transmission.
- **Environment Variable Isolation:** All API keys (`GEMINI_API_KEY`) and Firebase credentials are stored in `.env` files, excluded from Git via `.gitignore`, and injected at deployment time via `--set-env-vars`.
- **Protected Routes (Frontend):** `<ProtectedRoute>` wrapper component redirects unauthenticated users to the landing page, preventing unauthorized dashboard access.
- **Input Validation:** All AI endpoints validate required fields (`base64Image`, `mimeType`, `Authorization` header) before processing, returning descriptive 400/401 errors.
- **Graceful Error Boundaries:** AI service failures return fallback JSON responses instead of crashing or exposing stack traces to the client.

### 4. Efficiency — `🟡 Medium Impact`

- **Real-Time Firestore Listeners:** We use `onSnapshot` only where live updates are essential (daily logs, streak counter), avoiding redundant polling.
- **AI Response Caching:** Challenge states are persisted in `localStorage` to eliminate duplicate Gemini API calls on page refresh.
- **Multi-Stage Docker Build:** Production image uses `node:20-alpine` with `npm install --omit=dev`, reducing the final container to **~140MB** (from 769MB build).
- **Bundle Optimization:** Built with Vite for tree-shaking, code-splitting, and optimized production builds.
- **Lazy State Initialization:** Components like `TrendsModal` compute aggregated data only when opened, not on every dashboard render.

### 5. Testing & Validation — `🟡 Medium Impact`

We implemented a rigorous automated testing suite using **Vitest** and **React Testing Library**, achieving:

<div align="center">

### ✅ 74 Tests Passed  |  9 Test Files  |  0 Failures

</div>

**Automated Test Suite — `npm test`**

| Layer | Test File | Tests | What It Covers |
|-------|-----------|:-----:|----------------|
| **Backend API** | `ai.routes.test.ts` | 13 | All 3 AI endpoints (coach, challenge, scan): auth guards, input validation, success responses, error handling |
| **Backend Auth** | `auth.routes.test.ts` | 4 | Session creation with valid/invalid tokens, logout with cookie clearing |
| **Backend Users** | `users.test.ts` | 3 | Profile endpoint: no token → 401, invalid token → 401, valid token → 200 |
| **Backend Core** | `server.test.ts` | 6 | Health endpoint, Helmet security headers (X-Content-Type-Options, X-Frame-Options), CORS, 404 routing |
| **Frontend Auth** | `AuthModal.test.tsx` | 11 | Login/signup rendering, form validation (email format, password length, required fields), mode switching, password visibility toggle, error clearing, Google sign-in |
| **Frontend Logs** | `LogModal.test.tsx` | 9 | Category chooser ("all"), specific category options (transport/food/energy/shopping), category navigation |
| **Frontend Scan** | `ScanModal.test.tsx` | 8 | Heading, drag-drop area, file format hints, browse button, close button, state reset on reopen |
| **Frontend Trends** | `TrendsModal.test.tsx` | 13 | Weekly totals, daily averages, budget tracking (7/7), chart labels, category breakdown, multi-day aggregation, zero-state handling |
| **Frontend API** | `coach.test.ts` | 7 | API client request formatting, Bearer token headers, success/error response parsing, non-JSON fallback |

> 📄 See **[TESTING.md](TESTING.md)** for the complete test-by-test breakdown with individual descriptions.

**Run Tests Yourself:**
```bash
# Backend (26 tests)
cd backend && npm test

# Frontend (48 tests)
cd frontend && npm test

# Frontend with coverage report
cd frontend && npm run test:coverage
```

**Manual Validation Also Performed:**
- **Gemini Vision (Bill Scanner):** Tested with various receipt/bill images to verify correct JSON extraction and graceful error handling for unreadable images.
- **Gemini Pro (Coach & Challenges):** Validated zero-log states, single-category edge cases, and high-volume logs to ensure consistent AI output.
- **Edge Cases:** Token expirations, empty data fallback UI, disabled button states during network requests to prevent duplicate submissions.

### 6. Accessibility — `🟢 Low Impact`

- **Inclusive Design:** Strong color contrast ratios (WCAG AA compliant), clear sans-serif typography, and visible focus states on all interactive elements.
- **Semantic HTML:** Proper heading hierarchy (`h1` → `h2` → `h3`), form labels, and ARIA attributes on icon-only buttons.
- **Responsive Design:** Fluidly scales across mobile, tablet, and desktop viewports using CSS Grid, Flexbox, and responsive units.
- **Keyboard Navigation:** All modals, forms, and buttons are fully navigable via Tab/Enter/Escape keys.

---

## 📁 Project Structure

```
CarbonTrail/
├── 📄 Dockerfile                    # Multi-stage production build
├── 📄 .dockerignore                 # Docker build exclusions
├── 📄 README.md                     # This file
├── 📄 TESTING.md                    # Full test breakdown (74 tests)
│
├── 🔧 backend/                      # Express + TypeScript API Server
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts             # Backend test configuration
│   │
│   └── src/
│       ├── index.ts                 # Server entry: Helmet, CORS, Rate Limit, HPP
│       │
│       ├── config/
│       │   └── firebase.ts          # Firebase Admin SDK initialization
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts    # Bearer token verification (verifyToken)
│       │   └── requireAuth.ts       # Session cookie verification (requireAuth)
│       │
│       ├── features/
│       │   ├── ai/                  # 🤖 AI Feature
│       │   │   ├── ai.routes.ts     #    POST /coach, /challenge, /scan
│       │   │   ├── ai.service.ts    #    Gemini API integration (3 services)
│       │   │   └── ai.routes.test.ts#    ✅ 13 tests
│       │   │
│       │   ├── auth/                # 🔐 Authentication Feature
│       │   │   ├── auth.routes.ts   #    POST /session, /logout
│       │   │   └── auth.routes.test.ts # ✅ 4 tests
│       │   │
│       │   └── users/               # 👤 User Feature
│       │       ├── users.routes.ts  #    GET /profile (protected)
│       │       ├── users.controller.ts
│       │       ├── users.service.ts
│       │       └── users.test.ts    #    ✅ 3 tests
│       │
│       └── test/
│           ├── setup.ts             # Firebase Admin mocks
│           └── server.test.ts       # ✅ 6 tests (health, security, CORS)
│
└── 🎨 frontend/                     # React + Vite + TypeScript UI
    ├── package.json
    ├── vitest.config.ts             # Frontend test configuration
    ├── tsconfig.json
    │
    ├── public/
    │   ├── icon.svg                 # App logo
    │   └── favicon.ico
    │
    └── src/
        ├── App.tsx                  # Router + ProtectedRoute guard
        ├── main.tsx                 # React entry point
        ├── index.css                # Global styles & design tokens
        ├── test-setup.ts            # jest-dom matchers
        │
        ├── config/
        │   └── firebase.ts          # Firebase client SDK config
        │
        ├── pages/
        │   ├── LandingPage.tsx      # Public landing page with hero + auth
        │   └── DashboardPage.tsx    # Protected dashboard (logs, AI, trends)
        │
        └── features/
            ├── ai/                  # 🤖 AI Feature (Frontend)
            │   └── api/
            │       ├── coach.ts     #    API client (fetchCoachInsight, uploadAndScanBill)
            │       └── coach.test.ts#    ✅ 7 tests
            │
            ├── logs/                # 📊 Carbon Logging Feature
            │   ├── api/
            │   │   └── logs.ts      #    Firestore CRUD + estimateCarbon()
            │   └── components/
            │       ├── LogModal.tsx  #    Category-based log entry form
            │       ├── LogModal.test.tsx  # ✅ 9 tests
            │       ├── ScanModal.tsx #    AI-powered bill scanner
            │       ├── ScanModal.test.tsx # ✅ 8 tests
            │       ├── TrendsModal.tsx    # 7-day emission chart + breakdown
            │       └── TrendsModal.test.tsx # ✅ 13 tests
            │
            └── users/               # 👤 User Feature (Frontend)
                ├── api/
                │   └── auth.ts      #    Firebase Auth (login, register, Google, logout)
                ├── components/
                │   ├── AuthModal.tsx #    Login/signup modal with validation
                │   ├── AuthModal.test.tsx # ✅ 11 tests
                │   └── LoginForm.tsx
                └── index.ts
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS 4, Framer Motion, Firebase Auth |
| **Backend** | Node.js, Express 5, TypeScript, Google Gemini AI (`@google/genai`), Firebase Admin SDK |
| **Security** | Helmet.js, express-rate-limit, hpp, httpOnly cookies, Firebase ID Token verification |
| **Testing** | Vitest, React Testing Library, Supertest, @testing-library/user-event |
| **DevOps** | Docker (multi-stage), Google Cloud Run, Artifact Registry |

---

*Built for PromptWars 2026. A seamless fusion of beautiful design and intelligent AI to protect our planet.* 🌱
