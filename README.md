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
*   **Design System**: Custom typography (DM Sans & Inter) and a nature-inspired color palette (Forest, Sage, Mint, Clay, Sand, Fog).

### Backend (In Progress)
*   **Environment**: Node.js
*   **Framework**: Express
*   **Language**: TypeScript
*   **AI Integration**: Google Vertex AI & Firebase Genkit
*   **Authentication**: Firebase Auth

### Quality Assurance & Testing
A comprehensive three-layer testing strategy ensures reliability and prevents regressions:
*   **Unit & Integration Tests**: Vitest + React Testing Library (with v8 coverage).
*   **End-to-End (E2E) Tests**: Playwright for full browser automation and critical user journey validation.

## Development Progress

### Phase 1: Foundation & UI/UX (Completed)
*   Defined the core design system, typography scale, and color palette.
*   Initialized the frontend workspace with Vite, React, and Tailwind v4.
*   Developed a fully responsive, animated landing page demonstrating the core value proposition.
*   Implemented a modular, feature-wise folder architecture to ensure scalable state and component management.

### Phase 2: Authentication & Testing Infrastructure (Completed)
*   Scaffolded the `users` feature domains across both frontend and backend.
*   Built a robust, accessible, and animated Authentication Modal (supporting Login and Registration states, form validation, and Google Sign-In preparation).
*   Established the testing environments (Vitest and Playwright).
*   Achieved 100% passing status on initial test suites covering the Authentication Modal and Landing Page E2E flows.
*   Standardized version control configurations across all environments.

### Phase 3: Backend Integration & AI Engine (Next Steps)
*   Implement Firebase Authentication.
*   Build out the Express backend services.
*   Integrate Vertex AI and Firebase Genkit for the personalized AI Coach.
*   Develop the core dashboard and data logging interfaces.

## Running the Application Locally

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### Testing Commands (Frontend)
*   `npm test`: Run unit and integration tests.
*   `npm run test:coverage`: Generate a test coverage report.
*   `npm run test:e2e`: Execute Playwright end-to-end browser tests.
*   `npm run test:all`: Run the complete test suite.
