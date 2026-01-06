export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'operator' | 'viewer';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  name?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  employee_id?: string;
  biometric_data?: any;
  access_permissions?: any;
  login_attempts?: number;
}
