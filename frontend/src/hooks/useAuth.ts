import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginDTO, AuthUser } from "../lib/types";

export function useAuth() {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["me"],
    queryFn: authService.me,
    staleTime: 1000 * 30,
  });

  const login = useMutation({
    mutationFn: (dto: LoginDTO) => authService.login(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => qc.setQueryData(["me"], null),
  });

  return { user, isLoading, login, logout };
}