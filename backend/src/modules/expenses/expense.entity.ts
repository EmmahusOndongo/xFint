export interface ExpenseEntity {
  id: string;
  title: string;
  comment?: string | null;
  status: 'CREATED'|'APPROVED'|'REJECTED'|'PROCESSED';
  submitted_at: string;
  employee_id: string;
  manager_comment?: string | null;
  accounting_comment?: string | null;
  updated_at: string;
}
