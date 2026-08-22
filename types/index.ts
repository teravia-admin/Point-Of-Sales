export type UserRole = 'OWNER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  pin_hash: string;
  role: UserRole;
  created_at: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  tax_enabled: boolean;
  tax_rate: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

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

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CashShift {
  id: string;
  user_id: string;
  opening_cash: number;
  closing_cash: number | null;
  expected_cash: number | null;
  status: ShiftStatus;
  opened_at: string;
  closed_at: string | null;
}

export type TransactionStatus = 'COMPLETED' | 'VOID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBIT' | 'CREDIT' | 'OTHER';

export interface Transaction {
  id: string;
  transaction_no: string;
  shift_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  notes: string | null;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  total_price: number;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'VOID';

export interface StockMovement {
  id: string;
  product_id: string;
  qty: number;
  type: MovementType;
  reason: string | null;
  created_at: string;
}
