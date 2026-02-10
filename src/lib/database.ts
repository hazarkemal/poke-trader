import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'trades.db');

export function getDb() {
  const db = new Database(DB_PATH);
  
  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      card_id TEXT NOT NULL,
      card_name TEXT NOT NULL,
      price_usd REAL NOT NULL,
      price_matic REAL,
      tx_hash TEXT,
      status TEXT DEFAULT 'pending',
      profit_usd REAL,
      notes TEXT
    );
    
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id TEXT UNIQUE NOT NULL,
      card_name TEXT NOT NULL,
      card_image TEXT,
      buy_price REAL NOT NULL,
      buy_date TEXT NOT NULL,
      current_price REAL,
      quantity INTEGER DEFAULT 1
    );
    
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id TEXT NOT NULL,
      price_usd REAL NOT NULL,
      timestamp TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY,
      total_trades INTEGER DEFAULT 0,
      winning_trades INTEGER DEFAULT 0,
      total_profit REAL DEFAULT 0,
      total_volume REAL DEFAULT 0,
      updated_at TEXT
    );
    
    INSERT OR IGNORE INTO stats (id) VALUES (1);
  `);
  
  return db;
}

export function recordTrade(trade: {
  type: 'buy' | 'sell';
  cardId: string;
  cardName: string;
  priceUsd: number;
  priceMatic?: number;
  txHash?: string;
  notes?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO trades (timestamp, type, card_id, card_name, price_usd, price_matic, tx_hash, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
  `).run(
    new Date().toISOString(),
    trade.type,
    trade.cardId,
    trade.cardName,
    trade.priceUsd,
    trade.priceMatic || null,
    trade.txHash || null,
    trade.notes || null
  );
  
  // Update stats
  db.prepare(`
    UPDATE stats SET 
      total_trades = total_trades + 1,
      total_volume = total_volume + ?,
      updated_at = ?
    WHERE id = 1
  `).run(trade.priceUsd, new Date().toISOString());
}

export function addHolding(card: {
  cardId: string;
  cardName: string;
  cardImage?: string;
  buyPrice: number;
}) {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO holdings (card_id, card_name, card_image, buy_price, buy_date, quantity)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(card.cardId, card.cardName, card.cardImage || null, card.buyPrice, new Date().toISOString());
}

export function removeHolding(cardId: string) {
  const db = getDb();
  db.prepare('DELETE FROM holdings WHERE card_id = ?').run(cardId);
}

export function getHoldings() {
  const db = getDb();
  return db.prepare('SELECT * FROM holdings').all();
}

export function getTrades(limit = 50) {
  const db = getDb();
  return db.prepare('SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?').all(limit);
}

export function getStats() {
  const db = getDb();
  const stats = db.prepare('SELECT * FROM stats WHERE id = 1').get() as any;
  const holdings = getHoldings();
  const portfolioValue = holdings.reduce((sum: number, h: any) => sum + (h.current_price || h.buy_price), 0);
  
  return {
    ...stats,
    holdings_count: holdings.length,
    portfolio_value: portfolioValue,
    win_rate: stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades * 100).toFixed(1) : 0
  };
}
