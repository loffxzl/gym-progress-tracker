import { searchRepository } from "../repositories/search.repository.js";

export const searchService = {
  async globalSearch(userId, queryTerm) {
    return searchRepository.globalSearch(userId, queryTerm);
  },
};
