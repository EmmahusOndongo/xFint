export interface ExpenseFileEntity {
  id: string;
  expense_id: string;
  storage_path: string;
  mime_type: string;
  file_name: string;
  size_bytes: number;
  created_at: string;
}
