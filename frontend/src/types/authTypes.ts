export type UserRole = 'Admin' | 'Coordinator' | 'Leader' | 'Participant'

export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  token: string
  userId: number
  username: string
  role: UserRole
}

export type CurrentUser = {
  userId: number
  username: string
  role: UserRole
}