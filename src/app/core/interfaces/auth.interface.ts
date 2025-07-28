import { UserStatus } from "./enums";

// Interfaz para el registro del usuario
export interface RegisterData {
  first_name: string;
  last_name: string;        // Antes last_name
  identification_type: string;          // Antes identification_type
  identification_number: string;        // Antes identification_number
  phone: string;
  email: string;
  password_hash: string;
  city_id: number;         // ID de la ciudad (numérico)
  address: string;
  pubName?: string;        // Antes public_name
  imageBs64?: string;      // Antes base_64
}

// Interfaz para el usuario autenticado
export interface User {
  id?: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number?: string;
  birth_date?: Date;
  address?: string;
  gender: string;
  city_id?: number;
  department?: number;        
  phone_country_code: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  total_points: number;
  available_points: number;
  lifetime_points: number;
  qr_code?: string;
  profile_image_url?: string;
  imagebs64?: string;
  notification_preferences?: NotificationPreferences;
  last_latitude?: number;
  last_longitude?: number;
  last_location_update?: Date;
  session_token?: string;
  verified: boolean;
   role?: string;
  pubname?: string;
  privname?: string;
  created_at?: Date;
  updated_at?: Date;
}

// export interface User {
//   id: number;
//   code?: string;           // Código único de usuario
//   hashcode?: string;       // Hash code (para recuperación de contraseña)
//   first_name: string;
//   last_name: string;        // Antes last_name
//   typeperson?: string;     // Tipo de persona
//   identification_type: string;          // Antes identification_type
//   identification_number?: string;       // Antes identification_number
//   address?: string;
//   city_id?: number;        // ID de la ciudad (numérico)
//   department?: number;        
//   phone: string;
//   status: UserStatus;
//   gender?: string;
//   birth_date?: Date | string;
//   email: string;
//   parentesco?: string;     // Relación de parentesco
//   notificationid?: string; // ID para notificaciones
//   verified?: boolean;      // Estado de verificación (alternativo)
//   session_token?: string;  // Token de sesión
//   password_hash?: string;  // Hash de contraseña
//   created_at: Date | string;
//   updated_at: Date | string;
//   pubname?: string;        // Nombre público
//   privname?: string;       // Nombre privado
//   imagebs64?: string;      // Imagen en base64
//   path?: string;           // Ruta de la imagen
//   role?: string;           // Rol principal (para compatibilidad)
//   user_roles?: UserRole[]; // Roles del usuario con información completa
//   isAdmin?: boolean;       // Indica si el usuario es un administrador
// }


export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}


// Interfaz para los roles de usuario desde el backend
export interface UserRole {
  user_role_id: number;
  user_id: number;
  role_id: number;
  assigned_at: Date | string;
  expires_at?: Date | string | null;
  is_active: boolean;
  role: {
    role_id: number;
    role_name: string;
    description: string;
    permissions: any;
    is_active: boolean;
    created_at: Date | string;
  };
}

// Interfaz para la respuesta del backend de usuarios
export interface UsersApiResponse {
  success: boolean;
  data: User[];
  metadata: {
    totalItems: number;
    itemCount: number;
    totalPages: number;
    currentPage: number;
  };
  timestamp: string;
}
