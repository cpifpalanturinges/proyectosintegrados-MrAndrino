export type PickHistoryItem = {
  pickId: number;
  teamId: number;
  teamName: string;
  userId: number;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  pickOrder: number;
  createdAt: string;
  isCancelled: boolean;
};

export type UndoPickResult = {
  pickId: number;
  userId: number;
  message: string;
};
