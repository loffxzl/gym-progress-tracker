/**
 * AI Coach Prompt Templates & Context Formatters
 * Keeps prompt engineering completely separate from service business logic.
 */

export const coachingPrompts = {
  /**
   * Formats raw workout history, PRs, and body weight stats into a clean structured text context for the LLM.
   */
  formatUserContext({ user, workouts, prs, bodyWeightSummary, plateaus }) {
    const totalWorkouts = workouts.length;
    const latestWorkout = workouts[0] || null;
    const recentSessionSummary = workouts.slice(0, 5).map((w) => {
      const exerciseNames = (w.exercises || []).map((e) => e.name).join(', ');
      return `- Date: ${new Date(w.date).toISOString().split('T')[0]}, Title: "${w.title}", Exercises: [${exerciseNames}]`;
    }).join('\n');

    const prList = (prs || []).map((pr) => `- ${pr.exerciseName}: Max Weight ${pr.maxWeight}kg, Max Volume ${pr.maxVolume}kg`).join('\n');
    const plateauList = (plateaus || []).map((p) => `- ${p.exerciseName}: Static weight (${p.weight}kg) across ${p.sessionCount} sessions`).join('\n');

    return `
User Profile:
- Name: ${user.name}
- Training Experience: ${user.experience || 'INTERMEDIATE'}
- Height: ${user.height ? `${user.height} cm` : 'Not set'}
- Current Weight: ${bodyWeightSummary.currentWeight ? `${bodyWeightSummary.currentWeight} kg` : 'Not set'}
- Goal Weight: ${bodyWeightSummary.goalWeight ? `${bodyWeightSummary.goalWeight} kg` : 'Not set'}

Training Overview:
- Total Workouts Logged: ${totalWorkouts}
- Latest Workout: ${latestWorkout ? `"${latestWorkout.title}" on ${new Date(latestWorkout.date).toISOString().split('T')[0]}` : 'None'}

Recent 5 Workout Sessions:
${recentSessionSummary || 'No recent workouts logged.'}

Personal Records (PRs):
${prList || 'No PRs recorded yet.'}

Detected Strength Plateaus:
${plateauList || 'No plateaus detected.'}
`;
  },

  /**
   * System instruction prompt defining AI Coach behavior and output schema expectations.
   */
  getSystemPrompt() {
    return `You are an elite, encouraging, and science-backed AI Strength & Conditioning Coach for the FitPulse App.
Analyze the user's training data and provide actionable, structured coaching insights in valid JSON format with the following keys:
{
  "summary": "High-level summary of recent training consistency and intensity",
  "weeklyInsights": "Key observations on training frequency, volume, and recovery status",
  "progressAnalysis": "Evaluation of strength gains, PR progression, or areas needing attention",
  "plateauWarning": "Warning and advice regarding detected plateaus or deload recommendations",
  "workoutSuggestion": "Specific recommended focus and target exercise adjustments for the next workout session"
}`;
  },
};
