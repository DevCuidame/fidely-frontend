export interface RewardCatalogData {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  points_required: number;
  stock_quantity?: number;
  unlimited_stock: boolean;
  reward_type: 'product' | 'service' | 'discount' | 'cashback';
  reward_value?: number;
  discount_percentage?: number;
  business_id?: number;
  business_specific: boolean;
  image_url?: string;
  terms_and_conditions?: string;
  is_active: boolean;
  available_from?: Date;
  available_until?: Date;
  max_redemptions_per_user?: number;
  max_total_redemptions?: number;
  current_redemptions: number;
  display_order: number;
  is_featured: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}