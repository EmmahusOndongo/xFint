// services/users.service.ts
import { api } from "@/lib/apiClient";
import type { AuthUser, Role } from "@/lib/types";

// --- Types API ---
export type CreateUserResponse = {
  id: string;
  email: string;
  role: Role;
  must_set_password: boolean;
  tempPassword: string;
};

export type UserListItem = {
  id: string;
  email: string;
  role: Role;
  must_set_password: boolean;
  created_at: string; // ISO
};

export type ChangePasswordDTO = {
  currentPassword: string;
  newPassword: string;
};

export type SetAvatarResponse = {
  ok: boolean;
  path: string;
  url?: string; // présent si bucket public ou si tu renvoies une signed URL côté backend
};

export type SignedUrlResponse = {
  url: string;
  expiresIn: number;
};

export const usersService = {
  // Manager: créer un utilisateur (retourne aussi le mot de passe temporaire)
  async create(payload: AuthUser): Promise<CreateUserResponse> {
    const { data } = await api.post<CreateUserResponse>("/users", payload, {
      withCredentials: true,
    });
    return data;
  },

  // Manager: lister les utilisateurs
  async list(): Promise<UserListItem[]> {
    const { data } = await api.get<UserListItem[]>("/users", {
      withCredentials: true,
    });
    return data;
  },

  // Manager: régénérer un mot de passe temporaire pour un user
  async resetTempPassword(userId: string): Promise<{ ok: true; tempPassword: string }> {
    const { data } = await api.post<{ ok: true; tempPassword: string }>(
      `/users/${userId}/reset-temp-password`,
      {},
      { withCredentials: true }
    );
    return data;
  },

  // Utilisateur connecté: changer son mot de passe
  async changePassword(dto: ChangePasswordDTO): Promise<{ ok: true }> {
    const { data } = await api.post<{ ok: true }>(
      "/users/me/change-password",
      dto,
      { withCredentials: true }
    );
    return data;
  },

  // Utilisateur connecté: uploader / mettre à jour son avatar
  async setAvatar(file: File): Promise<SetAvatarResponse> {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<SetAvatarResponse>("/users/me/avatar", fd, {
      withCredentials: true,
      // ❌ NE PAS mettre headers: { 'Content-Type': 'multipart/form-data' }
      // Le navigateur ajoute le bon 'boundary' automatiquement.
    });
    return data;
  },

  // Utilisateur connecté: récupérer une URL signée de l’avatar (si bucket privé)
  async getAvatarSignedUrl(): Promise<SignedUrlResponse> {
    const { data } = await api.get<SignedUrlResponse>("/users/me/avatar/url", {
      withCredentials: true,
    });
    return data;
  },
};