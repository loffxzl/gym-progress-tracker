import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { aiCoachService } from '../services/aiCoach.service.js';

export const getAiCoachInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = await aiCoachService.getInsights(userId);

  return res.status(200).json(
    new ApiResponse(200, data, 'AI Coach insights generated successfully')
  );
});
