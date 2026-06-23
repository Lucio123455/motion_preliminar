import { api } from "./api";

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string | null;
  notes: string | null;
}

export const exercisesService = {
  list: () => api.get<Exercise[]>("/exercises/"),
};
