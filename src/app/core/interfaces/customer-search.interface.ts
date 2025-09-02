export interface CustomerSearchResponseDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  identification_type: string;
  identification_number: string;
  phone?: string;
  profile_image_url?: string;
  business_points: {
    business_id: number;
    total_points: number;
    available_points: number;
    lifetime_points: number;
    required_points: number;
    has_active_deal: boolean;
    last_transaction_date?: Date;
  };
}

export interface CustomerSearchApiResponse {
  success: boolean;
  data: CustomerSearchResponseDto;
  message?: string;
}