import { apiRequest } from './apiClient'
import type { AvailableParticipant, ParticipantSortBy } from '../types/participantTypes'

export function getAvailableParticipants(
  token: string,
  options: {
    search?: string
    sortBy?: ParticipantSortBy
  } = {},
) {
  const params = new URLSearchParams()

  if (options.search?.trim()) {
    params.set('search', options.search.trim())
  }

  if (options.sortBy && options.sortBy !== 'total') {
    params.set('sortBy', options.sortBy)
  }

  const query = params.toString()
  const endpoint = query ? `/api/participants/available?${query}` : '/api/participants/available'

  return apiRequest<AvailableParticipant[]>(endpoint, {
    token,
  })
}