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

export interface ExerciseBasic {
  id: number;
  name: string;
  muscle_group: string | null;
}

export interface DayExercise {
  id: number;
  exercise_id: number;
  exercise: ExerciseBasic;
  sets: number;
  reps: number;
  exercise_order: number;
}

export interface DayDetail extends Day {
  day_exercises: DayExercise[];
}

export const routinesService = {
  list: (userId: number) => api.get<Routine[]>(`/routines/?user_id=${userId}`),
  create: (data: { user_id: number; name: string; description?: string; principal?: boolean }) =>
    api.post<Routine>("/routines/", data),
  listDays: (routineId: number) => api.get<Day[]>(`/routines/${routineId}/days/`),
  getDay: (routineId: number, dayId: number) => api.get<DayDetail>(`/routines/${routineId}/days/${dayId}`),
  createDay: (routineId: number, data: { name: string; day_order: number }) =>
    api.post<Day>(`/routines/${routineId}/days/`, data),
  addExercise: (routineId: number, dayId: number, data: { exercise_id: number; sets: number; reps: number; exercise_order: number }) =>
    api.post(`/routines/${routineId}/days/${dayId}/exercises`, data),
  remove: (routineId: number) => api.del(`/routines/${routineId}`),
};
