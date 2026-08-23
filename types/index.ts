export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'ONLINE';
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  tax_enabled: boolean;
  tax_rate: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  transaction_no: string;
  shift_id: string;
  customer_name?: string | null;
  table_number?: string | null;
  order_type: OrderType;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  status: 'COMPLETED' | 'VOID';
  notes?: string | null;
  created_at: string;
}
