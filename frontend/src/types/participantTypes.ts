export type AvailableParticipant = {
  userId: number;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  studies: string | null;
  skill1: number | null;
  skill2: number | null;
  skill3: number | null;
  skill4: number | null;
};

export type ParticipantSortBy =
  | "total"
  | "skill1"
  | "skill2"
  | "skill3"
  | "skill4";
