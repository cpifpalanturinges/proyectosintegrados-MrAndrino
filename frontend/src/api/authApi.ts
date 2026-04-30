import { apiRequest } from './apiClient'
import type { AuthResponse, CurrentUser, LoginRequest } from '../types/authTypes'

export function login(request: LoginRequest) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: request,
  })
}

export function getCurrentUser(token: string) {
  return apiRequest<CurrentUser>('/api/auth/me', {
    token,
  })
}