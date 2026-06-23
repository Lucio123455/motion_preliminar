import { api } from "./api";

export interface Routine {
  id: number;
  name: string;
  description: string | null;
}

export const routinesService = {
  list: () => api.get<Routine[]>("/routines/"),
};
