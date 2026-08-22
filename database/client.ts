import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SEED_DEFAULT_CATEGORIES_SQL } from './schema';

const DB_NAME = 'kasirkita.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  
  try {
    await db.execAsync(CREATE_TABLES_SQL);
    await db.execAsync(SEED_DEFAULT_CATEGORIES_SQL);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}
