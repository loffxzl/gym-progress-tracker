# Changelog - FitPulse Gym Progress Tracker

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.4] - 2026-09-15 (Phase 4 — Testing, Production Hardening & Deployment)

### Testing & Quality Assurance
- **Full Backend Integration Suite**: Created 9 integration test files (53 tests total) covering Auth, Exercises, Workouts, Body Weight, Analytics, Search, AI Coach, and Server-Side Ownership Security Guards (`workout.test.js`, `bodyWeight.test.js`, `analytics.test.js`, `search.test.js`, `aiCoach.test.js`, `enums.test.js`, `auth.test.js`, `health.test.js`, `sanitization.test.js`). Passed 100% of assertions.
- **Frontend Component & Page Test Suite**: Built 5 unit test files (11 tests total) covering Login, Register, ProtectedRoute, Input, and Button components using Vitest, `@testing-library/react`, and `@testing-library/jest-dom`. Passed 100% of assertions.
- **Server-Side Authorization Audit**: Verified that User B attempts to perform `GET`, `PUT`, or `DELETE` operations on User A's private workouts, body weight entries, or profile settings are strictly blocked with HTTP `403 Forbidden` / `404 Not Found` responses.

### Deployment & CI Pipeline
- **Docker Production Container Startup**: Created executable `backend/docker-entrypoint.sh` wrapper script executing `npx prisma migrate deploy` before launching `node src/server.js`. Configured `ENTRYPOINT` and `exec "$@"` to preserve POSIX PID 1 signal handling.
- **GitHub Actions CI Pipeline**: Built `.github/workflows/ci.yml` orchestrating PostgreSQL 15 container services, database migrations, backend ESLint, backend integration tests, frontend ESLint, frontend unit tests, and frontend production build compilation.
- **Git Repository & Secrets Security**: Initialized Git repository on `main` branch, created comprehensive `.gitignore` filtering `.env`, `node_modules`, `dist`, and logs. Audit confirmed zero hardcoded secrets.

---

## [1.0.3] - 2026-09-15 (Phase 3 — Database & Prisma Schema Hardening)

### Database Integrity & Schema Hardening
- **PostgreSQL & Prisma Native Enums**: Converted unconstrained `String` columns in `schema.prisma` to native PostgreSQL Enums: `ExperienceLevel` (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`), `UnitSystem` (`KG`, `LBS`), `Theme` (`DARK`, `LIGHT`, `SYSTEM`), `ExerciseCategory` (`CHEST`, `BACK`, `LEGS`, `SHOULDERS`, `ARMS`, `CORE`, `CARDIO`, `FULL_BODY`), and `EquipmentType` (`BARBELL`, `DUMBBELL`, `CABLE`, `MACHINE`, `BODYWEIGHT`, `BAND`, `OTHER`).
- **Idempotent SQL Migration (`20260915120000_add_enums`)**: Created SQL migration script converting active database string columns non-destructively using `USING UPPER("col")::"EnumType"`, preserving 100% of existing user profiles and exercise catalog records.
- **Validation & Repository Alignment**: Updated Zod validation schemas (`exercise.validation.js`, `auth.validation.js`), backend search repository (`search.repository.js`), exercise repository (`exercise.repository.js`), and frontend forms (`CreateExercise.jsx`, `EditExercise.jsx`, `ExerciseList.jsx`, `Profile.jsx`) to enforce strict Enum domain keys while displaying title-cased labels in the UI.
- **Index Audit & Integration Testing**: Audited database B-Tree composite indexes. Built `backend/tests/enums.test.js` verifying enum validation, database creation, profile updating, and query filtering.

---

## [1.0.2] - 2026-09-15 (Phase 2 — Authentication & Security Hardening)

### Security & Hardening
- **Pure HTTP-Only Cookie Authentication Strategy**: Standardized session management on pure HTTP-Only cookies (`HttpOnly: true`, `SameSite: Strict`, `Secure: production`, `Path: /`, `Max-Age: 7d`). Removed token strings from JSON response payloads and eliminated all `localStorage` token storage across `AuthContext.jsx` and `axiosClient.js`, eliminating XSS token theft vectors.
- **Custom Header CSRF Defense**: Configured `axiosClient.js` with `X-Requested-With: XMLHttpRequest` header and `withCredentials: true`. Standard cross-site forms and tags cannot set custom HTTP headers, protecting against CSRF attacks.
- **Authentication Endpoint Rate Limiting**: Integrated `express-rate-limit` middleware (`loginRateLimiter`: 5 attempts per 15 min, `registerRateLimiter`: 5 attempts per 1 hour) returning HTTP 429 Too Many Requests (`ApiError.tooManyRequests`) to block brute-force attacks on `/api/v1/auth/login` and `/api/v1/auth/register`.
- **Production Error Payload Sanitization**: Hardened global `errorHandler.js` middleware to sanitize non-operational 500 internal error messages to generic `'Internal Server Error'` in production mode, preventing database schemas and stack trace leaks.
- **Comprehensive Auth Test Suite**: Built `backend/tests/auth.test.js` containing 15 tests covering registration, login, rate limiting, `/auth/me` session hydration, expired tokens, invalid signatures, and logout behavior.

---

## [1.0.1] - 2026-09-15 (Phase 1 — Critical Bug Fixes & Audit Remediation)

### Fixed
- **Body Weight Validation Schema (`POST /api/v1/body-weight` & `PUT /api/v1/body-weight/goal`)**: Wrapped Zod schemas in `createBodyWeightSchema`, `updateGoalWeightSchema`, and `getBodyWeightQuerySchema` inside root `body:` and `query:` objects in `bodyWeight.validation.js` to align with `validate.js` middleware expectations, resolving HTTP 400 validation failures.
- **AI Coach Insights Crash (`GET /api/v1/ai-coach/insights`)**: Updated `aiCoach.service.js` to call existing `workoutRepository.findAllByUserId(userId, { limit: 100 })` and `workoutRepository.getAnalytics(userId)` methods instead of invoking non-existent `findAll` and `getPersonalRecords`, resolving HTTP 500 runtime server errors.
- **Frontend ESLint Build Scanner (`npm run lint`)**: Created `frontend/.eslintignore` containing `dist` and `node_modules` entries, ensuring `npm run lint` ignores compiled output bundles and completes with 0 errors.

---

## [1.0.0] - 2026-09-15 (Version 1.0.0 Official Release)

### Added - Production Engineering & GitHub Release
- **Full Testing Suite**: Installed `vitest`, `supertest`, `@testing-library/react`, and `jsdom` across backend and frontend services. Created unit and integration test suites passing 100% of assertions.
- **Manual Testing Matrix**: Created [`manual_test_checklist.md`](file:///Users/shameem./.gemini/antigravity-ide/brain/d54c1420-193d-44a4-81bd-1b7088254b3b/manual_test_checklist.md) covering 6 critical user flows.
- **Production Containerization**: Multi-stage `Dockerfile` for Express backend (Node 20 Alpine) and multi-stage `Dockerfile` + `nginx.conf` for Vite frontend with SPA routing fallbacks and Gzip compression.
- **Full-Stack Orchestration**: Created `docker-compose.yml` orchestrating PostgreSQL database, Express backend container, and Nginx frontend container.
- **Health Checks & Monitoring**: Enhanced `/health` route with PostgreSQL connection query status.
- **Performance Tuning**: Configured Rollup `manualChunks` in `vite.config.js`, route-based dynamic code-splitting (`React.lazy()`), React Query 5-minute `staleTime` caching, and PostgreSQL B-Tree composite database indexes.
- **Form Validation & Security**: Created global XSS input sanitization middleware (`sanitize.js`), strict Zod schema range bounds (weight 1-1000, height 30-300, non-future dates), and structured field error formatting.
- **Centralized Error Handling**: Built React `ErrorBoundary`, `NotFound` 404 route, `ErrorState` components, structured `logger.js` utility, and Axios 401 token expired auto-redirects.
- **Documentation**: 30-section comprehensive technical engineering handbook in [`LEARNING.md`](file:///Users/shameem./Developer/antigravity/test/LEARNING.md) and open-source [`README.md`](file:///Users/shameem./Developer/antigravity/test/README.md).
- **Prisma Schema & Database**:
  - Added `height` (Float), `experience` (String default "INTERMEDIATE"), `units` (String default "KG"), `timezone` (String default "UTC"), and `avatarUrl` (String) to `User` model in `schema.prisma`. Executed `npx prisma db push`.
- **Backend API**:
  - `PUT /api/v1/auth/profile`: Endpoint updating user profile settings.
  - Added `updateProfileSchema` in `auth.validation.js`, `updateProfile` in `user.repository.js`, `auth.service.js`, `auth.controller.js`, `auth.routes.js`.
- **Frontend Views & Auth Context**:
  - [`Profile.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/Profile.jsx): Re-architected Profile page with Avatar Placeholder (gradient initials badge / image URL preview), athlete details cards (Height, Current Weight, Goal Weight, Experience Level, Units, Timezone), and interactive Edit Profile form with alert feedback.
  - [`AuthContext.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/context/AuthContext.jsx): Added `updateUser` method to refresh user session state in React Context in real-time.
  - [`authApi.js`](file:///Users/shameem./Developer/antigravity/test/frontend/src/api/authApi.js): Added `updateProfile(data)` client SDK call.

### Added - Global Search Engine & Database Indexing Optimization
- **Prisma Schema & Database Indexes**:
  - Added B-tree indexes to `schema.prisma` (`Workout.title`, `Exercise.workoutId`, `Exercise.name`, `ExerciseSet.exerciseId`, `ExerciseSet.notes`) and applied `npx prisma db push`.
- **Backend Global Search API**:
  - `GET /api/v1/search?q=query`: Executes parallel sub-queries across Exercises, Workouts, Set Notes, and Body Weight weigh-in notes using `Promise.all()`.
  - Added `search.repository.js`, `search.service.js`, `search.controller.js`, `search.routes.js`, and registered `/api/v1/search` in `app.js`.
- **Frontend Search Experience**:
  - [`GlobalSearchModal.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/common/GlobalSearchModal.jsx): Search modal supporting `Cmd+K` / `Ctrl+K` keyboard hotkeys, autofocus, debounced search, categorized result sections (Exercises, Workouts, Set Notes, Weight Notes), and direct navigation links.
  - [`Navbar.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/Navbar.jsx): Integrated Global Search trigger button with `⌘K` keyboard badge.
  - [`LEARNING.md`](file:///Users/shameem./Developer/antigravity/test/LEARNING.md): Appended Section 22 covering Database Indexing (B-Tree Indexes, Query Execution Plans `EXPLAIN ANALYZE`, Full-Text Search vs ILIKE, composite indexes, write penalties, and index-only scans).

### Added - Analytics Charts & Chart Optimization
- **Backend Analytics Aggregations**:
  - `GET /api/v1/workouts/analytics/charts`: Computes workout session volume history, weekly aggregated volume (past 8 weeks), monthly aggregated volume (past 6 months), and per-exercise max weight & volume strength trajectories.
  - Added `getChartAnalytics(userId)` in [`workout.repository.js`](file:///Users/shameem./Developer/antigravity/test/backend/src/repositories/workout.repository.js), [`workout.service.js`](file:///Users/shameem./Developer/antigravity/test/backend/src/services/workout.service.js), and [`workout.controller.js`](file:///Users/shameem./Developer/antigravity/test/backend/src/controllers/workout.controller.js).
- **Frontend Views & Custom SVG Components**:
  - [`VolumeChart.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/VolumeChart.jsx): Responsive SVG line/area chart visualizing workout session volume trajectories with glow effects, fill gradients, and tooltips.
  - [`WeeklyMonthlyVolumeChart.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/WeeklyMonthlyVolumeChart.jsx): Responsive SVG bar chart visualizing weekly and monthly aggregated training volume.
  - [`ExerciseProgressChart.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/ExerciseProgressChart.jsx): Interactive exercise dropdown selector + SVG curve tracking max weight and set volume progression for individual movements.
  - [`Analytics.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/Analytics.jsx): Analytics page layout at `/analytics` organizing all 5 charts (Workout Volume, Weight Progress, Exercise Progress, Weekly Volume, Monthly Volume) with tab navigation filters.
  - [`App.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/App.jsx): Registered `/analytics` route under `ProtectedLayout`.
  - [`Navbar.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/Navbar.jsx): Added navigation link to `/analytics`.
  - [`LEARNING.md`](file:///Users/shameem./Developer/antigravity/test/LEARNING.md): Appended Section 21 covering Chart Optimization (Vector SVG vs Raster Canvas, Data Downsampling LTTB algorithm, React `useMemo` coordinate caching, CSS GPU acceleration `will-change`, and viewBox scaling).

### Added - Dashboard Integration & Connected Metrics
- **Backend Analytics Extension**:
  - Updated `getAnalytics(userId)` in [`workout.repository.js`](file:///Users/shameem./Developer/antigravity/test/backend/src/repositories/workout.repository.js) to compute `weeklyWorkouts` (workouts completed in the last 7 days) and `monthlyWorkouts` (workouts completed in the last 30 days).
- **Frontend Dashboard Consolidation**:
  - [`Dashboard.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/Dashboard.jsx): Re-architected Dashboard view to fetch workouts, analytics, and body weight metrics in parallel using TanStack Query.
  - **6 Core Stat Cards**: Displaying Total Workouts, Weekly Progress (past 7 days), Monthly Progress (past 30 days), Average Session Duration, Current Body Weight (vs Goal Weight), and Total Volume Lifted.
  - **Personal Records (PRs)**: Integrated PR cards grid displaying Highest Weight Lifted, Best Set Volume, and Best Session Volume.
  - **Body Weight Overview**: Integrated Body Weight section displaying Current Weight, Goal Target, Weight Difference, Weekly Average, Monthly Average, mini SVG time-series line chart preview, and link to `/weight`.
  - **Recent Workouts Feed**: Displaying completed workouts with title, date, duration, notes, and exercise set summaries.
  - **Loading, Error & Empty States**: Added skeleton card placeholders, interactive error notification banners with a "Retry Sync" button trigger (`refetch()`), and clear onboarding empty states.

### Added - Body Weight Tracking & Time-Series Analytics
- **Prisma Schema**: Added `model BodyWeight` with `id`, `weight`, `date`, `notes`, `userId` (`onDelete: Cascade` & `@@index([userId, date])`) and added `goalWeight Float?` to `User` model. Executed `npx prisma db push`.
- **Backend API & Analytics Engine**:
  - `POST /api/v1/body-weight`: Log new body weight entry.
  - `GET /api/v1/body-weight`: Retrieve time-series history & computed statistics (Current Weight, Goal Weight, Weight Difference, 7-day Weekly Rolling Average, 30-day Monthly Rolling Average).
  - `PUT /api/v1/body-weight/goal`: Set/update user goal weight target.
  - `DELETE /api/v1/body-weight/:id`: Delete log entry with ownership guard.
  - Added `bodyWeight.validation.js`, `bodyWeight.repository.js`, `bodyWeight.service.js`, `bodyWeight.controller.js`, `bodyWeight.routes.js`.
- **Frontend Views & Components**:
  - [`bodyWeightApi.js`](file:///Users/shameem./Developer/antigravity/test/frontend/src/api/bodyWeightApi.js): Axios API client methods.
  - [`BodyWeightChart.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/BodyWeightChart.jsx): Responsive SVG time-series line chart with filled gradient area, data node rings, date labels, hover tooltips, and goal weight reference line.
  - [`BodyWeight.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/BodyWeight.jsx): Body weight tracking page at `/weight` featuring 5 stat cards (Current Weight, Goal Weight, Weight Difference, Weekly Average, Monthly Average), SVG time-series line chart, log weight modal form, goal weight target modal form, and history log table with delete controls.
  - [`Navbar.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/Navbar.jsx): Added navigation link to `/weight`.
  - [`LEARNING.md`](file:///Users/shameem./Developer/antigravity/test/LEARNING.md): Appended Section 20 covering Time-Series Data, rolling window aggregations, trajectory analytics, and composite time indexing.

### Added - Personal Records & Analytics Engine
- **Backend API & Analytics Calculation**:
  - `GET /api/v1/workouts/analytics`: Calculates lifetime Personal Records including Highest Weight PR (`max(weight)`), Best Single Set Volume (`weight * reps`), Highest Volume Session (`max(sum(weight * reps))`), Total Lifetime Volume, Total Sets, and Average Session Duration.
  - Added `getAnalytics(userId)` in `workout.repository.js` and `workout.service.js`.
- **Frontend PR Experience**:
  - [`PRCard.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/PRCard.jsx): Reusable Personal Record Card component with trophy badges, weight tags, exercise names, and date links.
  - [`Dashboard.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/Dashboard.jsx): Integrated Personal Records PR cards grid displaying real-time analytics.

### Added - Workout History Module (Search, Filters, Pagination & Prisma Querying)
- **Backend Query Processing**:
  - `GET /api/v1/workouts`: Accepts `search`, `status`, `page`, `limit`, `sortOrder` query parameters.
  - Enhanced `findAllByUserId` in `workout.repository.js` with case-insensitive title and nested exercise name search (`mode: 'insensitive'`), status filtering, `orderBy: { date: sortOrder }`, offset pagination (`skip`, `take`), and concurrent `Promise.all([count, findMany])` execution.
  - Added `getWorkoutsQuerySchema` Zod validator in `workout.validation.js`.
- **Frontend Views**:
  - [`WorkoutList.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/workouts/WorkoutList.jsx): Full Workout History page at `/workouts` with live search bar, status filter pills (`ALL`, `COMPLETED`, `IN_PROGRESS`), Date Sort Order toggle (`Newest First` vs `Oldest First`), pagination bar controls, and delete confirmation modal.
  - [`Navbar.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/Navbar.jsx): Added navigation link to `/workouts`.

### Added - Exercise Sets & Set-Level Notes
- **Prisma Schema**: Added `notes String?` field to `ExerciseSet` model for logging set-specific notes (e.g., warmup, PR, drop set) and applied `npx prisma db push`.
- **Validation & Data Layer**:
  - Extended Zod `exerciseSetSchema` in `workout.validation.js` with `notes: z.string().max(200).optional()`.
  - Updated atomic nested writes in `workout.repository.js` to create and update set-level notes.
- **Frontend Views**:
  - Updated set table headers and input rows in [`LogWorkout.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/LogWorkout.jsx) and [`EditWorkout.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/workouts/EditWorkout.jsx) to support set-level notes.
  - Updated set breakdown table in [`WorkoutDetails.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/workouts/WorkoutDetails.jsx) to display set notes badges.

### Added - Workout Details, Edit Page & Rest Timer Widget
- **Frontend Views & Navigation**:
  - [`WorkoutDetails.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/workouts/WorkoutDetails.jsx): Single workout session viewer displaying date, duration, notes, summary metrics (Exercises, Sets, Volume), and detailed set breakdown table with delete confirmation modal.
  - [`EditWorkout.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/workouts/EditWorkout.jsx): Workout editing page pre-filling existing session data, exercise names, weights, and reps.
  - [`RestTimer.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/RestTimer.jsx): Interactive rest interval timer widget with 30s, 60s, 90s, 120s presets, visual countdown progress bar, pause/resume/reset/add+30s controls, and Web Audio API tone synthesis.
  - [`App.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/App.jsx): Registered `/workouts/new`, `/workouts/:id`, and `/workouts/:id/edit` routes under `ProtectedLayout`.

### Added - Workout Session & Live Active Tracking
- **Prisma Schema**: Added `WorkoutStatus` enum (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `startTime`, `endTime`, and `duration` (in seconds) fields to the `Workout` table.
- **Backend API**:
  - `POST /api/v1/workouts/start`: Initializes a live workout session idempotently with status `IN_PROGRESS` and records `startTime`.
  - `PUT /api/v1/workouts/:id/end`: Calculates session duration based on `endTime - startTime`, saves final exercises and sets, and updates status to `COMPLETED`.
  - `GET /api/v1/workouts/active`: Retrieves user's active in-progress workout session.
- **Frontend Active Workout Experience**:
  - [`ActiveWorkoutBanner.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/workout/ActiveWorkoutBanner.jsx): Top banner with animated indicator and live timer calculating elapsed seconds (`hh:mm:ss`).
  - [`LogWorkout.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/LogWorkout.jsx): Enhanced workout logger supporting live active timer, auto-populated session state, workout date selector, notes, exercises, sets, and End Workout action.
  - [`Dashboard.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/Dashboard.jsx): Displays live active banner, start session trigger, and workout history feed with computed volume metrics and duration formatters.

### Added - Exercise Management Module
- **Prisma Model**: Added `ExerciseLibrary` schema model supporting categories (`Chest`, `Back`, `Legs`, `Shoulders`, `Arms`, `Core`), equipment, notes, user association, soft-deletions (`isDeleted: true`, `deletedAt`), and database indexes on `name`, `category`, and `isDeleted`.
- **Backend API**:
  - `GET /api/v1/exercises`: Search (`?search=bench`), category filter (`?category=Chest`), and pagination (`?page=1&limit=8`).
  - `GET /api/v1/exercises/:id`: Fetch single exercise detail.
  - `POST /api/v1/exercises`: Create custom user exercises.
  - `PUT /api/v1/exercises/:id`: Update custom exercises with ownership check.
  - `DELETE /api/v1/exercises/:id`: Soft-delete custom exercises (`isDeleted: true`).
- **Frontend Views**:
  - [`ExerciseList.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/exercises/ExerciseList.jsx): Real-time search bar, category pill filters, pagination controls, System vs Custom badges.
  - [`CreateExercise.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/exercises/CreateExercise.jsx): Custom exercise creation form with Zod/react-hook-form validation.
  - [`EditExercise.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/pages/exercises/EditExercise.jsx): Custom exercise editing form.
  - [`ConfirmDialog.jsx`](file:///Users/shameem./Developer/antigravity/test/frontend/src/components/common/ConfirmDialog.jsx): Accessible confirmation modal dialog for soft-deletions.

---

## [1.0.0] - Foundational Setup & Authentication

### Added
- **Project Setup**: Node.js Express, ES Modules, Prisma ORM, PostgreSQL database sync, Zod env loader (port 5001 override), Vite React SPA, Tailwind CSS dark design system.
- **Security & Middlewares**: Helmet HTTP security headers, Morgan request logger, Gzip response compression, Cookie parser, CORS policy, `ApiError` class, `ApiResponse` class, `asyncHandler` wrapper.
- **Authentication System**: User registration, bcrypt salt password hashing (10 rounds), JWT token signing & verification, HTTP-Only auth cookies, `useAuth()` Context Provider, `ProtectedRoute` guard wrapper.
- **Application Shell**: `ProtectedLayout` & `PublicLayout` wrappers using React Router `<Outlet />`, responsive `Sidebar` drawer, `Navbar` user profile badge, `PageHeader`, `StatCard`, `EmptyState`, `LoadingCard`.
