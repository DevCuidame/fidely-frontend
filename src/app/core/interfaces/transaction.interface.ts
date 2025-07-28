export interface TransactionData {
  id?: number;
  user_id: number;
  business_id: number;
  transaction_type: 'earn' | 'redeem' | 'adjustment' | 'bonus' | 'penalty';
  points_amount: number;
  purchase_amount?: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  validated_by?: number;
  validated_at?: Date;
  validation_method?: string;
  reference_id?: string;
  description?: string;
  notes?: string;
  transaction_latitude?: number;
  transaction_longitude?: number;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}