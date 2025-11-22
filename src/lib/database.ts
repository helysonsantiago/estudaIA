import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const dbDir = join(process.cwd(), 'data');
const dbPath = join(dbDir, 'estudaia.db');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
`);

export interface Analysis {
  id?: number;
  file_name: string;
  result: any;
  created_at?: string;
}

export function saveAnalysis(analysis: Analysis): number {
  const stmt = db.prepare('INSERT INTO analyses (file_name, result) VALUES (?, ?)');
  const result = stmt.run(analysis.file_name, JSON.stringify(analysis.result));
  return result.lastInsertRowid as number;
}

export function getAnalysisById(id: number): Analysis | null {
  const stmt = db.prepare('SELECT * FROM analyses WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    file_name: row.file_name,
    result: JSON.parse(row.result),
    created_at: row.created_at
  };
}

export function getAllAnalyses(limit: number = 50): Analysis[] {
  const stmt = db.prepare('SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?');
  const rows = stmt.all(limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    file_name: row.file_name,
    result: JSON.parse(row.result),
    created_at: row.created_at
  }));
}

export function deleteAnalysis(id: number): boolean {
  const stmt = db.prepare('DELETE FROM analyses WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function clearHistory(): void {
  db.exec('DELETE FROM analyses');
}

export default db;