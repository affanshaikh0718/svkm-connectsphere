# Contributing to ConnectSphere (SVKM Ecosystem)

Welcome to the **ConnectSphere** team repository! This document outlines guidelines for collaborating on our DSA full-stack group project.

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or higher)
- **Python** (v3.10+ if developing the FastAPI intelligence service)
- **Git**

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <REPO_URL>
   cd "DSA linkedin"
   ```

2. **Install all monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment variables**:
   ```bash
   cp .env.example .env
   ```
   *(The defaults in `.env.example` work out-of-the-box for local development.)*

4. **Start the embedded PostgreSQL database server**:
   ```bash
   npm run db:server
   ```
   *(Keep this terminal running. It starts a local PostgreSQL instance on port 5432.)*

5. **Sync database tables and seed SVKM test accounts**:
   In a separate terminal:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

6. **Start the development servers**:
   ```bash
   # Start backend API (http://localhost:4000)
   npm run dev --workspace=apps/api

   # Start frontend Next.js app (http://localhost:3000)
   npm run dev --workspace=apps/web
   ```

---

## 🌿 Git Branching & Workflow

To maintain clean project history and avoid merge conflicts:

1. **Always branch from `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<feature-name>
   # or
   git checkout -b fix/<issue-name>
   ```

2. **Commit message conventions**:
   Use conventional commits:
   - `feat(...)`: New feature or user-facing addition
   - `fix(...)`: Bug fix or patch
   - `docs(...)`: Documentation updates
   - `style(...)`: Formatting / CSS adjustments
   - `refactor(...)`: Code refactoring without changing functionality
   - `test(...)`: Unit/integration tests

3. **Verify build before committing**:
   Make sure there are no TypeScript or compilation errors:
   ```bash
   npm run build
   ```

4. **Never commit secrets**:
   - Never commit `.env`, private keys, real passwords, or tokens.
   - All `.env*` files (except `.env.example`) are automatically ignored by `.gitignore`.

5. **Push and Open a Pull Request (PR)**:
   ```bash
   git push origin feature/<feature-name>
   ```
   Then open a PR on GitHub and request a review from your teammate!
