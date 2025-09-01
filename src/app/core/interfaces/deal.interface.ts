export enum DealStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum RewardSourceType {
  CATALOG_PRODUCT = 'catalog_product',
  CUSTOM_REWARD = 'custom_reward'
}

export interface DealInterface {
  id: number;
  business_id: number;
  user_id: number;
  title: string;
  description?: string;
  required_visits: number;
  current_visits: number;
  expires_at: Date;
  reward_source_type: RewardSourceType;
  reward_catalog_id?: number;
  custom_reward_description?: string;
  custom_reward_value?: number;
  status: DealStatus;
  completed_at?: Date;
  redeemed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DealResponse {
  id: number;
  business_id: number;
  user_id: number;
  title: string;
  description?: string;
  required_visits: number;
  current_visits: number;
  expires_at: Date;
  reward_source_type: RewardSourceType;
  reward_catalog_id?: number;
  custom_reward_description?: string;
  custom_reward_value?: number;
  status: DealStatus;
  completed_at?: Date;
  redeemed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  catalogReward?: {
    id: number;
    name: string;
    points_required: number;
    description?: string;
  };
  visits?: {
    id: number;
    visit_date: Date;
    validation_method?: string;
  }[];
}