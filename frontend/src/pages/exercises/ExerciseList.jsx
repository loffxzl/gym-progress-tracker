import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { exerciseApi } from '../../api/exerciseApi.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { Dumbbell, Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', value: 'All' },
  { label: 'Chest', value: 'CHEST' },
  { label: 'Back', value: 'BACK' },
  { label: 'Legs', value: 'LEGS' },
  { label: 'Shoulders', value: 'SHOULDERS' },
  { label: 'Arms', value: 'ARMS' },
  { label: 'Core', value: 'CORE' },
  { label: 'Cardio', value: 'CARDIO' },
  { label: 'Full Body', value: 'FULL_BODY' },
];

const formatEnumLabel = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const ExerciseList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['exercises', { search, category, page }],
    queryFn: () => exerciseApi.getExercises({ search, category, page, limit: 8 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => exerciseApi.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setDeletingId(null);
    },
  });

  const exercises = response?.data?.items || [];
  const meta = response?.data?.meta || { totalPages: 1, currentPage: 1, totalCount: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercise Catalog"
        description="Browse, search, and manage your exercise library"
        action={
          <Link
            to="/exercises/new"
            className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Exercise</span>
          </Link>
        }
      />

      {/* Search & Category Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercises by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === cat.value
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Content Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description="Try clearing your search filters or add a new custom exercise."
          action={
            <Link
              to="/exercises/new"
              className="inline-flex items-center space-x-2 bg-sky-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
            >
              Add Custom Exercise
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{exercise.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      exercise.userId
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {exercise.userId ? 'Custom' : 'System'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3">
                  <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-medium">
                    {formatEnumLabel(exercise.category)}
                  </span>
                  {exercise.equipment && (
                    <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-medium text-slate-400">
                      {formatEnumLabel(exercise.equipment)}
                    </span>
                  )}
                </div>

                {exercise.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 line-clamp-2">
                    {exercise.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons for Custom Exercises */}
              {exercise.userId && (
                <div className="flex items-center justify-end space-x-2 pt-4 mt-2 border-t border-slate-800/80">
                  <Link
                    to={`/exercises/${exercise.id}/edit`}
                    className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Exercise"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeletingId(exercise.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Page <span className="font-bold text-white">{meta.currentPage}</span> of{' '}
            <span className="font-bold text-white">{meta.totalPages}</span>
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete Custom Exercise"
        message="Are you sure you want to delete this custom exercise? It will be soft-deleted and removed from your catalog."
        confirmText="Delete Exercise"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
