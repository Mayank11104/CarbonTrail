# CarbonTrail

CarbonTrail is an AI-powered personal carbon tracking and reduction platform. Instead of presenting users with raw emissions data, CarbonTrail leverages Vertex AI and Firebase Genkit to translate carbon footprints into tangible, actionable daily nudges. The platform focuses on three core pillars: Understand, Track, and Reduce.

## Project Overview

*   **Understand**: Translates complex emissions data into relatable comparisons (e.g., "equal to driving 8 times").
*   **Track**: Provides a frictionless logging experience for transport, food, energy, and shopping habits.
*   **Reduce**: Delivers highly specific, contextual daily actions ranked by impact and ease, shifting focus from guilt to achievable behavior change.

## Architecture & Technology Stack

The project is structured as a modern, decoupled monorepo:

### Frontend
*   **Framework**: React 19 with Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4
*   **Animations**: Framer Motion
*   **Design System**: "Organic Precision" Stitch Design System with custom typography (DM Sans & Inter), ambient mesh gradients, tactile glassmorphism, and a vibrant color palette.
*   **Routing**: React Router DOM (Client-side routing)

### Backend
*   **Environment**: Node.js
*   **Framework**: Express
*   **Language**: TypeScript
*   **AI Integration**: Google Vertex AI & Firebase Genkit (In Progress)
*   **Database**: Firebase Firestore
*   **Authentication & Security**: Firebase Auth, Secure HttpOnly Session Cookies, Helmet, Express Rate Limit.

### Quality Assurance & Testing
A comprehensive testing strategy ensures reliability across the entire stack:
*   **Frontend Unit & Integration Tests**: Vitest + React Testing Library (with v8 coverage).
*   **Frontend End-to-End (E2E) Tests**: Playwright for full browser automation.
*   **Backend API Testing**: Vitest + Supertest with mocked Firebase Admin to securely and rapidly test Express routes without network overhead.

## Development Progress

### Phase 1: Foundation & Initial UI (Completed)
*   Defined the initial typography scale and color palette.
*   Initialized the frontend workspace with Vite, React, and Tailwind v4.
*   Developed a responsive landing page demonstrating the core value proposition.
*   Implemented a modular, feature-wise folder architecture.

### Phase 2: Authentication & Testing Infrastructure (Completed)
*   Scaffolded the `users` feature domains across both frontend and backend.
*   Built a robust, accessible, and animated Authentication Modal.
*   Established the frontend testing environments (Vitest and Playwright) with 100% passing tests.
*   Successfully integrated Firebase Authentication (Client SDK on React, Admin SDK on Node.js/Express).
*   Established backend testing infrastructure using Vitest and Supertest.

### Phase 3: Dashboard, Database & Security (Completed)
*   **Real-Time Data:** Integrated Firebase Firestore. Built a real-time listener that instantly calculates and animates the daily carbon progress ring.
*   **Logging Modals:** Created category-specific modals for logging Transport, Food, Energy, and Shopping data.
*   **Enterprise Security Hardening:**
    *   Migrated from purely client-side auth to secure, 7-day `HttpOnly` **Backend Session Cookies**.
    *   Eliminated Cross-Site Request Forgery (CSRF) via `SameSite: Strict` policies.
    *   Protected the API against XSS, clickjacking, and MIME-sniffing using `helmet`.

### Phase 4: UI Polish & Stitch Design System (Completed)
*   **Aesthetic Overhaul:** Fully upgraded the application's aesthetic using a premium "Organic Precision" design system.
*   **Dynamic Backgrounds:** Integrated fluid, CSS-animated mesh gradients and ambient background orbs.
*   **Landing Page Upgrade:** Re-styled the entire Landing Page while fully preserving the responsive multi-section layout and content.
*   **Bento Box Dashboard:** Redesigned the Dashboard into a comprehensive 12-column Bento Box layout featuring animated SVG progress rings, tactile logging tiles, and new Community/Challenge preview cards.

### Phase 5: AI Engine Integration (Next Steps)
*   Initialize Firebase Genkit in the backend.
*   Integrate Google Vertex AI to process user Firestore logs.
*   Generate personalized, actionable Daily Nudges and display them in the Dashboard's AI Coach component.

## Running the Application Locally

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### Setup
1.  Navigate to the backend directory and start the server:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
2.  In a separate terminal, navigate to the frontend directory:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Testing Commands (Frontend)
*   `npm test`: Run unit and integration tests.
*   `npm run test:coverage`: Generate a test coverage report.
*   `npm run test:e2e`: Execute Playwright end-to-end browser tests.

### Testing Commands (Backend)
*   `npm test`: Run integration tests against the Express API.
