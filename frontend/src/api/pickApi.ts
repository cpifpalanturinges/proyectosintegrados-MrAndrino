import { apiRequest } from "./apiClient";
import type { CreatePickRequest, PickResult } from "../types/pickTypes";

export function createPick(token: string, request: CreatePickRequest) {
  return apiRequest<PickResult>("/api/picks", {
    method: "POST",
    body: request,
    token,
  });
}
