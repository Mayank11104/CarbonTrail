<div align="center">
  <img src="frontend/public/icon.svg" alt="Logo" width="80" height="80">
  <h1 align="center">CarbonTrail</h1>

  <p align="center">
    <strong>Track, Reduce, and Thrive: Your Personal AI-Powered Carbon Footprint Coach.</strong>
  </p>
</div>

---

## 🌍 Chosen Vertical
**Sustainability & Eco-Consciousness**

CarbonTrail addresses the critical global need to reduce individual carbon footprints. We built a dynamic, intelligent assistant that transforms carbon tracking from a tedious, manual chore into an engaging, gamified, and highly automated experience using Google's Gemini AI.

## 🧠 Approach and Logic

Our approach centered on building a **Smart, Dynamic Assistant** that uses logical decision-making based directly on the user's personal context and habits:

1. **Context-Aware Coaching:** Instead of generic environmental tips, CarbonTrail analyzes the user’s real-time daily and weekly logs (Transport, Food, Energy, Shopping). The Gemini AI identifies the user's highest-emitting category and dynamically tailors its advice to target their specific habits.
2. **Frictionless Data Entry (Computer Vision):** To solve the real-world usability problem of manual data entry, we implemented a **Scan Bill** feature. Users upload utility bills or grocery receipts, and Gemini Vision parses the text, classifies the category, extracts the value, and estimates the carbon footprint automatically.
3. **Gamified Micro-Actions:** We use AI to generate personalized, weekly "Eco-Challenges" with step-by-step tasks and concrete CO2 savings goals. This logic encourages sustainable behavior through achievable micro-actions rather than overwhelming lifestyle changes.

## ⚙️ How the Solution Works

1. **Onboarding & Authentication:** Users securely sign in via Firebase Authentication. 
2. **Daily Check-ins:** Users log their daily activities through a beautifully crafted, glassmorphic UI. Activities are saved to Firestore and instantly update the daily ring progress chart against a set kg CO2 budget.
3. **AI Bill Scanner:** Users drag-and-drop a receipt into the Scan Modal. The image is passed to the Express backend and fed into the Gemini Vision model, which returns parsed details and calculates emissions.
4. **AI Coach & Challenges:** The backend aggregates the user's weekly logs. The Gemini Pro model consumes this data to generate a customized insight tip and a multi-step Eco-Challenge, tracking completion directly in the UI.
5. **Trends Dashboard:** A 7-day visualization of emission history and budget limits helps users monitor their progress over time.

## 📝 Assumptions Made

- **Standard Emission Factors:** We assume standard, generalized carbon emission factors for calculation (e.g., average kg CO2 per km driven or per meal type), as highly localized data varies wildly.
- **Image Quality:** The AI Bill Scanner assumes the uploaded receipts/bills are reasonably legible.
- **Target Audience:** We assume the user has a basic smartphone or desktop to interact with modern web features (drag-and-drop, animations).

---

## 🏆 Evaluation Focus Areas

### 1. Code Quality (High Impact)
- **Structure & Modularity:** Clean, feature-based architecture (`frontend/src/features/...`). Separate API layers, reusable UI components, and state management via custom hooks.
- **TypeScript First:** Strict type definitions across both the Frontend (React) and Backend (Express) ensure maintainability and predictability.
- **Readability:** Clean, self-documenting code with meaningful variable names and modular CSS (Tailwind + custom internal styling).

### 2. Problem Statement Alignment (High Impact)
The solution fully aligns with building a smart, dynamic assistant. It doesn't just passively store data; it actively interprets the data via Gemini AI to issue tailored challenges, process unstructured image data (bills), and visually coach the user toward a greener lifestyle.

### 3. Security (Medium Impact)
- **Safe Authentication:** All routes are protected by Firebase Auth.
- **Secure API Communication:** The backend uses Firebase ID Token verification (`Authorization: Bearer <token>`) middleware to ensure only authenticated users can access the AI endpoints or log data.
- **Environment Variables:** API keys and sensitive credentials are kept strictly out of the codebase using `.env` configurations and CORS protections.

### 4. Efficiency (Medium Impact)
- **Optimized Resources:** We use real-time Firestore listeners only where necessary to prevent redundant polling. AI challenge states are cached in `localStorage` to drastically reduce unnecessary API calls to the Gemini model and improve load speeds.
- **Bundle Optimization:** Built with Vite for rapid HMR and optimized, minified production builds.

### 5. Testing & Validation (Medium Impact)
We conducted rigorous manual component-wise and feature-wise testing to ensure robustness, fault tolerance, and a flawless user experience.

**Component-Wise Testing:**
- **Auth Flow:** Validated successful Firebase login/logout state persistence, protected route redirects, and seamless token passing to backend APIs.
- **LogModal:** Tested form validation (rejecting negative/NaN values, max limits), category switching behavior, and immediate real-time Firestore synchronization.
- **ScanModal:** Verified Drag-and-Drop boundary interactions, restrictive MIME type validation (allowing only PNG/JPEG/WebP), loading animations during scan, and full state cleanup on close.
- **TrendsModal:** Ensured dynamic chart data accurately aggregates past 7-day logs, properly caps visual heights based on dynamic budget limits, and triggers tooltips accurately.
- **Dashboard Widgets:** Tested live re-renders when local storage (AI Challenge state) or Firestore (Daily Logs/Streak) updates automatically.

**Feature-Wise & AI Integration Testing:**
- **Gemini Vision (Bill Scanner):** Uploaded various low/high-quality receipts. Verified the backend strictly extracts the correct JSON schema out of Gemini's markdown artifacts, and handles unsupported/unclear images gracefully with user-facing error boundaries.
- **Gemini Pro (Coach & Challenges):** Simulated zero-log states, edge cases (user only logs one category), and large log volumes to ensure the prompt reliably outputs the exact JSON payload expected without AI hallucination.
- **Edge Case & Resilience Handling:** Addressed token expirations, implemented fallback UI states for empty data, and ensured robust `disabled` states/spinners on buttons during network requests to prevent duplicate submissions.

### 6. Accessibility (Low Impact)
- **Inclusive Design:** The app features strong color contrast ratios, clear typography (sans-serif modern fonts), and focus states. 
- **Responsive:** Fluidly scales across mobile, tablet, and desktop viewports, ensuring it is usable for all form factors.

---

## 🛠 Tech Stack

**Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, Firebase Auth
**Backend:** Node.js, Express, TypeScript, Google Cloud Gemini API (`@google/genai`), Firebase Admin SDK

*Built for PromptWars 2026. A seamless fusion of beautiful design and intelligent AI to protect our planet.*
