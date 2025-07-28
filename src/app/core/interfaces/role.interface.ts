import { User } from "./auth.interface";

export interface IRole {
  role_id: number;
  role_name: string;
  description?: string;
  permissions?: any;
  is_active: boolean;
  created_at: Date | string;
  userRoles?: IUserRole[];
}

export interface IUserRole {
  user_role_id: number;
  user_id: number;
  role_id: number;
  assigned_at: Date | string;
  expires_at?: Date | string;
  is_active: boolean;
  user?: User;
  role?: IRole;
}
