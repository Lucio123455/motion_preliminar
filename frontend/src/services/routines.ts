import { api } from "./api";

export interface Routine {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  principal: boolean;
}

export interface Day {
  id: number;
  routine_id: number;
  name: string;
  day_order: number;
}

export const routinesService = {
  list: (userId: number) => api.get<Routine[]>(`/routines/?user_id=${userId}`),
  create: (data: { user_id: number; name: string; description?: string; principal?: boolean }) =>
    api.post<Routine>("/routines/", data),
  createDay: (routineId: number, data: { name: string; day_order: number }) =>
    api.post<Day>(`/routines/${routineId}/days/`, data),
  addExercise: (routineId: number, dayId: number, data: { exercise_id: number; sets: number; reps: number; exercise_order: number }) =>
    api.post(`/routines/${routineId}/days/${dayId}/exercises`, data),
};
