import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import { workoutApi } from "../api/workoutApi.js";
import { bodyWeightApi } from "../api/bodyWeightApi.js";
import { PageHeader } from "../components/common/PageHeader.jsx";
import { StatCard } from "../components/common/StatCard.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.jsx";
import { ActiveWorkoutBanner } from "../components/workout/ActiveWorkoutBanner.jsx";
import { PRCard } from "../components/workout/PRCard.jsx";
import { BodyWeightChart } from "../components/workout/BodyWeightChart.jsx";
import {
  Dumbbell,
  Flame,
  Trophy,
  PlusCircle,
  Calendar,
  Clock,
  Trash2,
  Award,
  Zap,
  Scale,
  Activity,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Workouts Feed
  const {
    data: workoutsResponse,
    isLoading: isLoadingWorkouts,
    isError: isErrorWorkouts,
    error: workoutsError,
    refetch: refetchWorkouts,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => workoutApi.getWorkouts({ limit: 5 }),
  });

  // Fetch Analytics & PRs
  const {
    data: analyticsResponse,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => workoutApi.getAnalytics(),
  });

  // Fetch Body Weight Metrics
  const {
    data: weightResponse,
    isLoading: isLoadingWeight,
    isError: isErrorWeight,
    error: weightError,
    refetch: refetchWeight,
  } = useQuery({
    queryKey: ["bodyWeight"],
    queryFn: () => bodyWeightApi.getWeightData(),
  });

  // Mutations
  const startMutation = useMutation({
    mutationFn: () => workoutApi.startWorkout({ title: "Quick Workout Session" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
      navigate("/workouts/new");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workoutApi.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  // Extract Payloads
  const analytics = analyticsResponse?.data || {};
  const weightData = weightResponse?.data?.data || { summary: {}, chartData: [] };
  const weightSummary = weightData.summary || {};

  const rawWorkouts = workoutsResponse?.data;
  const workoutsList = Array.isArray(rawWorkouts) ? rawWorkouts : rawWorkouts?.items || [];
  const completedWorkouts = workoutsList.filter((w) => w.status === "COMPLETED");

  const isLoadingAny = isLoadingWorkouts || isLoadingAnalytics || isLoadingWeight;
  const isErrorAny = isErrorWorkouts || isErrorAnalytics || isErrorWeight;

  const handleRefetchAll = () => {
    refetchWorkouts();
    refetchAnalytics();
    refetchWeight();
  };

  const formatDuration = (secs) => {
    if (!secs) return "0 mins";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  return (
    <div className="space-y-8">
      {/* Active Workout Banner */}
      <ActiveWorkoutBanner />

      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.name || "Athlete"}! 👋`}
        description="Your personal workout activity, personal records, and body weight progression dashboard."
        action={
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm disabled:opacity-50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start Workout Session</span>
          </button>
        }
      />

      {/* Error Alert Banner */}
      {isErrorAny && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between text-rose-200 text-sm shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-rose-100">Unable to sync some dashboard metrics</p>
              <p className="text-xs text-rose-300/80">
                {workoutsError?.message || analyticsError?.message || weightError?.message || "Network connectivity error."}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefetchAll}
            className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border border-rose-700/50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Sync</span>
          </button>
        </div>
      )}

      {/* 6 Key Stat Cards Grid */}
      {isLoadingAny ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse p-5">
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Completed Workouts"
            value={analytics.totalWorkouts ?? completedWorkouts.length}
            subtext="Lifetime workouts logged"
            icon={Dumbbell}
            color="sky"
          />
          <StatCard
            title="Weekly Progress"
            value={`${analytics.weeklyWorkouts ?? 0} workouts`}
            subtext="Past 7 days session count"
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Monthly Progress"
            value={`${analytics.monthlyWorkouts ?? 0} workouts`}
            subtext="Past 30 days session count"
            icon={Flame}
            color="emerald"
          />
          <StatCard
            title="Average Session Duration"
            value={formatDuration(analytics.averageDurationSecs)}
            subtext="Avg time spent per workout"
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Current Body Weight"
            value={weightSummary.currentWeight ? `${weightSummary.currentWeight} kg` : "Not Logged"}
            subtext={
              weightSummary.goalWeight
                ? `Goal target: ${weightSummary.goalWeight} kg`
                : "No goal target set"
            }
            icon={Activity}
            color="indigo"
          />
          <StatCard
            title="Total Volume Lifted"
            value={(analytics.totalVolume || 0).toLocaleString()}
            unit="kg"
            subtext="Lifetime cumulative volume"
            icon={Trophy}
            color="emerald"
          />
        </div>
      )}

      {/* Personal Records (PRs) Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Personal Records (PRs)</h2>
          </div>
        </div>

        {isLoadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse p-6"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PRCard
              title="Highest Weight Lifted"
              value={analytics.highestWeightSet?.weight || 0}
              unit="kg"
              subtitle={
                analytics.highestWeightSet
                  ? `${analytics.highestWeightSet.reps} reps`
                  : "No set logged yet"
              }
              exerciseName={analytics.highestWeightSet?.exerciseName}
              workoutTitle={analytics.highestWeightSet?.workoutTitle}
              date={analytics.highestWeightSet?.date}
              icon={Trophy}
              badgeColor="amber"
            />
            <PRCard
              title="Best Set Volume"
              value={analytics.bestVolumeSet?.volume || 0}
              unit="kg"
              subtitle={
                analytics.bestVolumeSet
                  ? `${analytics.bestVolumeSet.weight}kg x ${analytics.bestVolumeSet.reps} reps`
                  : "No set logged yet"
              }
              exerciseName={analytics.bestVolumeSet?.exerciseName}
              workoutTitle={analytics.bestVolumeSet?.workoutTitle}
              date={analytics.bestVolumeSet?.date}
              icon={Zap}
              badgeColor="sky"
            />
            <PRCard
              title="Best Session Volume"
              value={analytics.highestVolumeWorkout?.totalVolume || 0}
              unit="kg"
              subtitle={
                analytics.highestVolumeWorkout
                  ? `${analytics.highestVolumeWorkout.exerciseCount} exercises`
                  : "No session logged yet"
              }
              workoutTitle={analytics.highestVolumeWorkout?.title}
              workoutId={analytics.highestVolumeWorkout?.id}
              date={analytics.highestVolumeWorkout?.date}
              icon={Award}
              badgeColor="emerald"
            />
          </div>
        )}
      </div>

      {/* Body Weight Progression Overview Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Body Weight Tracking</h2>
              <p className="text-xs text-slate-400">Rolling window averages & trend trajectory</p>
            </div>
          </div>

          <Link
            to="/weight"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 px-3 py-1.5 bg-indigo-950/50 border border-indigo-800/40 rounded-lg transition hover:bg-indigo-900/60"
          >
            <span>Weight Tracker</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoadingWeight ? (
          <div className="h-48 bg-slate-950/60 rounded-xl animate-pulse"></div>
        ) : !weightSummary.currentWeight ? (
          <EmptyState
            icon={Scale}
            title="No Body Weight Logged Yet"
            description="Start logging your daily or weekly body weight weigh-ins to track rolling averages."
            action={
              <Link
                to="/weight"
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
              >
                <span>Log Body Weight</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stat Badges */}
            <div className="space-y-3">
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Current Weight</span>
                <span className="font-bold text-white font-mono text-base">
                  {weightSummary.currentWeight} kg
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Goal Target</span>
                <span className="font-bold text-emerald-400 font-mono text-base">
                  {weightSummary.goalWeight ? `${weightSummary.goalWeight} kg` : "Not set"}
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Weight Difference</span>
                <span className="font-bold text-sky-400 font-mono text-base">
                  {weightSummary.weightDifference !== null
                    ? `${weightSummary.weightDifference > 0 ? "+" : ""}${weightSummary.weightDifference} kg`
                    : "--"}
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">7-Day Weekly Avg</span>
                <span className="font-bold text-amber-400 font-mono text-base">
                  {weightSummary.weeklyAverage ? `${weightSummary.weeklyAverage} kg` : "--"}
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">30-Day Monthly Avg</span>
                <span className="font-bold text-indigo-400 font-mono text-base">
                  {weightSummary.monthlyAverage ? `${weightSummary.monthlyAverage} kg` : "--"}
                </span>
              </div>
            </div>

            {/* Mini SVG Line Chart */}
            <div className="lg:col-span-2">
              <BodyWeightChart
                data={weightData.chartData || []}
                goalWeight={weightSummary.goalWeight}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Workouts Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Recent Workouts</h2>
          </div>

          {completedWorkouts.length > 0 && (
            <Link
              to="/workouts"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>View All History</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoadingWorkouts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse p-6"></div>
            ))}
          </div>
        ) : completedWorkouts.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No completed workouts logged yet"
            description="Start recording your exercises, reps, and weights to build your workout history."
            action={
              <button
                onClick={() => startMutation.mutate()}
                className="inline-flex items-center space-x-2 bg-sky-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm hover:bg-sky-400 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Start First Session</span>
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/workouts/${workout.id}`}
                      className="text-lg font-bold text-white hover:text-sky-400 transition-colors"
                    >
                      {workout.title}
                    </Link>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-sky-400" />
                        <span>
                          {new Date(workout.date).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </span>
                      {workout.duration && (
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                          <span>{formatDuration(workout.duration)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(workout.id)}
                    title="Delete Workout Session"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {workout.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">
                    "{workout.notes}"
                  </p>
                )}

                {/* Exercises Summary Pill */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {workout.exercises?.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{ex.name}</span>
                      <span className="text-slate-400 font-mono">
                        {ex.sets?.length || 0} sets ({ex.sets?.map((s) => `${s.weight}kg`).join(", ")})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
