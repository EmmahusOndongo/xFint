import { useMutation } from "@tanstack/react-query";
import { filesService } from "@/services/files.service";

export function useUpload() {
  const upload = useMutation({ mutationFn: filesService.upload });
  return { upload };
}