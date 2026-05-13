import { apiRequest } from './apiClient'
import type { TeamDetail, TeamListItem, UpdateTeamRequest } from '../types/teamTypes'

export function getTeams(token: string, search?: string) {
  const query = search?.trim()

  const endpoint = query
    ? `/api/teams?search=${encodeURIComponent(query)}`
    : '/api/teams'

  return apiRequest<TeamListItem[]>(endpoint, {
    token,
  })
}

export function getMyTeam(token: string) {
  return apiRequest<TeamDetail>('/api/teams/my', {
    token,
  })
}

export function getTeamById(token: string, teamId: number) {
  return apiRequest<TeamDetail>(`/api/teams/${teamId}`, {
    token,
  })
}

export function updateTeam(token: string, teamId: number, request: UpdateTeamRequest) {
  return apiRequest<void>(`/api/admin/teams/${teamId}`, {
    method: 'PUT',
    body: request,
    token,
  })
}