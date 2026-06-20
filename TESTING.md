# Testing — CarbonTrail

## Test Architecture
Three-layer testing strategy:
- **Unit Tests** — Vitest + React Testing Library (components, hooks, utilities)
- **Integration Tests** — Component interaction and user flows
- **E2E Tests** — Playwright full browser automation

## Running Tests
```bash
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

## What is Tested

### Unit Tests
- **AuthModal** — Render states (open/closed), login/signup mode switching, form validation (email format, password length, required fields), error clearing on input, password visibility toggle, forgot password link visibility, Google sign-in button

### E2E Tests
- **Landing Page** — Hero heading visibility, navigation links, auth modal open/close via buttons, tab switching between login and signup

## Adding Tests
- Place unit tests next to the component: `ComponentName.test.tsx`
- Place E2E tests in the `e2e/` directory: `feature-name.spec.ts`
- Run `npm test` before every commit to ensure nothing is broken.
