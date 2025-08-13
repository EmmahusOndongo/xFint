import { api } from "../lib/apiClient";
import type { Expense, CreateExpenseDTO } from "../lib/types";

const base = "/expenses";

export const expensesService = {
  // Page 2 — current user (fix route)
  async getMine() {
    const { data } = await api.get<Expense[]>(`${base}/my`, { withCredentials: true });
    return data;
  },

  // Page 4 — manager view (fix route)
  async getForManager() {
    const { data } = await api.get<Expense[]>(`${base}`, { withCredentials: true });
    return data;
  },

  // Page 4 — accounting view (OK)
  async getForAccounting() {
    const { data } = await api.get<Expense[]>(`${base}/accounting/list`, { withCredentials: true });
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get<Expense>(`${base}/${id}`, { withCredentials: true });
    return data;
  },

  // Création en 2 temps: 1) JSON, 2) upload fichiers
  async create(dto: CreateExpenseDTO) {
    // 1) créer la note (JSON, pas multipart)
    const { data: created } = await api.post<Expense>(
      `${base}`,
      { title: dto.title, comment: dto.comment ?? undefined },
      { withCredentials: true }
    );

    // 2) uploader les pièces si présentes
    if (dto.files && dto.files.length > 0) {
      const form = new FormData();
      dto.files.forEach((file) => form.append("files", file)); // FilesInterceptor('files')
      await api.post(`${base}/${created.id}/files`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Optionnel: recharger le détail complet (avec files) si tu veux
    return this.getOne(created.id);
  },

  async approve(id: string, comment?: string) {
    const { data } = await api.patch<Expense>(`${base}/${id}/approve`, { comment }, { withCredentials: true });
    return data;
  },

  async reject(id: string, comment?: string) {
    const { data } = await api.patch<Expense>(`${base}/${id}/reject`, { comment }, { withCredentials: true });
    return data;
  },

  async process(id: string, comment?: string) {
    const { data } = await api.patch<Expense>(`${base}/${id}/process`, { comment }, { withCredentials: true });
    return data;
  },
};