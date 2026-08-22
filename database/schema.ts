export const CREATE_TABLES_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      tax_enabled INTEGER DEFAULT 1,
      tax_rate REAL DEFAULT 11.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('OWNER', 'CASHIER')) NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#4F46E5'
  );

  CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      sku TEXT,
      barcode TEXT,
      cost_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      unit TEXT DEFAULT 'pcs',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS cash_shifts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      opening_cash REAL NOT NULL,
      closing_cash REAL,
      expected_cash REAL,
      status TEXT CHECK(status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
      opened_at TEXT DEFAULT CURRENT_TIMESTAMP,
      closed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      transaction_no TEXT UNIQUE NOT NULL,
      shift_id TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      paid_amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT CHECK(status IN ('COMPLETED', 'VOID', 'REFUNDED')) DEFAULT 'COMPLETED',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(shift_id) REFERENCES cash_shifts(id)
  );

  CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      cost_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      type TEXT CHECK(type IN ('IN', 'OUT', 'ADJUSTMENT', 'SALE', 'VOID')) NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Indeks Performa Query
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
  CREATE INDEX IF NOT EXISTS idx_transactions_shift ON transactions(shift_id);
  CREATE INDEX IF NOT EXISTS idx_items_transaction ON transaction_items(transaction_id);
`;

export const SEED_DEFAULT_CATEGORIES_SQL = `
  INSERT OR IGNORE INTO categories (id, name, color) VALUES 
  ('cat_1', 'Makanan', '#EF4444'),
  ('cat_2', 'Minuman', '#3B82F6'),
  ('cat_3', 'Snack', '#F59E0B'),
  ('cat_4', 'Lainnya', '#6B7280');
`;
