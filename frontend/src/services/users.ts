import { api } from "./api";

export interface User {
  id: number;
  name: string;
}

export const usersService = {
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, name: string) => api.put<User>(`/users/${id}`, { name }),
  login: (name: string, password: string) =>
    api.post<User>("/users/login", { name, password }),
  register: (name: string, password: string) =>
    api.post<User>("/users/", { name, password }),
};
