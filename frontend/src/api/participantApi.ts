import { apiRequest } from "./apiClient";
import type {
  AvailableParticipant,
  ParticipantSortBy,
} from "../types/participantTypes";
import type { PagedResult } from "../types/paginationTypes";

export function getAvailableParticipants(
  token: string,
  options: {
    search?: string;
    sortBy?: ParticipantSortBy;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const params = new URLSearchParams();

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  if (options.sortBy && options.sortBy !== "total") {
    params.set("sortBy", options.sortBy);
  }

  if (options.page) {
    params.set("page", String(options.page));
  }

  if (options.pageSize) {
    params.set("pageSize", String(options.pageSize));
  }

  const query = params.toString();
  const endpoint = query
    ? `/api/participants/available?${query}`
    : "/api/participants/available";

  return apiRequest<PagedResult<AvailableParticipant>>(endpoint, {
    token,
  });
}
