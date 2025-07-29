export interface BusinessConfigurationData {
  id?: number;
  business_id: number;
  points_per_peso: number;
  minimum_purchase_amount: number;
  maximum_points_per_transaction: number;
  business_hours: object;
  total_transactions: number;
  total_points_awarded: number;
  total_rewards_delivered: number;
  average_rating: number;
  metrics_last_updated: Date;
  created_at?: Date;
  updated_at?: Date;
}