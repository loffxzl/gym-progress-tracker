import { workoutService } from '../services/workout.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getActiveWorkout = asyncHandler(async (req, res) => {
  const workout = await workoutService.getActiveWorkout(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, workout, 'Active workout session retrieved successfully'));
});

export const startWorkout = asyncHandler(async (req, res) => {
  const workout = await workoutService.startWorkout(req.user.id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, workout, 'Workout session started successfully'));
});

export const endWorkout = asyncHandler(async (req, res) => {
  const workout = await workoutService.endWorkout(req.params.id, req.user.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, workout, 'Workout session completed successfully'));
});

export const createWorkout = asyncHandler(async (req, res) => {
  const workout = await workoutService.createWorkout(req.user.id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, workout, 'Workout created successfully'));
});

export const getWorkouts = asyncHandler(async (req, res) => {
  const result = await workoutService.getUserWorkouts(req.user.id, {
    search: req.query.search,
    status: req.query.status,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
    sortOrder: req.query.sortOrder || 'desc',
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'User workouts retrieved successfully'));
});

export const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await workoutService.getWorkoutById(req.params.id, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, workout, 'Workout session retrieved successfully'));
});

export const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await workoutService.updateWorkout(req.params.id, req.user.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, workout, 'Workout updated successfully'));
});

export const deleteWorkout = asyncHandler(async (req, res) => {
  await workoutService.deleteWorkout(req.params.id, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Workout deleted successfully'));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await workoutService.getAnalytics(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, 'Workout analytics retrieved successfully'));
});

export const getChartAnalytics = asyncHandler(async (req, res) => {
  const chartAnalytics = await workoutService.getChartAnalytics(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, chartAnalytics, 'Chart analytics retrieved successfully'));
});
