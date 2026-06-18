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
A comprehensive testing strategy ensures reliability across the entire stack:
*   **Frontend Unit & Integration Tests**: Vitest + React Testing Library (with v8 coverage).
*   **Frontend End-to-End (E2E) Tests**: Playwright for full browser automation.
*   **Backend API Testing**: Vitest + Supertest with mocked Firebase Admin to securely and rapidly test Express routes without network overhead.

## Development Progress

### Phase 1: Foundation & UI/UX (Completed)
*   Defined the core design system, typography scale, and color palette.
*   Initialized the frontend workspace with Vite, React, and Tailwind v4.
*   Developed a fully responsive, animated landing page demonstrating the core value proposition.
*   Implemented a modular, feature-wise folder architecture to ensure scalable state and component management.

### Phase 2: Authentication & Testing Infrastructure (Completed)
*   Scaffolded the `users` feature domains across both frontend and backend.
*   Built a robust, accessible, and animated Authentication Modal.
*   Established the frontend testing environments (Vitest and Playwright) with 100% passing tests.
*   **Successfully integrated Firebase Authentication (Client SDK on React, Admin SDK on Node.js/Express).**
*   **Implemented secure JWT token verification middleware.**
*   **Established backend testing infrastructure using Vitest and Supertest.**

### Phase 3: Dashboard & AI Engine (Next Steps)
*   Develop the core dashboard and data logging interfaces for authenticated users.
*   Integrate Vertex AI and Firebase Genkit for the personalized AI Coach.
*   Implement data storage logic (Firestore/PostgreSQL) for user carbon logs.

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

### Testing Commands (Backend)
*   `npm test`: Run integration tests against the Express API.
