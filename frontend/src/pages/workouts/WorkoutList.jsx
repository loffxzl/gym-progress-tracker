import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { workoutApi } from '../../api/workoutApi.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import {
  Dumbbell,
  Search,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Filter,
} from 'lucide-react';

export const WorkoutList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'COMPLETED' | 'IN_PROGRESS'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [page, setPage] = useState(1);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const limit = 8;

  const { data: response, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['workouts', { search, status: statusFilter, sortOrder, page, limit }],
    queryFn: () =>
      workoutApi.getWorkouts({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        sortOrder,
        page,
        limit,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workoutApi.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setSelectedDeleteId(null);
    },
  });

  // Extract pagination response data (support both array fallback and paginated object structure)
  const responseData = response?.data;
  const workouts = Array.isArray(responseData) ? responseData : responseData?.items || [];
  const meta = responseData?.meta || { totalCount: workouts.length, totalPages: 1, currentPage: 1 };

  const formatDuration = (secs) => {
    if (!secs) return 'N/A';
    const mins = Math.floor(secs / 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  const calculateVolume = (workout) => {
    let vol = 0;
    workout.exercises?.forEach((ex) => {
      ex.sets?.forEach((s) => {
        vol += (s.weight || 0) * (s.reps || 0);
      });
    });
    return vol;
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout History"
        description="Search, filter, inspect, and manage your complete training log archive."
        action={
          <Link
            to="/workouts/new"
            className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Log Workout</span>
          </Link>
        }
      />

      {/* Controls Bar: Search, Filters & Sorting */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or exercise name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition-all"
          />
        </div>

        {/* Filter Pills & Sort Order Toggle */}
        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: '', label: 'All' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'IN_PROGRESS', label: 'Active' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStatusChange(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st.id
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort Order Button */}
          <button
            type="button"
            onClick={toggleSortOrder}
            className="inline-flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-3 py-2 rounded-xl border border-slate-800 text-xs transition-all"
            title="Toggle Date Order"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-sky-400" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Workout Grid / Feed */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={search ? 'No matching workouts found' : 'No workout logs recorded'}
          description={
            search
              ? `No workouts found matching "${search}". Try adjusting your search query or filters.`
              : 'Record your exercises, sets, weights, and reps to build your training history.'
          }
          action={
            <Link
              to="/workouts/new"
              className="inline-flex items-center space-x-2 bg-sky-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
            >
              Log First Workout
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map((workout) => {
            const volume = calculateVolume(workout);
            return (
              <div
                key={workout.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            workout.status === 'IN_PROGRESS' ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'
                          }`}
                        />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                          {workout.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed Session'}
                        </span>
                      </div>
                      <Link
                        to={`/workouts/${workout.id}`}
                        className="text-xl font-extrabold text-white hover:text-sky-400 transition-colors"
                      >
                        {workout.title}
                      </Link>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/workouts/${workout.id}`}
                        className="p-2 text-slate-400 hover:text-sky-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/workouts/${workout.id}/edit`}
                        className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Workout"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedDeleteId(workout.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Workout"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-sky-400" />
                      <span>{new Date(workout.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </span>
                    {workout.duration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>{formatDuration(workout.duration)}</span>
                      </span>
                    )}
                  </div>

                  {workout.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 italic line-clamp-2">
                      "{workout.notes}"
                    </p>
                  )}

                  {/* Exercises summary list */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-800">
                    {workout.exercises?.slice(0, 3).map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{ex.name}</span>
                        <span className="text-slate-500">
                          {ex.sets?.length || 0} sets ({ex.sets?.map((s) => `${s.weight}kg`).join(', ')})
                        </span>
                      </div>
                    ))}
                    {(workout.exercises?.length || 0) > 3 && (
                      <p className="text-[11px] text-sky-400 font-semibold pt-1">
                        +{workout.exercises.length - 3} more exercise(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Metric */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Total Volume</span>
                  <span className="text-sm font-extrabold text-emerald-400">{volume.toLocaleString()} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar Controls */}
      {meta.totalPages > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing Page <span className="text-white font-bold">{meta.currentPage}</span> of{' '}
            <span className="text-white font-bold">{meta.totalPages}</span> ({meta.totalCount} total sessions)
          </p>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || isPlaceholderData}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-300 disabled:opacity-40 rounded-xl text-xs font-bold transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pgNum) => (
              <button
                key={pgNum}
                type="button"
                onClick={() => setPage(pgNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  page === pgNum
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pgNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              disabled={page >= meta.totalPages || isPlaceholderData}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-300 disabled:opacity-40 rounded-xl text-xs font-bold transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(selectedDeleteId)}
        title="Delete Workout Session?"
        description="Are you sure you want to delete this workout entry from your training history? This action cannot be undone."
        confirmText="Yes, Delete Session"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => selectedDeleteId && deleteMutation.mutate(selectedDeleteId)}
        onClose={() => setSelectedDeleteId(null)}
      />
    </div>
  );
};
