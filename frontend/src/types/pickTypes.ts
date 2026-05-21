export type CreatePickRequest = {
  userId: number;
};

export type PickResult = {
  pickId: number;
  teamId: number;
  teamName: string;
  userId: number;
  pickOrder: number;
  firstName: string;
  lastName: string;
  photoPath: string | null;
};
