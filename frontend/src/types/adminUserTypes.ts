import type { UserRole } from './authTypes'

export type UserRoleFilter = 'all' | 'Leader' | 'Participant'

export type AdminUserListItem = {
  userId: number
  username: string
  role: UserRole
  firstName: string
  lastName: string
  photoPath: string | null
}

export type AdminUserDetail = {
  userId: number
  username: string
  role: UserRole
  firstName: string
  lastName: string
  photoPath: string | null
  studies: string | null
  skill1: number | null
  skill2: number | null
  skill3: number | null
  skill4: number | null
  assignedTeamId: number | null
  assignedTeamName: string | null
  pickId: number | null
}