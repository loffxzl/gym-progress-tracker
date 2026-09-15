import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../../api/workoutApi.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Plus, Trash2, Dumbbell, ArrowLeft, CheckCircle2, Save } from 'lucide-react';

export const EditWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState([]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutApi.getWorkoutById(id),
  });

  const workout = response?.data;

  useEffect(() => {
    if (workout) {
      setTitle(workout.title || '');
      setNotes(workout.notes || '');
      setDate(workout.date ? new Date(workout.date).toISOString().split('T')[0] : '');
      setExercises(
        workout.exercises?.map((ex) => ({
          name: ex.name,
          order: ex.order || 0,
          sets: ex.sets?.map((s) => ({
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            notes: s.notes || '',
            isCompleted: s.isCompleted ?? true,
          })) || [],
        })) || []
      );
    }
  }, [workout]);

  const updateMutation = useMutation({
    mutationFn: (updatedData) => workoutApi.endWorkout(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      navigate(`/workouts/${id}`);
    },
  });

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        order: exercises.length,
        sets: [{ setNumber: 1, weight: 0, reps: 0, isCompleted: true }],
      },
    ]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExerciseName = (index, name) => {
    const updated = [...exercises];
    updated[index].name = name;
    setExercises(updated);
  };

  const addSet = (exIndex) => {
    const updated = [...exercises];
    const currentSets = updated[exIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];

    currentSets.push({
      setNumber: currentSets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      isCompleted: true,
    });
    setExercises(updated);
  };

  const removeSet = (exIndex, setIdx) => {
    const updated = [...exercises];
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIdx);
    updated[exIndex].sets.forEach((s, i) => (s.setNumber = i + 1));
    setExercises(updated);
  };

  const updateSet = (exIndex, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateMutation.mutate({
      title: title.trim(),
      notes,
      date,
      exercises,
    });
  };

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
        <h2 className="text-2xl font-bold text-white">Workout Session Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Cancel</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Workout Session</h1>
        <p className="text-slate-400 text-sm mt-1">Modify exercise names, weights, reps, or notes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Workout Info Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Workout Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Workout Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Workout Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Exercises Form List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-sky-400" />
              <span>Exercises & Sets</span>
            </h2>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center space-x-2 text-sm font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-4 py-2 rounded-xl border border-sky-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Exercise</span>
            </button>
          </div>

          {exercises.map((exercise, exIdx) => (
            <div key={exIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-lg">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Exercise Name"
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                    required
                    className="w-full text-lg font-bold text-white bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(exIdx)}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                  <span className="col-span-1">Set</span>
                  <span className="col-span-3">Weight (kg)</span>
                  <span className="col-span-3">Reps</span>
                  <span className="col-span-3">Notes</span>
                  <span className="col-span-2 text-center">Done</span>
                </div>

                {exercise.sets?.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-12 items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                    <span className="col-span-1 text-xs font-bold text-slate-400 pl-1">
                      #{set.setNumber}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={set.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. PR, Drop set"
                      value={set.notes || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'notes', e.target.value)}
                      className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                    />
                    <div className="col-span-2 flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => updateSet(exIdx, setIdx, 'isCompleted', !set.isCompleted)}
                        className={`p-1 rounded-lg border transition-colors ${
                          set.isCompleted
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSet(exIdx, setIdx)}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSet(exIdx)}
                  className="w-full py-2 bg-slate-950 border border-dashed border-slate-800 hover:border-sky-500/50 text-slate-400 hover:text-sky-400 text-xs font-semibold rounded-xl transition-all"
                >
                  + Add Set
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-sky-500/20 transition-all text-base flex items-center justify-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
};
