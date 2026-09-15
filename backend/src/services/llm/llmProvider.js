import { logger } from '../../utils/logger.js';

/**
 * Abstract Base LLM Provider Interface
 */
export class BaseLlmProvider {
  async generateCompletion(systemPrompt, userContext) {
    throw new Error('generateCompletion method must be implemented by concrete LLM provider');
  }
}

/**
 * Intelligent Rule-Based Analytics LLM Provider (Default Zero-Cost Operational Fallback Engine)
 * Generates structured, data-driven coaching insights based on user metrics
 * when no external LLM API keys (Gemini / OpenAI) are configured.
 */
export class RuleBasedLlmProvider extends BaseLlmProvider {
  async generateCompletion(systemPrompt, userContextData) {
    const { user, workouts, prs, bodyWeightSummary, plateaus } = userContextData;

    const totalWorkouts = workouts.length;
    const hasPRs = prs && prs.length > 0;
    const hasPlateaus = plateaus && plateaus.length > 0;

    let summary = `Great job staying committed to your training, ${user.name}! You have logged ${totalWorkouts} total workout sessions.`;
    if (workouts.length >= 3) {
      summary += ` Your recent consistency is strong across your main movements.`;
    } else {
      summary += ` Keep logging your sessions consistently to unlock deeper volume trends.`;
    }

    let weeklyInsights = `Training frequency is steady. Ensure adequate protein intake (1.6g-2.2g per kg bodyweight) and 7-9 hours of sleep for optimal muscular recovery.`;
    if (bodyWeightSummary.weeklyAverage) {
      weeklyInsights += ` Your 7-day rolling weight average is ${bodyWeightSummary.weeklyAverage}kg.`;
    }

    let progressAnalysis = `You are maintaining solid lifting baseline form.`;
    if (hasPRs) {
      const topPR = prs[0];
      progressAnalysis = `Outstanding strength performance! Your top PR is in ${topPR.exerciseName} with a max weight of ${topPR.maxWeight}kg and volume of ${topPR.maxVolume}kg.`;
    }

    let plateauWarning = `No strength plateaus detected! Progressive overload is proceeding smoothly across your exercise catalog.`;
    if (hasPlateaus) {
      const p = plateaus[0];
      plateauWarning = `⚠️ Potential Plateau Alert: Performance on "${p.exerciseName}" has plateaued at ${p.weight}kg across ${p.sessionCount} sessions. Consider taking a 1-week deload or switching rep ranges (e.g., 5x5 to 3x10).`;
    }

    let workoutSuggestion = `For your next session, focus on Compound Multi-Joint Movements (Squats, Bench Press, or Deadlifts). Aim for 3-4 working sets per movement in the 6-10 rep range with 90-120 seconds rest.`;
    if (hasPlateaus) {
      workoutSuggestion = `Next Session Focus: Prioritize assistance exercises for ${plateaus[0].exerciseName}. Drop working weight by 10% to focus on explosive velocity and perfect technique.`;
    }

    return {
      summary,
      weeklyInsights,
      progressAnalysis,
      plateauWarning,
      workoutSuggestion,
      provider: 'RuleBasedEngine',
    };
  }
}

/**
 * Centralized LLM Service Factory
 * Manages provider switching and graceful exception handling.
 */
export class LlmService {
  constructor(provider = new RuleBasedLlmProvider()) {
    this.provider = provider;
  }

  setProvider(newProvider) {
    this.provider = newProvider;
  }

  async getCoachingAnalysis(systemPrompt, userContextData) {
    try {
      return await this.provider.generateCompletion(systemPrompt, userContextData);
    } catch (err) {
      logger.error('LLM Provider execution failed; falling back to RuleBasedLlmProvider:', err);
      const fallbackProvider = new RuleBasedLlmProvider();
      return await fallbackProvider.generateCompletion(systemPrompt, userContextData);
    }
  }
}

export const llmService = new LlmService();
