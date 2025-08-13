import type { Role } from "@/lib/types";

type Ability =
  | "expense:create"
  | "expense:read"
  | "expense:update"
  | "expense:delete"
  | "user:create"
  | "user:read";

const ROLE_POLICIES: Record<Role, Ability[]> = {
  EMPLOYEE: ["expense:create", "expense:read"],
  ACCOUNTING: ["expense:create", "expense:read", "expense:update", "user:read"],
  MANAGER: ["expense:create", "expense:read", "expense:update", "expense:delete", "user:create", "user:read"],
};

export function can(role: Role | undefined, ability: Ability) {
  if (!role) return false;
  return ROLE_POLICIES[role]?.includes(ability) ?? false;
}