import { apiRequest } from './apiClient'
import type { AdminUserDetail, AdminUserListItem } from '../types/adminUserTypes'

export type UpdateUserRequest = {
  firstName: string
  lastName: string
  studies: string | null
  skill1: number | null
  skill2: number | null
  skill3: number | null
  skill4: number | null
}

export type UpdateUserPasswordRequest = {
  newPassword: string
}

export function getAdminUsers(token: string, search?: string) {
  const query = search?.trim()

  const endpoint = query
    ? `/api/admin/users?search=${encodeURIComponent(query)}`
    : '/api/admin/users'

  return apiRequest<AdminUserListItem[]>(endpoint, {
    token,
  })
}

export function getAdminUserById(userId: number, token: string) {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${userId}`, {
    token,
  })
}

export function updateUser(userId: number, request: UpdateUserRequest, token: string) {
  return apiRequest<void>(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: request,
    token,
  })
}

export function updateUserPhoto(userId: number, photo: File, token: string) {
  const formData = new FormData()
  formData.append('photo', photo)

  return apiRequest<void>(`/api/admin/users/${userId}/photo`, {
    method: 'PUT',
    body: formData,
    token,
    isFormData: true,
  })
}

export function resetUserPhoto(userId: number, token: string) {
  return apiRequest<void>(`/api/admin/users/${userId}/photo`, {
    method: 'DELETE',
    token,
  })
}

export function updateUserPassword(
  userId: number,
  request: UpdateUserPasswordRequest,
  token: string,
) {
  return apiRequest<void>(`/api/admin/users/${userId}/password`, {
    method: 'PUT',
    body: request,
    token,
  })
}

export function deleteUser(userId: number, token: string) {
  return apiRequest<void>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  })
}