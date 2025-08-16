// lib/types.ts
export type Role = "EMPLOYEE" | "MANAGER" | "ACCOUNTING";

export type AuthUser = {
  email: string;
  role: Role;
  full_name?: string;
  must_set_password?: boolean;
  avatarUrl?: string | null;
  
};

export type ExpenseStatus = "CREATED" | "APPROVED" | "REJECTED" | "PROCESSED";

export const expenseStatusLabel: Record<ExpenseStatus, string> = {
  CREATED: "Créée",
  APPROVED: "Validée",
  REJECTED: "Refusée",
  PROCESSED: "Traitée",
};

export interface ExpenseFile {
  id: string;
  expense_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  /** backend may return one of these */
  url?: string;           // preferred if provided by StorageService
  storage_path?: string;  // fallback
}

export interface Expense {
  id: string;
  title: string;
  comment?: string | null;
  status: ExpenseStatus;
  submitted_at: string;   // ISO
  updated_at: string;     // ISO
  employee_id: string;
  employee?: { id: string; email: string }; // present on lists for manager/accounting
  manager_comment?: string | null;
  accounting_comment?: string | null;
  files?: ExpenseFile[]; // present on details (GET /expenses/:id)
}

export type LoginDTO = { email: string; password: string };
export type SetPasswordDTO = { newPassword: string };

// For creation: title + optional comment + multiple files
export type CreateExpenseDTO = { title: string; comment?: string; files?: File[] };