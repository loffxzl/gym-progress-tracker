import { exerciseService } from '../services/exercise.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getExercises = asyncHandler(async (req, res) => {
  const result = await exerciseService.getExercises(req.query, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Exercises retrieved successfully'));
});

export const getExerciseById = asyncHandler(async (req, res) => {
  const exercise = await exerciseService.getExerciseById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, exercise, 'Exercise details retrieved successfully'));
});

export const createExercise = asyncHandler(async (req, res) => {
  const exercise = await exerciseService.createExercise(req.body, req.user.id);
  return res
    .status(201)
    .json(new ApiResponse(201, exercise, 'Custom exercise created successfully'));
});

export const updateExercise = asyncHandler(async (req, res) => {
  const exercise = await exerciseService.updateExercise(req.params.id, req.body, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, exercise, 'Exercise updated successfully'));
});

export const softDeleteExercise = asyncHandler(async (req, res) => {
  await exerciseService.softDeleteExercise(req.params.id, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Exercise soft-deleted successfully'));
});
