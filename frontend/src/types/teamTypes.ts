export type TeamListItem = {
  teamId: number
  name: string
  leaderUserId: number
  leaderName: string
  membersCount: number
}

export type TeamUserItem = {
  userId: number
  pickId: number | null
  pickOrder: number | null

  firstName: string
  lastName: string
  photoPath: string | null

  studies: string | null
  skill1: number | null
  skill2: number | null
  skill3: number | null
  skill4: number | null
}

export type TeamDetail = {
  teamId: number
  name: string
  leader: TeamUserItem
  members: TeamUserItem[]
}

export type UpdateTeamRequest = {
  name: string
}