# 🏋️ Gym Progress Tracker

> **An AI-assisted, agentic full-stack web application for logging workouts, tracking strength progression, analyzing body weight time-series composition, and generating intelligent training insights.**

Built as a modern agentic web application showcase, **Gym Progress Tracker** combines high-performance React UI controls, pure HTTP-Only cookie security, native PostgreSQL enums, and automated personal record (PR) analytics into a distraction-free digital workout notebook.

---

## 🌟 Currently Implemented Features

- **🔐 Pure HTTP-Only Cookie Authentication**: Secure user registration and login utilizing pure HTTP-Only, `SameSite=Strict` cookies, custom header CSRF defense (`X-Requested-With`), IP rate-limiting (`express-rate-limit`), and bcrypt password hashing.
- **⏱️ Live Active Workout Tracker & Rest Timer**: Real-time ticking workout session timer, dynamic exercise/set log controls, set-level notes, and a Web Audio API-assisted circular rest timer modal (30s, 60s, 90s, 120s presets).
- **🏆 Personal Record (PR) Analytics Engine**: Automated calculation of lifetime Highest Weight PR, Best Single Set Volume PR, Highest Workout Session Volume PR, Total Lifetime Volume, and Average Session Duration.
- **⚖️ Time-Series Body Weight Composition**: Log daily weigh-ins, target goal weight trajectories, and 7-day & 30-day rolling averages with responsive SVG line visualizers.
- **📊 Interactive Progression Charts**: Vector SVG chart visualizers rendering workout volume curves, exercise-specific max weight trajectories, and weekly/monthly volume bar charts.
- **🔍 Global Fuzzy Search (`Cmd + K` / `Ctrl + K`)**: Keyboard-driven search querying exercises, past workout titles, set notes, and weigh-in notes instantly using PostgreSQL database indexes.
- **🤖 AI Coach Insights & Plateau Detection**: Rule-assisted plateau detection engine identifying exercises with stalled working weights across 3+ consecutive sessions, paired with an LLM service abstraction.
- **📚 Exercise Library & Native PostgreSQL Enums**: Custom exercise catalog management categorized by native PostgreSQL Enums (`ExerciseCategory`, `EquipmentType`).
- **🌙 Zero-Flash Dark Mode**: Dark-themed UI with system preference auto-detection.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 5
- **Styling**: Vanilla Tailwind CSS (Dark Mode Design System)
- **State Management & Caching**: TanStack React Query v5 (5-minute `staleTime` caching)
- **Form Validation**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20 (ES Modules)
- **Framework**: Express.js v4
- **ORM**: Prisma ORM v5
- **Database**: PostgreSQL 15 (Native Enums & B-Tree Indexes)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **Security & Middlewares**: `helmet`, `express-rate-limit`, `cors`, `compression`, `morgan`
- **Validation**: Zod schema validation (`req.body`, `req.query`, `req.params`)

### Quality Assurance & DevOps
- **Backend Testing**: Vitest + Supertest (53 integration tests)
- **Frontend Testing**: Vitest + React Testing Library + JSDom (11 unit tests)
- **CI/CD**: GitHub Actions pipeline (`.github/workflows/ci.yml`)
- **Containerization**: Multi-stage Dockerfiles + Nginx reverse proxy + Docker Compose

---

## 🏗️ System Architecture

```
React 18 SPA (Vite)
       │
       │ (Axios HTTP Client + X-Requested-With Header + Credentials)
       ▼
Express.js API Pipeline (Port 5001)
       │
       ├── Global XSS Input Sanitizer Middleware
       ├── Rate Limiter & Auth Guards (HTTP-Only Cookie JWT Verification)
       ├── Zod Input Validation Schemas
       ▼
Controller & Service Layer
       │
       ▼
Repository Pattern (Prisma ORM Client v5)
       │
       ▼
PostgreSQL Database (Native Enums & B-Tree Indexes)
```

### Authentication Architecture
1. **User Login / Register**: Client submits credentials to `/api/v1/auth/login` or `/api/v1/auth/register`.
2. **HTTP-Only Cookie**: Server issues a signed JWT token set in a `Set-Cookie: token=...; HttpOnly; SameSite=Strict; Path=/` response header. Tokens are **never** returned in JSON payloads or stored in `localStorage`, eliminating XSS token theft vectors.
3. **CSRF Protection**: Frontend Axios interceptor sends custom `X-Requested-With: XMLHttpRequest` header on all requests. Cross-site form submissions cannot inject custom headers, protecting against CSRF attacks.

---

## 📸 Screenshots

*(Screenshots placeholder section)*

| Dashboard & Metrics | Active Workout Logger |
| :---: | :---: |
| `![Dashboard Placeholder](docs/screenshots/dashboard.png)` | `![Logger Placeholder](docs/screenshots/logger.png)` |

| Analytics & Progress Charts | Body Weight Tracker |
| :---: | :---: |
| `![Analytics Placeholder](docs/screenshots/analytics.png)` | `![Weight Placeholder](docs/screenshots/weight.png)` |

---

## ⚡ Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v15.x` running locally on port 5432 (or via Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/username/gym-progress-tracker.git
cd gym-progress-tracker
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` to point to your local PostgreSQL database:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym_tracker?schema=public"
JWT_SECRET="development-secret-key-replace-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Install Dependencies & Deploy Database Migrations
```bash
# In /backend directory:
npm install
npx prisma migrate dev
npx prisma generate
```

### 4. Configure & Start Frontend
```bash
# In a new terminal tab, navigate to /frontend:
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Start Backend Server
```bash
# In /backend directory:
npm run dev
```

---

## 🔐 Environment Variables

Environment templates are provided in `backend/.env.example` and `frontend/.env.production.example`.

### Required Backend Variables (`.env`)
- `PORT`: Express server port (default: `5001`).
- `NODE_ENV`: Runtime environment (`development`, `test`, `production`).
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key used for signing JWT tokens.
- `JWT_EXPIRES_IN`: JWT expiration duration (e.g. `7d`).
- `CORS_ORIGIN`: Allowed origin for CORS headers (e.g. `http://localhost:5173`).

---

## 🗄️ Database & Prisma Setup

Database schema changes are managed via Prisma Migration CLI:

```bash
# Apply pending database migrations in development
npx prisma migrate dev

# Apply database migrations in production / CI environment
npx prisma migrate deploy

# Regenerate Prisma Client types
npx prisma generate
```

---

## 🧪 Running Tests

### Backend Test Suite (53 Integration Tests)
```bash
cd backend
npm test
npm run lint
```

### Frontend Test Suite (11 Unit Tests & Build Check)
```bash
cd frontend
npm test
npm run lint
npm run build
```

---

## 🐳 Docker Deployment

The application includes production multi-stage `Dockerfile` manifests and a `docker-compose.yml` orchestrator:

```bash
# Build and launch PostgreSQL, Express Backend, and Nginx Frontend containers
docker compose up --build
```

Container startup automatically executes database migrations via `backend/docker-entrypoint.sh` after PostgreSQL healthchecks pass.

---

## 📌 Project Status

**First Agentic Web Application Build**: This project was developed as a production-grade full-stack engineering showcase, leveraging an agentic AI coding pairing workflow. All features, test suites, database migrations, security configurations, and containerization setups have been verified working in code.

---

## 💡 What I Learned

- **React Architecture & State**: Building custom context providers (`AuthContext`), stateful hooks, and decoupling networking logic into reusable API service modules (`authApi`, `workoutApi`, `exerciseApi`, `bodyWeightApi`).
- **PostgreSQL & Prisma Enums**: Restricting domain fields (`ExperienceLevel`, `UnitSystem`, `Theme`, `ExerciseCategory`, `EquipmentType`) directly at the database engine layer with non-destructive SQL migrations (`USING UPPER(...)`).
- **Authentication & Security**: Implementing pure HTTP-Only cookie session persistence, custom header CSRF defense, IP rate-limiting, and server-side resource ownership authorization guards.
- **RESTful API Design**: Structuring clean MVC/Repository layers, standardized error handlers (`ApiError`), and sanitized JSON responses (`ApiResponse`).
- **Testing & Quality Assurance**: Writing behavior-focused integration tests with Supertest and unit component tests with Vitest and React Testing Library.
- **Docker & Production Engineering**: Configuring multi-stage container builds, POSIX PID 1 entrypoint scripts (`exec "$@"`), and GitHub Actions CI automation.
- **AI-Assisted Pair Programming**: Collaborating with agentic AI models to design, audit, debug, test, and document full-stack web applications systematically.

---

## 🚀 Future Improvements

- **1-Rep Max (1RM) Estimator Algorithms**: Implement Brzycki and Epley 1RM projection formulas on exercise performance cards.
- **Workout Routine Templates**: Export and import pre-made training templates (e.g. Push-Pull-Legs, Upper-Lower).
- **Offline PWA Support**: Service worker caching for logging workouts in gym areas with low cellular reception.
- **Social Sharing**: Generate downloadable image cards for Personal Record milestones.
