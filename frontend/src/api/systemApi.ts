import { apiRequest } from "./apiClient";
import type { CoordinatorListItem } from "../types/organizerTypes";
import type {
  PickHistoryItem,
  UndoPickResult,
} from "../types/pickHistoryTypes";
import type { SystemStatus } from "../types/systemTypes";

export function getPublicSystemStatus(token: string) {
  return apiRequest<SystemStatus>("/api/system/status", {
    token,
  });
}

export function getSystemStatus(token: string) {
  return apiRequest<SystemStatus>("/api/admin/system/status", {
    token,
  });
}

export function openDraft(token: string) {
  return apiRequest<SystemStatus>("/api/admin/system/draft/open", {
    method: "POST",
    token,
  });
}

export function pauseDraft(token: string) {
  return apiRequest<SystemStatus>("/api/admin/system/draft/pause", {
    method: "POST",
    token,
  });
}

export function getPicksHistory(token: string) {
  return apiRequest<PickHistoryItem[]>("/api/admin/system/picks", {
    token,
  });
}

export function getLatestActivePick(token: string) {
  return apiRequest<PickHistoryItem | null>(
    "/api/admin/system/picks/latest-active",
    {
      token,
    },
  );
}

export function undoPick(token: string, pickId: number) {
  return apiRequest<UndoPickResult>(`/api/admin/system/picks/${pickId}/undo`, {
    method: "POST",
    token,
  });
}

export function getCoordinators(token: string, search?: string) {
  const query = search?.trim();

  const endpoint = query
    ? `/api/admin/coordinators?search=${encodeURIComponent(query)}`
    : "/api/admin/coordinators";

  return apiRequest<CoordinatorListItem[]>(endpoint, {
    token,
  });
}

export function createCoordinator(token: string, formData: FormData) {
  return apiRequest<void>("/api/admin/coordinators", {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
}

export function resetSystem(token: string) {
  return apiRequest<void>("/api/admin/system/reset", {
    method: "POST",
    token,
  });
}
