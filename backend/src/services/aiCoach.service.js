import { workoutRepository } from '../repositories/workout.repository.js';
import { bodyWeightService } from './bodyWeight.service.js';
import { coachingPrompts } from '../prompts/coachingPrompts.js';
import { llmService } from './llm/llmProvider.js';
import prisma from '../config/db.js';

export const aiCoachService = {
  /**
   * Scans user workouts for exercises where working weight has remained unchanged
   * across 3 or more consecutive workout sessions.
   */
  detectPlateaus(workouts) {
    const exerciseHistoryMap = {};

    for (const workout of workouts) {
      if (!workout.exercises) continue;
      for (const ex of workout.exercises) {
        if (!ex.name || !ex.sets || ex.sets.length === 0) continue;
        const maxWeightInSession = Math.max(...ex.sets.map((s) => s.weight || 0));
        if (maxWeightInSession <= 0) continue;

        if (!exerciseHistoryMap[ex.name]) {
          exerciseHistoryMap[ex.name] = [];
        }
        exerciseHistoryMap[ex.name].push({
          date: workout.date,
          weight: maxWeightInSession,
        });
      }
    }

    const plateaus = [];
    for (const [exerciseName, history] of Object.entries(exerciseHistoryMap)) {
      if (history.length < 3) continue;

      // Inspect 3 most recent sessions
      const recentThree = history.slice(0, 3);
      const firstWeight = recentThree[0].weight;
      const isPlateaued = recentThree.every((item) => item.weight === firstWeight);

      if (isPlateaued) {
        plateaus.push({
          exerciseName,
          weight: firstWeight,
          sessionCount: history.length,
        });
      }
    }

    return plateaus;
  },

  /**
   * Generates structured AI Coach Insights for the user.
   */
  async getInsights(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, experience: true, height: true, goalWeight: true },
    });

    const workoutResult = await workoutRepository.findAllByUserId(userId, { limit: 100 });
    const workouts = workoutResult?.items || [];
    const analytics = await workoutRepository.getAnalytics(userId);
    const bodyWeightData = await bodyWeightService.getWeightMetricsAndHistory(userId);
    const bodyWeightSummary = bodyWeightData?.summary || {};

    const plateaus = this.detectPlateaus(workouts);

    const userContextData = {
      user: user || { name: 'Athlete' },
      workouts: workouts || [],
      prs: analytics || {},
      bodyWeightSummary,
      plateaus,
    };

    const systemPrompt = coachingPrompts.getSystemPrompt();
    const insights = await llmService.getCoachingAnalysis(systemPrompt, userContextData);

    return {
      insights,
      plateaus,
      totalWorkoutsLogged: workouts.length,
      lastAnalyzedAt: new Date().toISOString(),
    };
  },
};
