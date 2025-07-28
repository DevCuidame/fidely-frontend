export interface RedemptionData {
  id?: number;
  user_id: number;
  reward_id: number;
  business_id?: number;
  points_used: number;
  transaction_id?: number;
  status: 'requested' | 'approved' | 'delivered' | 'cancelled' | 'expired';
  approved_by?: number;
  approved_at?: Date;
  delivered_by?: number;
  delivered_at?: Date;
  delivery_method?: string;
  redemption_code?: string;
  qr_code_url?: string;
  user_rating?: number;
  user_feedback?: string;
  feedback_date?: Date;
  expires_at?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}