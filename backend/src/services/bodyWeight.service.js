import { bodyWeightRepository } from "../repositories/bodyWeight.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const bodyWeightService = {
  async addWeightLog(userId, data) {
    return bodyWeightRepository.create(userId, data);
  },

  async setGoalWeight(userId, goalWeight) {
    return bodyWeightRepository.updateUserGoalWeight(userId, goalWeight);
  },

  async deleteWeightLog(userId, id) {
    const existing = await bodyWeightRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound("Weight log entry not found");
    }
    return bodyWeightRepository.delete(id);
  },

  async getWeightMetricsAndHistory(userId, queryParams = {}) {
    const logs = await bodyWeightRepository.findAll(userId, queryParams);
    const goalWeight = await bodyWeightRepository.getUserGoalWeight(userId);

    if (logs.length === 0) {
      return {
        summary: {
          currentWeight: null,
          goalWeight: goalWeight !== null ? Number(goalWeight.toFixed(2)) : null,
          weightDifference: null,
          weeklyAverage: null,
          monthlyAverage: null,
          totalEntries: 0,
        },
        history: [],
      };
    }

    // Sort chronologically ascending for line charts and calculations
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Latest log entry gives current weight
    const latestLog = sortedLogs[sortedLogs.length - 1];
    const currentWeight = Number(latestLog.weight.toFixed(2));
    const latestDate = new Date(latestLog.date);

    // Goal Weight & Difference
    const formattedGoalWeight = goalWeight !== null ? Number(goalWeight.toFixed(2)) : null;
    const weightDifference =
      formattedGoalWeight !== null ? Number((currentWeight - formattedGoalWeight).toFixed(2)) : null;

    // Weekly Average (Rolling 7 days from latest log)
    const sevenDaysAgo = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLogs = sortedLogs.filter((log) => new Date(log.date) >= sevenDaysAgo);
    const weeklySum = weeklyLogs.reduce((acc, curr) => acc + curr.weight, 0);
    const weeklyAverage =
      weeklyLogs.length > 0 ? Number((weeklySum / weeklyLogs.length).toFixed(2)) : null;

    // Monthly Average (Rolling 30 days from latest log)
    const thirtyDaysAgo = new Date(latestDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyLogs = sortedLogs.filter((log) => new Date(log.date) >= thirtyDaysAgo);
    const monthlySum = monthlyLogs.reduce((acc, curr) => acc + curr.weight, 0);
    const monthlyAverage =
      monthlyLogs.length > 0 ? Number((monthlySum / monthlyLogs.length).toFixed(2)) : null;

    // Return history in descending order for table list view
    const historyDesc = [...sortedLogs].reverse().map((log) => ({
      id: log.id,
      weight: Number(log.weight.toFixed(2)),
      date: log.date,
      notes: log.notes,
      createdAt: log.createdAt,
    }));

    // Formatted ascending logs for time-series chart
    const timeSeriesChartData = sortedLogs.map((log) => ({
      id: log.id,
      weight: Number(log.weight.toFixed(2)),
      date: log.date,
      formattedDate: new Date(log.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    return {
      summary: {
        currentWeight,
        goalWeight: formattedGoalWeight,
        weightDifference,
        weeklyAverage,
        monthlyAverage,
        totalEntries: logs.length,
      },
      chartData: timeSeriesChartData,
      history: historyDesc,
    };
  },
};
