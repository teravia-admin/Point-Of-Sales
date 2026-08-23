import { getDatabase } from '../client';
import { Product } from '@/types';

export async function getProducts(searchQuery: string = '', categoryId: string | null = null): Promise<Product[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM products WHERE is_active = 1';
  const params: any[] = [];

  if (searchQuery.trim()) {
    sql += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  if (categoryId) {
    sql += ' AND category_id = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY name ASC';
  
  const rows = await db.getAllAsync<any>(sql, params);
  return rows.map(r => ({
    ...r,
    is_active: Boolean(r.is_active)
  }));
}

export async function saveProduct(product: Omit<Product, 'is_active'> & { is_active?: boolean }): Promise<void> {
  const db = await getDatabase();
  const exists = await db.getFirstAsync('SELECT id FROM products WHERE id = ?;', [product.id]);

  if (exists) {
    await db.runAsync(
      `UPDATE products SET 
        category_id = ?, name = ?, sku = ?, barcode = ?, 
        cost_price = ?, selling_price = ?, stock = ?, min_stock = ?, unit = ?
      WHERE id = ?;`,
      [
        product.category_id, product.name, product.sku, product.barcode,
        product.cost_price, product.selling_price, product.stock, product.min_stock,
        product.unit, product.id
      ]
    );
  } else {
    await db.runAsync(
      `INSERT INTO products 
      (id, category_id, name, sku, barcode, cost_price, selling_price, stock, min_stock, unit, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
      [
        product.id, product.category_id, product.name, product.sku, product.barcode,
        product.cost_price, product.selling_price, product.stock, product.min_stock, product.unit
      ]
    );
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDatabase();
  // Soft delete agar histori transaksi tetap aman
  await db.runAsync('UPDATE products SET is_active = 0 WHERE id = ?;', [id]);
}
