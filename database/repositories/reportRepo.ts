import { getDatabase } from '../client';
import { Transaction } from '@/types';

export interface SalesSummary {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  transactionCount: number;
}

export interface BestSellerProduct {
  productId: string;
  productName: string;
  totalQty: number;
  totalSales: number;
}

export async function getTransactionsList(searchQuery: string = ''): Promise<Transaction[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (searchQuery.trim()) {
    sql += ' AND (transaction_no LIKE ? OR customer_name LIKE ? OR table_number LIKE ?)';
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY created_at DESC LIMIT 100;';
  return await db.getAllAsync<Transaction>(sql, params);
}

export async function voidTransaction(transactionId: string): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // 1. Ambil item transaksi untuk mengembalikan stok
    const items = await db.getAllAsync<any>(
      'SELECT product_id, quantity FROM transaction_items WHERE transaction_id = ?;',
      [transactionId]
    );

    // 2. Kembalikan stok produk & catat pergerakan stok
    for (const item of items) {
      await db.runAsync('UPDATE products SET stock = stock + ? WHERE id = ?;', [
        item.quantity,
        item.product_id,
      ]);

      const movementId = 'mov_void_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
      await db.runAsync(
        `INSERT INTO stock_movements (id, product_id, qty, type, reason) VALUES (?, ?, ?, 'ADJUSTMENT', ?);`,
        [movementId, item.product_id, item.quantity, `Void Transaksi #${transactionId}`]
      );
    }

    // 3. Update status transaksi menjadi VOID
    await db.runAsync('UPDATE transactions SET status = "VOID" WHERE id = ?;', [transactionId]);
  });
}

export async function getSalesSummary(): Promise<SalesSummary> {
  const db = await getDatabase();

  // Hitung total revenue dari transaksi status COMPLETED
  const revResult = await db.getFirstAsync<any>(
    'SELECT SUM(grand_total) as total_revenue, COUNT(id) as total_count FROM transactions WHERE status = "COMPLETED";'
  );

  // Hitung total harga modal (cost) dari item transaksi status COMPLETED
  const costResult = await db.getFirstAsync<any>(
    `SELECT SUM(ti.cost_price * ti.quantity) as total_cost 
     FROM transaction_items ti 
     JOIN transactions t ON ti.transaction_id = t.id 
     WHERE t.status = "COMPLETED";`
  );

  const totalRevenue = revResult?.total_revenue || 0;
  const totalCost = costResult?.total_cost || 0;
  const grossProfit = totalRevenue - totalCost;
  const transactionCount = revResult?.total_count || 0;

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    transactionCount,
  };
}

export async function getBestSellerProducts(limit: number = 5): Promise<BestSellerProduct[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT ti.product_id as productId, ti.product_name as productName, SUM(ti.quantity) as totalQty, SUM(ti.total_price) as totalSales
     FROM transaction_items ti
     JOIN transactions t ON ti.transaction_id = t.id
     WHERE t.status = "COMPLETED"
     GROUP BY ti.product_id, ti.product_name
     ORDER BY totalQty DESC
     LIMIT ?;`,
    [limit]
  );
  return rows;
}

export async function exportTransactionsCSV(): Promise<string> {
  const db = await getDatabase();
  const transactions = await db.getAllAsync<any>(
    'SELECT transaction_no, created_at, order_type, customer_name, table_number, payment_method, grand_total, status FROM transactions ORDER BY created_at DESC;'
  );

  let csv = 'No Transaksi,Tanggal,Tipe,Pelanggan,Meja,Metode Bayar,Total,Status\n';
  transactions.forEach((t) => {
    const dateStr = new Date(t.created_at).toLocaleString('id-ID');
    csv += `"${t.transaction_no}","${dateStr}","${t.order_type}","${t.customer_name || ''}","${t.table_number || ''}","${t.payment_method}",${t.grand_total},"${t.status}"\n`;
  });

  return csv;
        }
