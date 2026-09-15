import { exerciseRepository } from '../repositories/exercise.repository.js';
import { ApiError } from '../utils/ApiError.js';

class ExerciseService {
  async getExercises(query, userId) {
    return await exerciseRepository.findAll({
      search: query.search,
      category: query.category,
      page: query.page,
      limit: query.limit,
      userId,
    });
  }

  async getExerciseById(id) {
    const exercise = await exerciseRepository.findById(id);
    if (!exercise) {
      throw ApiError.notFound('Exercise not found');
    }
    return exercise;
  }

  async createExercise(exerciseData, userId) {
    return await exerciseRepository.create({
      ...exerciseData,
      userId,
    });
  }

  async updateExercise(id, updateData, userId) {
    const exercise = await this.getExerciseById(id);

    if (exercise.userId && exercise.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to edit this custom exercise');
    }

    if (!exercise.userId) {
      throw ApiError.forbidden('Default system exercises cannot be modified');
    }

    return await exerciseRepository.update(id, updateData);
  }

  async softDeleteExercise(id, userId) {
    const exercise = await this.getExerciseById(id);

    if (exercise.userId && exercise.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this custom exercise');
    }

    if (!exercise.userId) {
      throw ApiError.forbidden('Default system exercises cannot be deleted');
    }

    return await exerciseRepository.softDelete(id);
  }
}

export const exerciseService = new ExerciseService();
