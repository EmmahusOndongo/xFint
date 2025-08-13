import { api } from "../lib/apiClient";
import type { SetPasswordDTO, AuthUser } from "../lib/types";

export const authService = {
  async me(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get<AuthUser>("/auth/me", { withCredentials: true });
      return data;
    } catch {
      return null;
    }
  },
  async setPassword(dto: SetPasswordDTO) {
    await api.post("/auth/set-password", dto, { withCredentials: true }); // ✅ envoie { newPassword }
  },
  async login(dto: { email: string; password: string }) {
    await api.post("/auth/login", dto, { withCredentials: true });
  },
  async logout() {
    await api.post("/auth/logout", {}, { withCredentials: true });
  },
};
