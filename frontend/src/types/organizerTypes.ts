export type CoordinatorListItem = {
  userId: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
};

export type CreateCoordinatorRequest = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  photo?: File | null;
};
