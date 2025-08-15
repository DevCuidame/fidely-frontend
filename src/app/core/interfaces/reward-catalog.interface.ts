// Interfaces para el sistema de premios y catálogo

export interface Business {
  id: number;
  businessName: string;
  contactEmail: string;
  city_id: number;
}

export interface Reward {
  id: number;
  businessId: number;
  name: string;
  description: string;
  pointsRequired: number;
  stockQuantity: number;
  type: string;
  value: string;
  imageUrl: string;
  terms: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  maxRedemptionsPerUser: number;
  createdAt: string;
  updatedAt: string;
  business: Business;
  totalRedemptions: number;
  isAvailable: boolean;
}

export interface RewardCatalogPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface RewardCatalogResponse {
  success: boolean;
  data: Reward[];
  pagination: RewardCatalogPagination;
}

// Interfaces para milestone y premios disponibles
export interface AvailableReward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: string;
  imageUrl: string;
  isActive: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  identification_type: string;
  identification_number: string;
  phone: string;
  profile_image_url: string | null;
}

export interface MilestoneData {
  id: number;
  userId: number;
  businessId: number;
  businessName: string;
  businessLogo: string;
  milestoneType: string;
  rewardCode: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
  availableRewards: AvailableReward[];
  user: User;
}

export interface MilestoneResponse {
  success: boolean;
  data: MilestoneData;
}

// Interface para reclamar premio
export interface ClaimRewardRequest {
  rewardCode: string;
  selectedRewardId: number;
}

export interface ClaimRewardResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Estados para el manejo de premios
export interface RewardDeliveryState {
  isLoading: boolean;
  milestone: MilestoneData | null;
  selectedReward: AvailableReward | null;
  error: string | null;
  isClaimingReward: boolean;
  success: boolean;
}

// Interface legacy para compatibilidad
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