# Career Edge - Developer Guide

## Project Overview

**Career Edge** is an AI-powered recruitment platform connecting job seekers
with companies. It leverages Generative AI to streamline the hiring process,
offering features like AI resume analysis, interview script generation, and
career chat assistance.

## 🛠 Tech Stack

* **Frontend Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components.
* **Backend Services**: [Firebase](https://firebase.google.com/)
  * Authentication
  * Firestore (NoSQL Database)
* **Generative AI**: [Google Genkit](https://firebase.google.com/docs/genkit)
  * Model: `googleai/gemini-3-flash`
* **State Management**: React Context & Server Actions.

## 🚀 Building and Running

### Prerequisites

* Node.js (v20+ recommended)
* npm or yarn

### Development Commands

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run Development Server:**

   Start the Next.js application:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

3. **Run Genkit Developer UI:**

   To develop and test AI flows:

   ```bash
   npm run genkit:dev
   ```

   This starts the Genkit developer UI (usually at `http://localhost:4000`).

4. **Build for Production:**

   ```bash
   npm run build
   ```

5. **Linting:**

   ```bash
   npm run lint
   ```

## 📂 Project Structure

The source code is located in the `src/` directory:

* **`src/ai/`**: Contains Genkit AI flows and configuration.
  * `genkit.ts`: Main Genkit configuration and model definition.
  * `flows/`: Specific AI workflows
    (e.g., `generate-ai-interview-flow.ts`, `resume-analysis-for-job-matching.ts`).
* **`src/app/`**: Next.js App Router directory.
  * `(auth)/`: Authentication routes (login, signup).
  * `(landing)/`: Public marketing pages.
  * `dashboard/`: Protected application routes for Candidates, Companies, and Admins.
  * `actions.ts`: Server Actions for form handling and data mutations.
* **`src/components/`**: React components.
  * `ui/`: Reusable UI components (buttons, inputs, etc.) - mostly ShadCN.
  * `ai-chat-popup.tsx`: AI Chat interface component.
* **`src/context/`**: React Context providers
  (e.g., `candidate-context.tsx`, `company-context.tsx`) for global state.
* **`src/lib/`**: Utilities and configuration.
  * `firebase/`: Firebase initialization and helpers.
  * `utils.ts`: General helper functions.
  * `mock-data.ts`: Placeholder data for development.

## ⚙️ Configuration

* **Firebase**: Configured in `src/lib/firebase/config.ts`. Relies on environment
  configuration (likely handled via Firebase App Hosting or standard env vars).
* **Genkit**: Configured in `src/ai/genkit.ts`.
* **Tailwind**: Configured in `tailwind.config.ts`.
* **Next.js**: Configured in `next.config.ts`.

## 📝 Conventions

* **Component Library**: Use ShadCN UI components from `src/components/ui`
  whenever possible to maintain design consistency.
* **AI Flows**: All AI logic should be encapsulated in Genkit flows within
  `src/ai/flows`.
* **Server Actions**: Use Next.js Server Actions for backend logic and database
  interactions to ensure type safety and security.
