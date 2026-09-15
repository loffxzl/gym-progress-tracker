import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workoutApi } from "../api/workoutApi.js";
import { bodyWeightApi } from "../api/bodyWeightApi.js";
import { PageHeader } from "../components/common/PageHeader.jsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.jsx";
import { VolumeChart } from "../components/workout/VolumeChart.jsx";
import { WeeklyMonthlyVolumeChart } from "../components/workout/WeeklyMonthlyVolumeChart.jsx";
import { ExerciseProgressChart } from "../components/workout/ExerciseProgressChart.jsx";
import { BodyWeightChart } from "../components/workout/BodyWeightChart.jsx";
import {
  TrendingUp,
  BarChart3,
  Dumbbell,
  Scale,
  Calendar,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";

export const Analytics = () => {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'volume' | 'exercises' | 'weight'

  // Fetch Chart Analytics (Workout Volume, Weekly, Monthly, Exercise Progress)
  const {
    data: chartResponse,
    isLoading: isLoadingCharts,
    isError: isErrorCharts,
    error: chartError,
    refetch: refetchCharts,
  } = useQuery({
    queryKey: ["chartAnalytics"],
    queryFn: () => workoutApi.getChartAnalytics(),
  });

  // Fetch Body Weight Analytics
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

  const chartData = useMemo(() => chartResponse?.data || {}, [chartResponse]);
  const weightData = useMemo(() => weightResponse?.data?.data || { summary: {}, chartData: [] }, [weightResponse]);
  const weightSummary = useMemo(() => weightData.summary || {}, [weightData]);

  const isLoading = isLoadingCharts || isLoadingWeight;
  const isError = isErrorCharts || isErrorWeight;

  const handleRetry = () => {
    refetchCharts();
    refetchWeight();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <PageHeader
        title="Training & Progression Analytics 📈"
        description="Comprehensive vector chart visualizer tracking workout volume, body weight, and exercise strength trajectories over time."
      />

      {/* Error Alert */}
      {isError && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between text-rose-200 text-sm shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-rose-100">Failed to load analytics chart data</p>
              <p className="text-xs text-rose-300/80">
                {chartError?.message || weightError?.message || "Network error loading charts."}
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border border-rose-700/50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "all"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>All Charts (5)</span>
        </button>

        <button
          onClick={() => setActiveTab("volume")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "volume"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Workout & Aggregated Volume</span>
        </button>

        <button
          onClick={() => setActiveTab("exercises")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "exercises"
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Exercise Progress</span>
        </button>

        <button
          onClick={() => setActiveTab("weight")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === "weight"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Weight Progression</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Chart 1: Workout Session Volume Chart */}
          {(activeTab === "all" || activeTab === "volume") && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-white">1. Workout Session Volume</h2>
              </div>
              <VolumeChart data={chartData.workoutVolume || []} />
            </div>
          )}

          {/* Chart 2 & 3: Weekly Volume & Monthly Volume Aggregates */}
          {(activeTab === "all" || activeTab === "volume") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">2. Weekly Aggregated Volume</h2>
                </div>
                <WeeklyMonthlyVolumeChart data={chartData.weeklyVolume || []} type="weekly" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
                    <Award className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">3. Monthly Aggregated Volume</h2>
                </div>
                <WeeklyMonthlyVolumeChart data={chartData.monthlyVolume || []} type="monthly" />
              </div>
            </div>
          )}

          {/* Chart 4: Exercise Progress Chart */}
          {(activeTab === "all" || activeTab === "exercises") && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-white">4. Exercise Strength Progress</h2>
              </div>
              <ExerciseProgressChart
                exerciseNames={chartData.exerciseNames || []}
                exerciseProgress={chartData.exerciseProgress || {}}
              />
            </div>
          )}

          {/* Chart 5: Body Weight Progress Chart */}
          {(activeTab === "all" || activeTab === "weight") && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Scale className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-white">5. Body Weight Progression Curve</h2>
              </div>
              <BodyWeightChart
                data={weightData.chartData || []}
                goalWeight={weightSummary.goalWeight}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
