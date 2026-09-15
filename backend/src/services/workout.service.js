import { workoutRepository } from '../repositories/workout.repository.js';
import { ApiError } from '../utils/ApiError.js';

class WorkoutService {
  async getActiveWorkout(userId) {
    return await workoutRepository.findActiveByUserId(userId);
  }

  async startWorkout(userId, data = {}) {
    const active = await workoutRepository.findActiveByUserId(userId);
    if (active) {
      return active;
    }
    return await workoutRepository.startWorkout(userId, data);
  }

  async endWorkout(workoutId, userId, data) {
    const workout = await this.getWorkoutById(workoutId, userId);

    const endTime = new Date();
    const startTime = workout.startTime || workout.createdAt;
    const duration = Math.max(1, Math.round((endTime.getTime() - new Date(startTime).getTime()) / 1000));

    return await workoutRepository.endWorkout(workoutId, {
      ...data,
      duration,
    });
  }

  async createWorkout(userId, workoutData) {
    return await workoutRepository.create(userId, workoutData);
  }

  async getUserWorkouts(userId, options = {}) {
    return await workoutRepository.findAllByUserId(userId, options);
  }

  async getWorkoutById(workoutId, userId) {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) {
      throw ApiError.notFound('Workout session not found');
    }
    if (workout.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this workout session');
    }
    return workout;
  }

  async updateWorkout(workoutId, userId, updateData) {
    await this.getWorkoutById(workoutId, userId);
    return await workoutRepository.update(workoutId, updateData);
  }

  async deleteWorkout(workoutId, userId) {
    await this.getWorkoutById(workoutId, userId);
    await workoutRepository.delete(workoutId);
  }

  async getAnalytics(userId) {
    return await workoutRepository.getAnalytics(userId);
  }

  async getChartAnalytics(userId) {
    return await workoutRepository.getChartAnalytics(userId);
  }
}

export const workoutService = new WorkoutService();
