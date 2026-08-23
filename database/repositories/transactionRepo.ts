import { getDatabase } from '../client';
import { CartItem } from '@/store/cartStore';
import { OrderType } from '@/types';

export async function createTransaction(data: {
  shiftId: string;
  customerName?: string;
  tableNumber?: string;
  orderType: OrderType;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  notes?: string;
  items: CartItem[];
}): Promise<string> {
  const db = await getDatabase();
  const transactionId = 'trx_' + Date.now();
  const transactionNo = 'TRX/' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);

  await db.withTransactionAsync(async () => {
    // Insert Transaction
    await db.runAsync(
      `INSERT INTO transactions 
      (id, transaction_no, shift_id, customer_name, table_number, order_type, subtotal, discount_amount, tax_amount, grand_total, paid_amount, change_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        transactionId,
        transactionNo,
        data.shiftId,
        data.customerName || null,
        data.tableNumber || null,
        data.orderType,
        data.subtotal,
        data.discountAmount,
        data.taxAmount,
        data.grandTotal,
        data.paidAmount,
        data.changeAmount,
        data.paymentMethod,
        data.notes || null,
      ]
    );

    // Insert Items & Potong Stok
    for (const item of data.items) {
      const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
      const itemTotal = item.product.selling_price * item.quantity;

      await db.runAsync(
        `INSERT INTO transaction_items 
        (id, transaction_id, product_id, product_name, cost_price, selling_price, quantity, total_price, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          itemId,
          transactionId,
          item.product.id,
          item.product.name,
          item.product.cost_price,
          item.product.selling_price,
          item.quantity,
          itemTotal,
          item.notes || null,
        ]
      );

      await db.runAsync(
        `UPDATE products SET stock = stock - ? WHERE id = ?;`,
        [item.quantity, item.product.id]
      );
    }
  });

  return transactionId;
}

export async function getTransactionById(id: string): Promise<{ transaction: any; items: any[] } | null> {
  const db = await getDatabase();
  const transaction = await db.getFirstAsync<any>('SELECT * FROM transactions WHERE id = ?;', [id]);
  if (!transaction) return null;

  const items = await db.getAllAsync<any>('SELECT * FROM transaction_items WHERE transaction_id = ?;', [id]);
  return { transaction, items };
}
