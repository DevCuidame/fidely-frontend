export interface InvoiceData {
  id?: number;
  transaction_id: number;
  invoice_number: string;
  invoice_amount: number;
  invoice_date: Date;
  image_url?: string;
  is_validated: boolean;
  validated_by?: number;
  validated_at?: Date;
  validation_notes?: string;
  ocr_processed: boolean;
  ocr_data?: object;
  ocr_confidence?: number;
  created_at?: Date;
  updated_at?: Date;
}