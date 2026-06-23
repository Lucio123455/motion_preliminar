import { api } from "./api";

export interface User {
  id: number;
  name: string;
}

export const usersService = {
  getById: (id: number) => api.get<User>(`/users/${id}`),
};
