# Product Discovery & Technical Design Document: FitPulse Gym Progress Tracker

---

## 1. Product Discovery & Vision

### Target User
Gymgoers, weightlifters, bodybuilders, and fitness enthusiasts who want a fast, reliable, distraction-free digital workout log to track their sets, weights, reps, and strength progression over time.

### Problem Solved
Traditional paper notebooks are easy to lose and hard to search for past personal records (PRs). Commercial fitness apps are often bloated with ads, require costly monthly subscriptions, or have cumbersome UIs that slow down workout logging between sets.

### What Makes It Useful
FitPulse provides an instant, clean, dark-themed interface designed specifically for mobile and desktop screens in the gym. It allows logging multi-exercise workouts in seconds and displays personal volume progression metrics.

### MVP Scope (Version 1)
- User Authentication (Registration, Login, Protected Routes, JWT Session management).
- Workout Logging (Create, Read, Update, Delete workouts with nested exercises and sets).
- Set Tracking (Log Set Number, Weight in kg, Reps, and Completion status).
- Personal Progress Dashboard (Total Workouts, Total Sets Completed, Total Volume Lifted in kg).
- Responsive Dark Mode UI.

### Postponed Features (Version 2 Scope)
- 1-Rep Max (1RM) estimation calculator algorithms.
- Interactive Line Charts for specific exercise strength curves over time (using Recharts).
- Pre-made exercise template library (e.g., Push-Pull-Legs templates).
- Rest timer countdown modal between sets.
- Social sharing of workout summaries.

---

## 2. Functional Requirements (User Stories)

1. **Authentication**:
   - As a user, I want to create an account so I can securely save my workout history.
   - As a user, I want to log in with my email and password so I can access my private dashboard.
   - As a user, I want to remain logged in across page refreshes via JWT tokens.

2. **Workout Management**:
   - As a user, I want to log a new workout with a title, optional date, and notes so I can keep track of my training focus.
   - As a user, I want to view a list of all my past workouts sorted by date descending.
   - As a user, I want to delete a workout session if I made a mistake or logged duplicate data.

3. **Exercise & Set Logging**:
   - As a user, I want to add multiple exercises to a workout session.
   - As a user, I want to log individual sets under each exercise specifying Weight (kg), Reps, and a Completion checkbox.
   - As a user, I want to dynamically add or remove sets and exercises while editing a workout.

4. **Analytics & Dashboard**:
   - As a user, I want to view high-level metrics (Total Workouts, Total Sets, Total Volume Lifted) on my main dashboard to track overall consistency.

---

## 3. Non-Functional Requirements

- **Performance**: API responses must return in under 150ms. Frontend initial bundle load under 2 seconds.
- **Security**: Passwords hashed with `bcryptjs` (salt rounds = 10). JWT tokens signed with secrets. Input validation enforced with Zod schemas on both frontend and backend to block SQL injection and XSS.
- **Scalability**: Layered architecture (MVC + Repository pattern) decouples HTTP transport from database logic, allowing database queries or ORMs to be swapped or cached easily.
- **Maintainability**: Strict single-responsibility principle across modules, ESLint rules, and Prettier formatting.
- **Error Handling**: Operational errors wrapped in standard `ApiError` format returning consistent JSON structures (`{ success: false, statusCode, message, errors }`).
- **Validation Strategy**: Zod schemas validate `req.body`, `req.query`, and `req.params` before hitting controllers.
- **Responsive Design**: Mobile-first Tailwind CSS layout optimized for smartphone screens during gym workouts.
- **Accessibility**: Semantic HTML5 tags (`nav`, `main`, `form`, `button`), high-contrast dark theme colors, clear input labels, and ARIA attributes.

---

## 4. Database Design (PostgreSQL & Prisma Concepts)

### Tables & Entities

#### 1. `users` Table
- **`id`** (UUID, Primary Key): Unique user identifier.
- **`name`** (VARCHAR(100), Required): User full name.
- **`email`** (VARCHAR(255), Unique, Required): User email address.
- **`password`** (VARCHAR(255), Required): Hashed password.
- **`role`** (ENUM 'USER'|'ADMIN', Default 'USER'): Role authorization.
- **`createdAt`** (TIMESTAMP, Default now()): Creation timestamp.
- **`updatedAt`** (TIMESTAMP, Updated on edit): Last update timestamp.

#### 2. `workouts` Table
- **`id`** (UUID, Primary Key): Unique workout identifier.
- **`title`** (VARCHAR(100), Required): Name of workout session (e.g. "Push Day").
- **`notes`** (TEXT, Optional): Workout notes/reflections.
- **`date`** (TIMESTAMP, Default now()): Date workout was performed.
- **`userId`** (UUID, Foreign Key ➔ `users.id`): References owning user. `onDelete: Cascade`.
- **`createdAt`** (TIMESTAMP), **`updatedAt`** (TIMESTAMP).

#### 3. `exercises` Table
- **`id`** (UUID, Primary Key): Unique exercise item identifier.
- **`name`** (VARCHAR(100), Required): Exercise movement name (e.g. "Bench Press").
- **`order`** (INTEGER, Default 0): Order of exercise within the workout.
- **`workoutId`** (UUID, Foreign Key ➔ `workouts.id`): References parent workout. `onDelete: Cascade`.
- **`createdAt`** (TIMESTAMP), **`updatedAt`** (TIMESTAMP).

#### 4. `exercise_sets` Table
- **`id`** (UUID, Primary Key): Unique set row identifier.
- **`setNumber`** (INTEGER, Required): Set sequence number (e.g. Set 1, Set 2).
- **`weight`** (FLOAT, Default 0): Weight in kilograms.
- **`reps`** (INTEGER, Default 0): Repetitions completed.
- **`isCompleted`** (BOOLEAN, Default false): Completion flag.
- **`exerciseId`** (UUID, Foreign Key ➔ `exercises.id`): References parent exercise. `onDelete: Cascade`.
- **`createdAt`** (TIMESTAMP), **`updatedAt`** (TIMESTAMP).

---

## 5. API Endpoints Specification

| Method | Endpoint | Auth Required | Request Body | Response Payload | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | None | `{ status: "success", timestamp }` | 200 |
| `POST` | `/api/v1/auth/register` | No | `{ name, email, password }` | `{ success: true, data: { user, token } }` | 201, 400 |
| `POST` | `/api/v1/auth/login` | No | `{ email, password }` | `{ success: true, data: { user, token } }` | 200, 401 |
| `GET` | `/api/v1/auth/me` | Yes (Bearer) | None | `{ success: true, data: userProfile }` | 200, 401 |
| `GET` | `/api/v1/workouts` | Yes (Bearer) | None | `{ success: true, data: [ workouts ] }` | 200, 401 |
| `POST` | `/api/v1/workouts` | Yes (Bearer) | `{ title, notes, date, exercises: [...] }` | `{ success: true, data: workout }` | 201, 400, 401 |
| `GET` | `/api/v1/workouts/:id` | Yes (Bearer) | None | `{ success: true, data: workout }` | 200, 401, 403, 404 |
| `PUT` | `/api/v1/workouts/:id` | Yes (Bearer) | `{ title, notes, date }` | `{ success: true, data: updatedWorkout }` | 200, 400, 401, 403, 404 |
| `DELETE` | `/api/v1/workouts/:id` | Yes (Bearer) | None | `{ success: true, message: "..." }` | 200, 401, 403, 404 |

---

## 6. Frontend Pages Architecture

1. **Landing Page (`/login`)**: Login interface with email/password validation.
2. **Register Page (`/register`)**: Account creation interface.
3. **Dashboard Page (`/`)**: High-level analytics metrics (Total Workouts, Total Sets, Total Volume) and recent workout session feed.
4. **Log Workout Page (`/workouts/new`)**: Interactive multi-exercise set logger with dynamic controls to add/remove exercises and sets.
5. **Workout Details Page (`/workouts/:id`)**: Detailed breakdown view of a specific historical workout session.
6. **NotFound Page (`*`)**: 404 fallback page redirecting users safely to dashboard.

---

## 7. React Component Tree Hierarchy

```
App
├── Navbar
│   ├── Logo
│   ├── NavLinks (Dashboard, Log Workout)
│   ├── UserBadge
│   └── LogoutButton
├── ProtectedRoute (Guard)
│   ├── Dashboard Page
│   │   ├── StatMetricCards
│   │   ├── EmptyState
│   │   └── WorkoutHistoryCardList
│   │       └── WorkoutCard
│   │           └── ExerciseSetSummary
│   └── LogWorkout Page
│       ├── WorkoutDetailsForm
│       └── ExerciseList
│           └── ExerciseCard
│               └── SetRowInputGroup
└── PublicRoute (Guard)
    ├── Login Page
    │   └── LoginForm
    └── Register Page
        └── RegisterForm
```

---

## 8. Development Roadmap (1–3 Hour Tickets)

- **Ticket 1**: Project Architecture Setup, ESLint, Prettier, Zod Env Validation, Baseline Express Server & Vite React Setup.
- **Ticket 2**: PostgreSQL Prisma Schema Setup, Foreign Key Relations, Cascading Actions & Migrations.
- **Ticket 3**: Backend Authentication Module (Zod Schemas, bcrypt Hashing, User Repository, Auth Service, Auth Controller & JWT Middleware).
- **Ticket 4**: Backend Workout CRUD Module (Nested Relational Writes in Prisma Repository, Service Ownership Guards, Workout Controller & Routes).
- **Ticket 5**: Frontend Base Setup (Axios Client, JWT Interceptors, Auth Context Provider, Tailwind Dark Theme Tokens).
- **Ticket 6**: Frontend Authentication Views (Login & Register Pages with React Hook Form & Protected Route Guard).
- **Ticket 7**: Frontend Workout Logger & Analytics Dashboard (Dynamic Set/Exercise form inputs, TanStack Query caching, and Metric Cards).
- **Ticket 8**: System Integration, End-to-End Testing & Verification.

---

## 9. Risk Matrix & Mitigations

- **Risk: Port Conflicts (macOS AirPlay binding port 5000)**:
  - *Mitigation*: Configured `.env` to default to `PORT=5001` and updated Vite dev proxy target to `5001`.
- **Risk: Unsecured JWT Storage & Token Expiration**:
  - *Mitigation*: Axios response interceptor auto-clears expired tokens on HTTP 401 and safely redirects user to `/login`.
- **Risk: Nested State Re-render Lag in React Forms**:
  - *Mitigation*: Utilized `react-hook-form` and localized state handlers to prevent full page re-renders on keystroke edits.
- **Risk: Database Orphaned Records on Delete**:
  - *Mitigation*: Defined `onDelete: Cascade` on all relational foreign key schemas in Prisma.

---

## 10. Learning Goals Matrix

| Ticket | New Concepts Learned |
| :--- | :--- |
| **Ticket 1** | Fail-Fast Environment Validation, Vite Proxying, ESLint/Prettier setups, Baseline Architecture. |
| **Ticket 2** | Relational Database Normalization, Foreign Key constraints, Cascading Deletes, Prisma Migration CLI. |
| **Ticket 3** | Password Salt & Hashing with bcrypt, JWT Sign/Verify, Zod schema validation, User Repository pattern. |
| **Ticket 4** | Prisma Atomic Nested Writes (`exercises: { create: [...] }`), Service Ownership Guards (`workout.userId !== userId`). |
| **Ticket 5** | Axios Request Interceptors, React Context Provider pattern, custom hooks (`useAuth`). |
| **Ticket 6** | React Hook Form uncontrolled input validation, Client-side Protected Routes (`<Outlet />` guard). |
| **Ticket 7** | TanStack Query (`useQuery`, `useMutation`, `queryClient.invalidateQueries`), Dynamic Form arrays, Metric Aggregations. |
| **Ticket 8** | Full-stack Integration Testing, Error Diagnosis, Production Readiness. |

---

## 11. Ticket Progress Status

- [x] **Ticket 1: Project Architecture Baseline Setup**
  - **Status**: Completed ✅
  - **Decisions Made**: Configured native ES Modules (`"type": "module"`), `helmet`, `morgan`, `compression`, `cookie-parser`, `cors`, Zod `env` parser (override port 5001), `ApiError`, `ApiResponse`, `asyncHandler`, `.editorconfig`, `.gitignore`, `README.md`, ESLint, Prettier.

- [x] **Ticket 2: User Authentication System**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented bcrypt salt hashing, JWT issuance & verification, Zod auth schemas, `UserRepository`, `AuthService`, `AuthController`, `authenticate` middleware, `AuthContext`, reusable UI components (`Input`, `Button`, `ErrorMessage`, `LoadingSpinner`), and `authApi` Axios layer.

- [x] **Ticket 3: Dashboard Foundation & Application Shell**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented `ProtectedLayout` & `PublicLayout` wrappers using React Router `<Outlet />`, responsive `Sidebar` drawer, `Navbar` with profile badge, reusable `PageHeader`, `StatCard`, `EmptyState`, `LoadingCard` components, nested routes (`/dashboard`, `/profile`), connected to `useAuth()` session.

- [x] **Ticket 4: Workout & Exercise CRUD Backend Module**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented Prisma nested atomic writes, cascading deletes (`ON DELETE CASCADE`), resource ownership authorization guards (`workout.userId !== userId`), Zod schemas (`createWorkoutSchema`), `WorkoutRepository`, `WorkoutService`, `WorkoutController`, and protected `/api/v1/workouts` router.

- [x] **Ticket 5: Exercise Catalog Management (Search, Pagination & Soft Delete)**
  - **Status**: Completed ✅
  - **Decisions Made**: Added `ExerciseLibrary` schema model in Prisma with B-Tree indexes on `name`, `category`, and `isDeleted`. Implemented backend search (`contains` mode `insensitive`), category filtering, offset pagination, soft delete (`isDeleted: true`), Zod validation, `ExerciseList` with search bar & category pills, `CreateExercise` form, `EditExercise` form, `ConfirmDialog` modal, and `exerciseApi` SDK.
  - **Next Ticket**: Ticket 6 (Workout Logger Frontend & TanStack Query Mutations).

- [x] **Ticket 6: Workout Session & Active Workout Live Tracking**
  - **Status**: Completed ✅
  - **Decisions Made**: Updated Prisma schema with `WorkoutStatus` enum (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `startTime`, `endTime`, `duration` (in seconds). Implemented backend `startWorkout` (idempotent), `endWorkout` (duration computation), `getActiveWorkout` endpoints. Built `ActiveWorkoutBanner` with live reactive timer, integrated `LogWorkout.jsx` with active workout session state, workout date picker, notes, exercise/set controls, and TanStack Query state cache invalidation.

- [x] **Ticket 7: Verification & E2E Integration**
  - **Status**: Completed ✅
  - **Decisions Made**: Ran build tests (`npm run build` passed cleanly), verified full-stack architecture, ensured IDOR security guards, soft-delete compliance, and updated documentation (`LEARNING.md`, `PROJECT.md`, `README.md`, `CHANGELOG.md`).

- [x] **Ticket 8: Workout Routes, Workout Details, Edit Page & Rest Timer**
  - **Status**: Completed ✅
  - **Decisions Made**: Registered missing `/workouts/new`, `/workouts/:id`, `/workouts/:id/edit` routes in `App.jsx`. Built `WorkoutDetails.jsx` page displaying volume metrics, duration, notes, and detailed set logs table with edit/delete controls. Built `EditWorkout.jsx` form pre-filling existing session data for updates. Created interactive `RestTimer.jsx` widget with customizable intervals (30s, 60s, 90s, 120s), visual progress ring, and Web Audio API alerts.

- [x] **Ticket 9: Exercise Sets & Relational Deep Dive**
  - **Status**: Completed ✅
  - **Decisions Made**: Added `notes String?` field to `ExerciseSet` model in Prisma schema and ran DB migration push. Extended Zod validation in `workout.validation.js` with `notes: z.string().max(200).optional()`. Updated atomic nested write mappings in `workout.repository.js`. Enhanced `LogWorkout.jsx`, `EditWorkout.jsx`, and `WorkoutDetails.jsx` with set-level notes fields and displays. Documented 1:N relations, Prisma relation syntax, nested writes, and nested reads in `LEARNING.md` Section 17.

- [x] **Ticket 10: Workout History: Search, Filters, Pagination & Prisma Querying**
  - **Status**: Completed ✅
  - **Decisions Made**: Upgraded `findAllByUserId` in `workout.repository.js` to support title/exercise search (`contains` mode `insensitive`), status filtering (`COMPLETED` vs `IN_PROGRESS`), dynamic date sorting (`sortOrder`), offset pagination (`skip`/`take`), and `Promise.all([count, findMany])` query execution. Added `getWorkoutsQuerySchema` Zod validation. Built `WorkoutList.jsx` page at `/workouts` with real-time search, status filter pills, date sorting toggle, pagination bar, and delete confirmation modal. Documented Prisma Querying concepts in `LEARNING.md` Section 18.

- [x] **Ticket 11: Personal Records & SQL Aggregations**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented backend `getAnalytics(userId)` method in `workout.repository.js` computing Highest Weight PR, Best Volume Set PR, Best Workout Session PR, Lifetime Volume, Total Sets, and Average Session Duration. Registered `GET /api/v1/workouts/analytics` endpoint. Built reusable `PRCard.jsx` component displaying trophy badges, exercise details, weight values, and dates. Integrated Personal Records section into `Dashboard.jsx`. Documented SQL Aggregations (`MAX`, `SUM`, `AVG`, `COUNT`, `GROUP BY`) in `LEARNING.md` Section 19.

- [x] **Ticket 12: Body Weight Tracking & Time-Series Analytics**
  - **Status**: Completed ✅
  - **Decisions Made**: Added `model BodyWeight` and `goalWeight Float?` on `User` model in `schema.prisma`. Implemented backend repository, service, controller, and routes for `/api/v1/body-weight` computing Current Weight, Goal Weight, Weight Difference, 7-day Weekly Rolling Average, and 30-day Monthly Rolling Average. Created `bodyWeightApi.js`, `BodyWeightChart.jsx` (interactive SVG time-series line chart), `BodyWeight.jsx` tracker page at `/weight`, log forms, and history list. Appended Section 20 (Time-Series Data) to `LEARNING.md`.

- [x] **Ticket 13: Dashboard Consolidation & Multi-Metric Dashboard**
  - **Status**: Completed ✅
  - **Decisions Made**: Extended backend `getAnalytics(userId)` in `workout.repository.js` to compute `weeklyWorkouts` (past 7 days) and `monthlyWorkouts` (past 30 days). Consolidated `Dashboard.jsx` using TanStack Query parallel fetching for workouts, analytics, and body weight metrics. Implemented 6 key stat cards (Total Workouts, Weekly Progress, Monthly Progress, Average Duration, Current Weight vs Goal, Total Volume Lifted), Personal Records grid, Body Weight overview section with mini SVG time-series line chart, Recent Workouts feed, skeleton loading states, error alert banners with retry button, and empty states.

- [x] **Ticket 14: Analytics Charts & Chart Optimization**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented `getChartAnalytics(userId)` in `workout.repository.js` aggregating workout session volumes, past 8 weeks volume, past 6 months volume, and per-exercise strength trajectories. Registered `GET /api/v1/workouts/analytics/charts`. Created `VolumeChart.jsx` (session volume curve), `WeeklyMonthlyVolumeChart.jsx` (bar chart), `ExerciseProgressChart.jsx` (exercise dropdown + strength curve), `Analytics.jsx` page at `/analytics` with tab filters, registered `/analytics` in `App.jsx`, and added "Analytics" link in `Navbar.jsx`. Appended Section 21 (Chart Optimization) to `LEARNING.md`.

- [x] **Ticket 15: Global Search Engine & Database Indexing Optimization**
  - **Status**: Completed ✅
  - **Decisions Made**: Added database B-tree indexes to `schema.prisma` (`Workout.title`, `Exercise.workoutId`, `Exercise.name`, `ExerciseSet.exerciseId`, `ExerciseSet.notes`) and ran `npx prisma db push`. Built backend `searchRepository.globalSearch(userId, query)` running parallel sub-queries across Exercises, Workouts, Set Notes, and Body Weight notes. Registered `/api/v1/search` route in `app.js`. Built `searchApi.js`, `GlobalSearchModal.jsx` modal supporting `Cmd+K` keyboard shortcut, input autofocus, debounced search, categorized result lists, and direct result navigation. Appended Section 22 (Database Indexing) to `LEARNING.md`.

- [x] **Ticket 16: Profile Management & Athlete Settings**
  - **Status**: Completed ✅
  - **Decisions Made**: Added profile fields to `User` model in `schema.prisma` (`height`, `experience`, `units`, `timezone`, `avatarUrl`) and applied `npx prisma db push`. Built `updateProfile` in `user.repository.js`, `auth.service.js`, `auth.controller.js`, `auth.routes.js` (`PUT /api/v1/auth/profile`), and `updateProfileSchema` Zod validator. Updated `authApi.js` and `AuthContext.jsx` (`updateUser`). Re-architected `Profile.jsx` with Avatar Placeholder (gradient initials badge / URL preview), physical stats summary, and interactive Edit Profile form with real-time session update.

- [x] **Ticket 27: Phase 2 — Authentication & Security Hardening**
  - **Status**: Completed ✅
  - **Decisions Made**: Converted authentication to Pure HTTP-Only cookie strategy (`SameSite: Strict`, `HttpOnly: true`, `Secure: production`). Omitted token from JSON response bodies and eliminated `localStorage` token storage across frontend `AuthContext.jsx` and `axiosClient.js`. Configured `axiosClient.js` with `withCredentials: true` and `X-Requested-With: XMLHttpRequest` custom CSRF defense header. Applied `express-rate-limit` middleware (`loginRateLimiter` & `registerRateLimiter`) to `/api/v1/auth/login` and `/api/v1/auth/register` returning HTTP 429. Sanitized 500 error messages in `errorHandler.js` in production mode. Built `backend/tests/auth.test.js` with 15 test cases passing 100% cleanly.

- [x] **Ticket 28: Phase 3 — Database & Prisma Schema Hardening**
  - **Status**: Completed ✅
  - **Decisions Made**: Replaced unconstrained `String` columns in Prisma schema (`User.experience`, `User.units`, `User.theme`, `ExerciseLibrary.category`, `ExerciseLibrary.equipment`) with PostgreSQL/Prisma Native Enums (`ExperienceLevel`, `UnitSystem`, `Theme`, `ExerciseCategory`, `EquipmentType`). Created SQL migration script `20260915120000_add_enums` with non-destructive data conversion (`UPPER(category)`, `UPPER(equipment)`). Updated Zod validation schemas, backend search and exercise repositories, and frontend components (`CreateExercise`, `EditExercise`, `ExerciseList`, `Profile`). Audited database B-Tree indexes and wrote backend integration tests (`enums.test.js`).

- [x] **Ticket 29: Phase 4 — Testing, Production Hardening & Deployment**
  - **Status**: Completed ✅
  - **Decisions Made**: Implemented 9 backend integration test suites (53 tests total) covering Auth, Exercises, Workouts, Body Weight, Analytics, Search, AI Coach, and Server-Side Ownership Guards. Implemented 5 frontend unit test suites (11 tests total) covering Login, Register, ProtectedRoute, Input, and Button. Configured production Docker architecture with executable `docker-entrypoint.sh` executing `npx prisma migrate deploy` before server startup. Built `.github/workflows/ci.yml` GitHub Actions pipeline for automated linting, testing, and production build checks. Initialized Git repository with comprehensive `.gitignore`.









