import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../../api/workoutApi.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { Dumbbell, Calendar, Clock, Edit, Trash2, ArrowLeft, Trophy, Flame, CheckCircle2, FileText } from 'lucide-react';

export const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutApi.getWorkoutById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => workoutApi.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      navigate('/dashboard');
    },
  });

  const workout = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !workout) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl inline-block">
          <Dumbbell className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Workout Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {error?.response?.data?.message || 'The requested workout session could not be found or you do not have permission to view it.'}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Calculate volume & metrics
  let totalSets = 0;
  let totalVolume = 0;
  workout.exercises?.forEach((ex) => {
    ex.sets?.forEach((s) => {
      totalSets += 1;
      totalVolume += (s.weight || 0) * (s.reps || 0);
    });
  });

  const formatDuration = (secs) => {
    if (!secs) return 'N/A';
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          <Link
            to={`/workouts/${id}/edit`}
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold px-4 py-2 rounded-xl border border-slate-700 transition-all text-sm"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-4 py-2 rounded-xl border border-rose-500/20 transition-all text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(workout.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{workout.title}</h1>
          </div>

          {workout.duration && (
            <div className="inline-flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-200">Duration: {formatDuration(workout.duration)}</span>
            </div>
          )}
        </div>

        {workout.notes && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm italic flex items-start space-x-3">
            <FileText className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">"{workout.notes}"</p>
          </div>
        )}
      </div>

      {/* High-level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Exercises"
          value={workout.exercises?.length || 0}
          icon={Dumbbell}
          color="sky"
        />
        <StatCard
          title="Total Sets"
          value={totalSets}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Total Volume Lifted"
          value={totalVolume.toLocaleString()}
          unit="kg"
          icon={Trophy}
          color="emerald"
        />
      </div>

      {/* Exercises & Sets Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-sky-400" />
          <span>Exercise Details & Set Logs</span>
        </h2>

        {workout.exercises?.map((exercise, exIndex) => (
          <div key={exercise.id || exIndex} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                #{exIndex + 1}
              </span>
              <span>{exercise.name}</span>
            </h3>

            {/* Sets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Set</th>
                    <th className="py-3 px-4">Weight (kg)</th>
                    <th className="py-3 px-4">Reps</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {exercise.sets?.map((set, setIndex) => (
                    <tr key={set.id || setIndex} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">
                        Set {set.setNumber || setIndex + 1}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-white">
                        {set.weight} <span className="text-xs font-normal text-slate-500">kg</span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-white">
                        {set.reps} <span className="text-xs font-normal text-slate-500">reps</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {set.notes ? (
                          <span className="bg-slate-950 text-sky-400 px-2.5 py-1 rounded-lg border border-slate-800 italic">
                            {set.notes}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {set.isCompleted ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Workout Session?"
        description="Are you sure you want to delete this workout log? This action cannot be undone."
        confirmText="Yes, Delete Workout"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
