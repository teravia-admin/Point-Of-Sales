import { create } from 'zustand';
import { Product, OrderType } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  customerName: string;
  tableNumber: string;
  orderType: OrderType;
  discountType: 'NOMINAL' | 'PERCENTAGE';
  discountValue: number;

  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  setCustomerInfo: (name: string, table: string) => void;
  setOrderType: (type: OrderType) => void;
  setDiscount: (type: 'NOMINAL' | 'PERCENTAGE', value: number) => void;
  clearCart: () => void;
  
  getSubtotal: () => number;
  getDiscountAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: '',
  tableNumber: '',
  orderType: 'DINE_IN',
  discountType: 'NOMINAL',
  discountValue: 0,

  addItem: (product: Product, notes: string = '') => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += 1;
        if (notes) updated[existingIndex].notes = notes;
        return { items: updated };
      }
      return { items: [...state.items, { product, quantity: 1, notes }] };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.product.id !== productId) };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  updateItemNotes: (productId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  },

  setCustomerInfo: (customerName, tableNumber) => {
    set({ customerName, tableNumber });
  },

  setOrderType: (orderType) => {
    set({ orderType });
  },

  setDiscount: (type, value) => {
    set({ discountType: type, discountValue: value });
  },

  clearCart: () => {
    set({
      items: [],
      customerName: '',
      tableNumber: '',
      orderType: 'DINE_IN',
      discountType: 'NOMINAL',
      discountValue: 0,
    });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.selling_price * item.quantity,
      0
    );
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discountType, discountValue } = get();
    if (discountType === 'PERCENTAGE') {
      return (subtotal * discountValue) / 100;
    }
    return Math.min(discountValue, subtotal);
  },
}));
