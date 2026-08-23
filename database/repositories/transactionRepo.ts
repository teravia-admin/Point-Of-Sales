import { getDatabase } from '../client';
import { Transaction, TransactionItem, CartItem } from '@/types';

export async function createTransaction(data: {
  shiftId: string;
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
    // 1. Insert Transaction Header
    await db.runAsync(
      `INSERT INTO transactions 
      (id, transaction_no, shift_id, subtotal, discount_amount, tax_amount, grand_total, paid_amount, change_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        transactionId,
        transactionNo,
        data.shiftId,
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

    // 2. Insert Transaction Items & Update Product Stock
    for (const item of data.items) {
      const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
      const itemTotal = item.product.selling_price * item.quantity;

      await db.runAsync(
        `INSERT INTO transaction_items 
        (id, transaction_id, product_id, product_name, cost_price, selling_price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          itemId,
          transactionId,
          item.product.id,
          item.product.name,
          item.product.cost_price,
          item.product.selling_price,
          item.quantity,
          itemTotal,
        ]
      );

      // Potong Stok
      await db.runAsync(
        `UPDATE products SET stock = stock - ? WHERE id = ?;`,
        [item.quantity, item.product.id]
      );

      // Insert Stock Movement Audit
      const movementId = 'mov_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
      await db.runAsync(
        `INSERT INTO stock_movements (id, product_id, qty, type, reason) VALUES (?, ?, ?, 'SALE', ?);`,
        [movementId, item.product.id, -item.quantity, `Penjualan ${transactionNo}`]
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
