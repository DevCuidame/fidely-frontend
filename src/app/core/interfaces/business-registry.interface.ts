export interface BusinessRegistryData {
  id?: number;
  owner_id: number;
  business_name: string;
  business_type?: string;
  tax_id?: string;
  registration_number?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  address_line1: string;
  address_line2?: string;
  city_id?: number;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';
  approved_at?: Date;
  approved_by?: number;
  rejection_reason?: string;
  subscription_plan: string;
  subscription_expires_at?: Date;
  features_enabled: object;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export enum BusinessStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

export interface IBusinessStats {
  total_transactions: number;
  total_points_awarded: number;
  total_rewards_delivered: number;
  average_rating: number;
  active_customers: number;
  monthly_transactions: number;
}

export interface IBusinessResponse {
  id: number;
  business_name: string;
  business_type?: string;
  email?: string;
  phone?: string;
  address_line1: string;
  city_id?: number;
  status: BusinessStatus;
  created_at: Date;
  // Agregar campos de imágenes
  logo_url?: string;
  banner_url?: string;
  gallery_images?: string[];
  owner: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  business_configuration?: {
    points_per_peso: number;
    minimum_purchase_amount: number;
    maximum_points_per_transaction: number;
  };
  stats?: IBusinessStats;
}

// Interfaz extendida para stamps-carousel que incluye información de puntos
export interface IBusinessWithPoints extends IBusinessResponse {
  total_points: number;
  available_points: number;
  lifetime_points: number;
  redeemed_points: number;
}