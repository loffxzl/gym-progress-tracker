import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { ProtectedLayout } from './components/layout/ProtectedLayout.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Lazy-loaded route components for dynamic code splitting
const Login = lazy(() => import('./pages/Login.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register.jsx').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })));
const Profile = lazy(() => import('./pages/Profile.jsx').then((m) => ({ default: m.Profile })));
const LogWorkout = lazy(() => import('./pages/LogWorkout.jsx').then((m) => ({ default: m.LogWorkout })));
const WorkoutList = lazy(() => import('./pages/workouts/WorkoutList.jsx').then((m) => ({ default: m.WorkoutList })));
const WorkoutDetails = lazy(() => import('./pages/workouts/WorkoutDetails.jsx').then((m) => ({ default: m.WorkoutDetails })));
const EditWorkout = lazy(() => import('./pages/workouts/EditWorkout.jsx').then((m) => ({ default: m.EditWorkout })));
const ExerciseList = lazy(() => import('./pages/exercises/ExerciseList.jsx').then((m) => ({ default: m.ExerciseList })));
const CreateExercise = lazy(() => import('./pages/exercises/CreateExercise.jsx').then((m) => ({ default: m.CreateExercise })));
const EditExercise = lazy(() => import('./pages/exercises/EditExercise.jsx').then((m) => ({ default: m.EditExercise })));
const BodyWeight = lazy(() => import('./pages/BodyWeight.jsx').then((m) => ({ default: m.BodyWeight })));
const Analytics = lazy(() => import('./pages/Analytics.jsx').then((m) => ({ default: m.Analytics })));
const Settings = lazy(() => import('./pages/Settings.jsx').then((m) => ({ default: m.Settings })));
const AICoach = lazy(() => import('./pages/AICoach.jsx').then((m) => ({ default: m.AICoach })));
const NotFound = lazy(() => import('./pages/NotFound.jsx').then((m) => ({ default: m.NotFound })));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Layout Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/weight" element={<BodyWeight />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/workouts" element={<WorkoutList />} />
              <Route path="/workouts/new" element={<LogWorkout />} />
              <Route path="/workouts/:id" element={<WorkoutDetails />} />
              <Route path="/workouts/:id/edit" element={<EditWorkout />} />
              <Route path="/exercises" element={<ExerciseList />} />
              <Route path="/exercises/new" element={<CreateExercise />} />
              <Route path="/exercises/:id/edit" element={<EditExercise />} />
            </Route>

            {/* 404 Not Found Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
