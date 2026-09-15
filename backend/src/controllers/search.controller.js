import { searchService } from "../services/search.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchController = {
  globalSearch: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const queryTerm = req.query.q || req.query.query || "";
    const results = await searchService.globalSearch(userId, queryTerm);
    return apiResponse.success(res, "Global search completed successfully", results);
  }),
};
