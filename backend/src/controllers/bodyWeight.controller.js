import { bodyWeightService } from "../services/bodyWeight.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const bodyWeightController = {
  addWeightLog: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const log = await bodyWeightService.addWeightLog(userId, req.body);
    return apiResponse.created(res, "Body weight entry added successfully", log);
  }),

  setGoalWeight: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { goalWeight } = req.body;
    const updated = await bodyWeightService.setGoalWeight(userId, goalWeight);
    return apiResponse.success(res, "Goal weight updated successfully", updated);
  }),

  getWeightTrackerData: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = await bodyWeightService.getWeightMetricsAndHistory(userId, req.query);
    return apiResponse.success(res, "Body weight tracking data retrieved successfully", data);
  }),

  deleteWeightLog: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await bodyWeightService.deleteWeightLog(userId, id);
    return apiResponse.success(res, "Body weight entry deleted successfully");
  }),
};
