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