// services/users.service.ts
import { api } from "@/lib/apiClient";
import type { AuthUser, Role } from "@/lib/types";

type CreateUserResponse = {
  id: string;
  email: string;
  role: Role;
  must_set_password: boolean;
  tempPassword: string;
};

export const usersService = {
  async create(payload: AuthUser): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>("/users", payload, { withCredentials: true });
    return data;
  },
};
