import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiCoachApi } from '../api/aiCoachApi.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Activity,
  CheckCircle2,
  RefreshCw,
  Dumbbell,
  BrainCircuit,
  Zap,
} from 'lucide-react';

export const AICoach = () => {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['aiCoachInsights'],
    queryFn: () => aiCoachApi.getInsights(),
  });

  const coachData = response?.data || {};
  const insights = coachData.insights || {};
  const plateaus = coachData.plateaus || [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 animate-pulse">
          <BrainCircuit className="h-10 w-10 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Analyzing Workout History & Bio-Metrics...</h3>
          <p className="text-xs text-slate-400 mt-1">Evaluating volume trajectories, plateau risks, and PR velocity.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load AI Coach Insights"
        message={error?.message || 'Unable to communicate with AI Coach service.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="FitPulse AI Coach & Bio-Analytics ✨"
        description="Data-driven strength analysis, intelligent plateau detection, and tailored training recommendations."
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Re-analyze Data'}</span>
          </button>
        }
      />

      {/* Main AI Briefing Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-48 w-48 text-indigo-400" />
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/40 text-indigo-400 shrink-0">
            <Bot className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>AI Strength Coach Briefing</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Analyzed {coachData.totalWorkoutsLogged || 0} Sessions</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Coach Summary
            </h2>

            <p className="text-slate-300 text-base leading-relaxed font-normal">
              {insights.summary || 'Consistent training logging unlocks deeper predictive insights.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Insights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition">
          <div className="flex items-center space-x-3 text-sky-400">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Weekly Insights & Recovery</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insights.weeklyInsights || 'Log more weekly workouts to compute recovery efficiency.'}
          </p>
        </div>

        {/* Progress & PR Velocity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition">
          <div className="flex items-center space-x-3 text-emerald-400">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Strength & Velocity Analysis</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insights.progressAnalysis || 'Track personal records to unlock progressive velocity analysis.'}
          </p>
        </div>

        {/* Plateau Warnings & Deload */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition">
          <div className="flex items-center space-x-3 text-amber-400">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Plateau Detection & Deload</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insights.plateauWarning || 'No plateaus detected across your active movements.'}
          </p>

          {plateaus.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Detected Plateaus:</span>
              <div className="flex flex-wrap gap-2">
                {plateaus.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono rounded-lg"
                  >
                    ⚠️ {p.exerciseName}: {p.weight}kg ({p.sessionCount} sessions)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Workout Suggestions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition">
          <div className="flex items-center space-x-3 text-indigo-400">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Suggested Next Workout Focus</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {insights.workoutSuggestion || 'Focus on main compound movements in your next session.'}
          </p>
        </div>
      </div>
    </div>
  );
};
