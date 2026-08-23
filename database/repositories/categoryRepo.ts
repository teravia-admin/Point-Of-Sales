import { getDatabase } from '../client';
import { Category } from '@/types';

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
}

export async function addCategory(name: string, color: string = '#4F46E5'): Promise<Category> {
  const db = await getDatabase();
  const id = 'cat_' + Date.now();
  await db.runAsync(
    'INSERT INTO categories (id, name, color) VALUES (?, ?, ?);',
    [id, name, color]
  );
  return { id, name, color };
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
}
