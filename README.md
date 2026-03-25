# 🤖 CodeReview AI: Your Senior AI Mentor

CodeReview AI is not just a bug-checker; it's a **teaching-focused mentorship platform** designed to help junior developers grow through high-fidelity, actionable code reviews and interactive coaching.

![Landing Page Hero](/C:/Users/Admin/.gemini/antigravity/brain/c0becb58-1447-4c55-a069-a7832281827e/landing_page_hero_1774420161845.png)

## 🌟 Key Features

### 👨‍🏫 Teacher-Student AI Reviews
*   **Contextual Summaries**: Deep dives into project purpose and complexity.
*   **"Why This Matters"**: Educational explanations of why certain practices are problematic.
*   **Better Approach Examples**: High-quality, corrected code snippets for every issue.
*   **Pattern Recognition**: Automatically identifies and badges common design patterns (DRY, Guard Clauses).

### 📋 One-Click "Copy Fixed Code" (New!)
*   Instantly copy AI-suggested corrections to your clipboard with a single click.
*   Designed for rapid student workflows without terminal overhead.

### 🛠️ Advanced .patch Support
*   Generate Git-compatible unified diffs for all AI suggestions.
*   Apply fixes across your entire project with `git apply`.

### 💬 Interactive AI Mentorship
*   Collapsible chat panel to ask follow-up questions about specific review results.
*   On-demand advice for architecture and optimization.

### 🎨 High-Fidelity UI
*   Premium dark-mode aesthetic with Glassmorphism.
*   Integrated **Monaco Editor** (the engine behind VS Code).
*   Dynamic landing page and polished dashboard.

---

## 🏗️ Architecture

*   **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
*   **Backend**: Node.js (Express) + TypeScript.
*   **Database**: PostgreSQL (Drizzle ORM) + Redis for queueing.
*   **AI Engine**: Llama 3.3 via Groq (Zod-enforced structured outputs).
*   **Deployment**: Fully Dockerized (multi-stage builds) with GitHub Actions CI/CD.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Groq API Key

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/CoderOtakuX/codereview-ai.git
   cd codereview-ai
   ```

2. Setup environment variables:
   Create `.env` in `express-typescript-master/`:
   ```env
   GROQ_API_KEY=your_key_here
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/codereview
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your_secret
   ```

3. Fire it up:
   ```bash
   docker compose up -d --build
   ```

4. Access the app:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8080/health-check`

---

## 🛠️ Tech Stack Extras
*   **Zod**: Schema validation.
*   **Pino**: High-performance logging.
*   **Vitest/Jest**: Unit and integration testing.
*   **GitHub Actions**: CI/CD for automated image builds on GHCR.

---

## 📄 License
MIT. Built with ❤️ for the next generation of developers.
