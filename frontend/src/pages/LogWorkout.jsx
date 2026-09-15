import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../api/workoutApi.js';
import { RestTimer } from '../components/workout/RestTimer.jsx';
import { Plus, Trash2, Dumbbell, Calendar, FileText, CheckCircle2, Timer, Play, StopCircle } from 'lucide-react';

export const LogWorkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [exercises, setExercises] = useState([
    {
      name: 'Bench Press',
      order: 0,
      sets: [
        { setNumber: 1, weight: 60, reps: 10, isCompleted: true },
        { setNumber: 2, weight: 70, reps: 8, isCompleted: true },
      ],
    },
  ]);

  // Fetch active workout session if one exists
  const { data: activeWorkoutResponse, isLoading: isLoadingActive } = useQuery({
    queryKey: ['activeWorkout'],
    queryFn: () => workoutApi.getActiveWorkout(),
  });

  const activeWorkout = activeWorkoutResponse?.data;

  // Live timer for active workout
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeWorkout?.startTime) {
      setElapsedSeconds(0);
      return;
    }

    if (activeWorkout.title && !title) {
      setTitle(activeWorkout.title);
    }
    if (activeWorkout.notes && !notes) {
      setNotes(activeWorkout.notes);
    }
    if (activeWorkout.exercises && activeWorkout.exercises.length > 0) {
      setExercises(activeWorkout.exercises);
    }

    const startMs = new Date(activeWorkout.startTime).getTime();
    const updateTimer = () => {
      const nowMs = new Date().getTime();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  const startWorkoutMutation = useMutation({
    mutationFn: (data) => workoutApi.startWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkout'] });
    },
  });

  const endWorkoutMutation = useMutation({
    mutationFn: ({ id, payload }) => workoutApi.endWorkout(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['activeWorkout'] });
      navigate('/');
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (newWorkout) => workoutApi.createWorkout(newWorkout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['activeWorkout'] });
      navigate('/');
    },
  });

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        order: exercises.length,
        sets: [{ setNumber: 1, weight: 0, reps: 0, isCompleted: false }],
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
      isCompleted: false,
    });
    setExercises(updated);
  };

  const removeSet = (exIndex, setIdx) => {
    const updated = [...exercises];
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIdx);
    updated[exIndex].sets.forEach((s, i) => (s.setNumber = i + 1));
    setExercises(updated);
  };

  const [validationError, setValidationError] = useState('');

  const updateSet = (exIndex, setIdx, field, value) => {
    const updated = [...exercises];
    let parsedVal = value;
    if (field === 'weight') {
      parsedVal = Math.min(1000, Math.max(0, Number(value) || 0));
    } else if (field === 'reps') {
      parsedVal = Math.min(1000, Math.max(0, parseInt(value, 10) || 0));
    }
    updated[exIndex].sets[setIdx][field] = parsedVal;
    setExercises(updated);
  };

  const handleStartSession = () => {
    startWorkoutMutation.mutate({
      title: title.trim() || 'Workout Session',
      notes: notes.trim() || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const workoutTitle = title.trim() || 'Workout Session';

    if (exercises.length === 0) {
      setValidationError('Please add at least one exercise to your workout session.');
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.name || ex.name.trim() === '') {
        setValidationError(`Exercise #${i + 1} must have a valid name.`);
        return;
      }
      for (let j = 0; j < ex.sets.length; j++) {
        const s = ex.sets[j];
        if (s.weight < 0 || s.weight > 1000) {
          setValidationError(`Exercise "${ex.name}" set #${j + 1} weight must be between 0 and 1000.`);
          return;
        }
        if (s.reps < 0 || s.reps > 1000) {
          setValidationError(`Exercise "${ex.name}" set #${j + 1} reps must be between 0 and 1000.`);
          return;
        }
      }
    }

    if (activeWorkout) {
      endWorkoutMutation.mutate({
        id: activeWorkout.id,
        payload: {
          title: workoutTitle,
          notes: notes.trim(),
          date,
          exercises,
        },
      });
    } else {
      createWorkoutMutation.mutate({
        title: workoutTitle,
        notes: notes.trim(),
        date,
        exercises,
      });
    }
  };

  const isSaving = endWorkoutMutation.isPending || createWorkoutMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Active Workout Top Card / Timer */}
      {activeWorkout ? (
        <div className="bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-slate-900 border border-sky-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-sky-500 text-slate-950 rounded-2xl font-bold animate-pulse">
              <Timer className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">Live Active Workout Session</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{activeWorkout.title}</h2>
              <p className="text-xs text-slate-400">Started at {new Date(activeWorkout.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowRestTimer(!showRestTimer)}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-sky-400 font-bold text-xs rounded-xl border border-sky-500/30 transition-all flex items-center space-x-2"
            >
              <Timer className="h-4 w-4" />
              <span>{showRestTimer ? 'Hide Rest Timer' : 'Open Rest Timer'}</span>
            </button>
            <div className="text-right bg-slate-950/80 px-5 py-2.5 rounded-xl border border-sky-500/20">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Elapsed Time</p>
              <p className="text-2xl font-black text-sky-400 font-mono tracking-tight">{formatTimer(elapsedSeconds)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Log Workout</h1>
            <p className="text-slate-400 text-sm mt-1">Start a live workout session or manually log a workout entry</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowRestTimer(!showRestTimer)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center space-x-2"
            >
              <Timer className="h-4 w-4" />
              <span>{showRestTimer ? 'Hide Rest Timer' : 'Rest Timer'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartSession}
              disabled={startWorkoutMutation.isPending}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{startWorkoutMutation.isPending ? 'Starting...' : 'Start Live Timer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded Rest Timer Widget */}
      {showRestTimer && (
        <RestTimer onClose={() => setShowRestTimer(false)} />
      )}

      {validationError && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-lg">
          <span>⚠️ {validationError}</span>
          <button onClick={() => setValidationError('')} className="text-rose-400 hover:text-rose-300 text-xs font-bold">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Workout Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Workout Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Upper Body Hypertrophy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
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
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Workout Notes / RPE / Focus
            </label>
            <textarea
              placeholder="e.g. Great session! Hit a new PR on Bench Press (80kg x 6 reps). Energy levels high."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Exercises List */}
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
                    placeholder="Exercise Name (e.g. Incline Bench Press)"
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
                      placeholder="e.g. Warmup, PR"
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
          disabled={isSaving}
          className={`w-full py-4 font-extrabold rounded-2xl shadow-xl transition-all text-base flex items-center justify-center space-x-2 ${
            activeWorkout
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
          } disabled:opacity-50`}
        >
          {activeWorkout ? <StopCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span>
            {isSaving
              ? 'Saving Workout...'
              : activeWorkout
              ? `End & Save Workout (${formatTimer(elapsedSeconds)})`
              : 'Save Workout Entry'}
          </span>
        </button>
      </form>
    </div>
  );
};

