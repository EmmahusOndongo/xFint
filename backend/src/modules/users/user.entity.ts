
export interface UserEntity {
  id: string;
  email: string;
  role: 'EMPLOYEE'|'MANAGER'|'ACCOUNTING';
  password_hash: string | null;
  must_set_password: boolean;
  created_at: string;
  updated_at: string;
}
