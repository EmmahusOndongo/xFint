import { api } from "../lib/apiClient";

export const filesService = {
  async upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/files/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { url: string };
  },
};