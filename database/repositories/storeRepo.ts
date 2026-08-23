import { getDatabase } from '../client';
import { StoreProfile, User } from '@/types';

export async function createStoreAndOwner(data: {
  storeName: string;
  address: string;
  phone: string;
  taxEnabled: boolean;
  taxRate: number;
  ownerName: string;
  pin: string;
}): Promise<void> {
  const db = await getDatabase();
  
  const storeId = 'store_' + Date.now();
  const userId = 'user_' + Date.now();
  
  // Hash PIN sederhana untuk keamanan lokal
  const pinHash = await hashPin(data.pin);

  await db.withTransactionAsync(async () => {
    // Insert Store Profile
    await db.runAsync(
      `INSERT INTO stores (id, name, address, phone, tax_enabled, tax_rate) VALUES (?, ?, ?, ?, ?, ?);`,
      [storeId, data.storeName, data.address, data.phone, data.taxEnabled ? 1 : 0, data.taxRate]
    );

    // Insert Owner User
    await db.runAsync(
      `INSERT INTO users (id, name, pin_hash, role) VALUES (?, ?, ?, 'OWNER');`,
      [userId, data.ownerName, pinHash]
    );
  });
}

export async function getStoreProfile(): Promise<StoreProfile | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<any>('SELECT * FROM stores LIMIT 1');
  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    address: result.address,
    phone: result.phone,
    tax_enabled: Boolean(result.tax_enabled),
    tax_rate: result.tax_rate,
    created_at: result.created_at,
  };
}

async function hashPin(pin: string): Promise<string> {
  // Simple hashing algorithm untuk penyimpanan PIN lokal
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pin_' + Math.abs(hash).toString(16);
}
