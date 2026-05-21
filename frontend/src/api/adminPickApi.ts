import { apiRequest } from "./apiClient";

export function undoPick(pickId: number, token: string) {
  return apiRequest<void>(`/api/admin/system/picks/${pickId}/undo`, {
    method: "POST",
    token,
  });
}
