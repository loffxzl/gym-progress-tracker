import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseApi } from '../../api/exerciseApi.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Dumbbell, Tag, Wrench, FileText } from 'lucide-react';

const CATEGORIES = [
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'ARMS', label: 'Arms' },
  { value: 'CORE', label: 'Core' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FULL_BODY', label: 'Full Body' },
];

const EQUIPMENT_OPTIONS = [
  { value: '', label: 'None / Unspecified' },
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'DUMBBELL', label: 'Dumbbell' },
  { value: 'CABLE', label: 'Cable' },
  { value: 'MACHINE', label: 'Machine' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'BAND', label: 'Band' },
  { value: 'OTHER', label: 'Other' },
];

export const CreateExercise = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      category: 'CHEST',
      equipment: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (newExercise) =>
      exerciseApi.createExercise({
        ...newExercise,
        equipment: newExercise.equipment || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      navigate('/exercises');
    },
    onError: (err) => {
      setServerError(err.message || 'Failed to create exercise');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Add Custom Exercise"
        description="Create a new exercise movement to add to your custom library"
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <ErrorMessage message={serverError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Exercise Name *"
            type="text"
            placeholder="e.g. Incline Dumbbell Bench Press"
            icon={Dumbbell}
            error={errors.name?.message}
            {...register('name', {
              required: 'Exercise name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
            })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category / Muscle Group *
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Equipment (Optional)
            </label>
            <div className="relative">
              <Wrench className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <select
                {...register('equipment')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
              >
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq.value} value={eq.value}>
                    {eq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Notes & Form Tips (Optional)
            </label>
            <textarea
              placeholder="e.g. Keep elbows at 45 degree angle, squeeze chest at top"
              rows={3}
              {...register('notes')}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/exercises')}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Exercise
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
