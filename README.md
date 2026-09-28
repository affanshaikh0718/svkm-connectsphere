# ConnectSphere — SVKM's Professional Network ("LinkedIn for SVKM")

A specialized, full-stack professional networking platform engineered exclusively for the **Shri Vile Parle Kelavani Mandal (SVKM)** ecosystem — empowering students, alumni, faculty, and campus recruiters across MPSTME, DJSCE, NMIMS, Mithibai, and NM College. 100% free and open for the SVKM academic community.

---

## 🏛 System Architecture

ConnectSphere is structured as a **Modular Monolith with a Python Intelligence Microservice**:

```
                  ┌──────────────────────┐
                  │      Next.js 14      │
                  │   Frontend (React)   │
                  └──────────┬───────────┘
                             │
                             │ HTTPS / WSS
                             ▼
                  ┌──────────────────────┐
                  │      NestJS 10       │
                  │    Core REST & WS    │
                  └──────┬───────┬───────┘
                         │       │
              ┌──────────┘       └──────────┐
              ▼                             ▼
       PostgreSQL 16                      Redis 7
     (Prisma ORM, ACID)             (Pub/Sub, Caching)
              │                             │
              ▼                             ▼
       Data Persistence                 Socket.IO
                                     Real-time Chat

                  ┌──────────────────────┐
                  │   Python FastAPI     │
                  │ Intelligence Service │
                  └──────────▲───────────┘
                             │
                             │ Internal HTTP + Secret
                             └────── NestJS Feed/Job Services
```

---

## 🚀 Key Feature Sets

- **Authentication & RBAC**: JWT access tokens (15-min TTL) + refresh token rotation with reuse detection, bcrypt (cost factor 12), and role-based guards (`USER`, `ADMIN`, `SUPER_ADMIN`).
- **Professional Social Graph**: Connection state machine (`PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`), mutual connections calculation, and follow graphs.
- **Content & Post System**: Rich text updates, likes with atomic counters, nested comments, and bookmarking.
- **Python Intelligence Service**:
  - **Feed Ranker**: Transparent scoring algorithm factoring in recency decay, relationship weight, engagement velocity, skill interest matching, and author variety control.
  - **Resume Extractor**: Automated technical skill extraction and confidence mapping from candidate resumes.
  - **Job Matcher**: Skill compatibility matching and qualification gap analysis.
- **Real-Time Messaging**: Socket.IO over WebSockets backed by Redis Pub/Sub for horizontal scalability, read receipts, and typing indicators.
- **Job Portal**: Recruiter job posting, keyword and filter searching, and candidate application tracking.
- **Admin Moderation**: Platform analytics dashboard, user suspension/ban workflows, report reviews, and immutable audit logs.

---

## 📦 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| **Backend API** | NestJS 10, TypeScript, Prisma ORM, Socket.IO, Passport.js, Helmet |
| **Microservice** | Python 3.12, FastAPI, Pydantic v2, Pytest |
| **Databases & Cache** | PostgreSQL 16, Redis 7 |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, GitHub Actions CI |

---

## 🛠 Quick Start (Docker)

1. **Clone the repository and copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Initialize database schema and seed demo data**:
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Access the application**:
   - **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
   - **NestJS API**: [http://localhost:4000](http://localhost:4000)
   - **Python Service Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Demo SVKM Credentials
- **SVKM Admin**: `admin@svkm.ac.in` / `Admin@123`
- **SVKM Student (MPSTME)**: `rohanmehta` (or `rohan.mehta@svkm.ac.in`) / `Password@123`
- **SVKM Alumna (DJSCE)**: `ananyadeshmukh` (or `ananya.deshmukh@svkm.ac.in`) / `Password@123`
- **SVKM Faculty (NMIMS)**: `drkavitapatil` (or `kavita.patil@svkm.ac.in`) / `Password@123`
- **Campus Recruiter (TCS Partner)**: `vikramshah` (or `vikram.shah@tcs.com`) / `Password@123`

---

## 💻 Local Development (Without Docker)

For team members running directly on Windows/macOS/Linux without Docker:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start embedded PostgreSQL database server** (Terminal 1):
   ```bash
   npm run db:server
   ```

4. **Synchronize database schema and seed SVKM data** (Terminal 2):
   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. **Start Frontend & Backend Development Servers**:
   ```bash
   # Start backend API (Terminal 2):
   npm run dev --workspace=apps/api

   # Start frontend web app (Terminal 3):
   npm run dev --workspace=apps/web
   ```

---

## 👥 Group Project Contribution Guide

This repository is configured for multi-contributor academic team workflows. To contribute:

1. **Clone the repository**:
   ```bash
   git clone <REPO_URL>
   cd "DSA linkedin"
   ```

2. **Branching Strategy**:
   - Always create a descriptive branch for your feature or bugfix from `main`:
     ```bash
     git checkout -b feature/your-feature-name
     # or:
     git checkout -b fix/issue-description
     ```

3. **Code Quality & Testing**:
   - Verify TypeScript compilation and building:
     ```bash
     npm run build
     ```
   - Ensure database schema updates are reflected in `prisma/schema.prisma` and applied with `npx prisma db push`.

4. **Commits & Pull Requests**:
   - Keep commits focused and descriptive:
     ```bash
     git add .
     git commit -m "feat(messaging): add unread message count badge"
     ```
   - Push your branch to GitHub and open a Pull Request (PR) against `main`.
   - Have at least one teammate review before merging.

##tejas hii