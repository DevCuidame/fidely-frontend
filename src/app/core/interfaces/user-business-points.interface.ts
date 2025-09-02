import { User } from './auth.interface';
import { BusinessRegistryData } from './business-registry.interface';

export interface IUserBusinessPoints {
  id: number;
  user_id: number;
  business_id: number;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  redeemed_points: number;
  last_transaction_date?: Date;
  promotional_image?: string;
  created_at: Date;
  updated_at: Date;

  user?: User;
  business?: BusinessRegistryData;
}

export interface IUserBusinessPointsBalance {
  userId: number;
  businessId: number;
  businessName?: string;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  redeemedPoints: number;
  lastTransactionDate?: Date;
  // Agregar imagen promocional
  promotionalImage?: string;
  has_active_deal: boolean;
  required_points: number;
}

export interface IGlobalPointsBalance {
  userId: number;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  pendingPoints: number;
  redeemedPoints: number;
  lastTransactionDate?: Date;
}

export interface IUserPointsResponse {
  userId: number;
  globalBalance: IGlobalPointsBalance;
  businessBalances: IUserBusinessPointsBalance[];
  totalAvailablePoints: number;
}
