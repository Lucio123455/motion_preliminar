import { api } from "./api";

export interface ProgressEntry {
  id: number;
  user_id: number;
  exercise_id: number;
  weight_kg: number;
  reps: number;
  set_number: number;
  date: string;
}

export interface ProgressCreate {
  user_id: number;
  exercise_id: number;
  weight_kg: number;
  reps: number;
  set_number: number;
  date: string;
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export const progressService = {
  listByExerciseToday: (userId: number, exerciseId: number) => {
    const today = todayString();
    return api.get<ProgressEntry[]>(
      `/progress/?user_id=${userId}&exercise_id=${exerciseId}&from_date=${today}&to_date=${today}`
    );
  },
  create: (data: ProgressCreate) => api.post<ProgressEntry>("/progress/", data),
  getLastWeight: (userId: number, exerciseId: number) =>
    api.get<ProgressEntry>(`/progress/last?user_id=${userId}&exercise_id=${exerciseId}`),
  update: (progressId: number, data: { weight_kg: number; reps: number }) =>
    api.put<ProgressEntry>(`/progress/${progressId}`, data),
};
