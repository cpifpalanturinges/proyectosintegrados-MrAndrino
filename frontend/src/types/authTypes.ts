export type UserRole = "Admin" | "Coordinator" | "Leader" | "Participant";

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
};

export type CurrentUser = {
  userId: number;
  username: string;
  role: UserRole;

  firstName: string;
  lastName: string;
  photoPath: string | null;

  studies: string | null;
  skill1: number | null;
  skill2: number | null;
  skill3: number | null;
  skill4: number | null;

  assignedTeamId: number | null;
  assignedTeamName: string | null;
};
