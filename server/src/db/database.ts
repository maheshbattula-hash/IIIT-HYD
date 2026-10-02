import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve directory paths safely across ESM and CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = process.env.DATABASE_FILE || path.join(DATA_DIR, 'collectiq.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Instantiate native SQLite connection
export const db = new DatabaseSync(DB_PATH);

// Initialize schema tables & indexes
export function initializeDatabase() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
  }
}

// Database helper functions with clean TypeScript typing
export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  const stmt = db.prepare(sql);
  const results = stmt.all(...params) as T[];
  return results.length > 0 ? results[0] : undefined;
}

export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

// Safely execute read-only queries with strict validation
export function executeReadOnlyQuery<T = any>(sql: string): { rows: T[]; rowCount: number } {
  // Guard against non-SELECT or DDL/DML
  const cleanSql = sql.trim().replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const forbiddenPatterns = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|ATTACH|DETACH|VACUUM|PRAGMA)\b/i;
  
  if (forbiddenPatterns.test(cleanSql)) {
    throw new Error('Forbidden operation: Only read-only SELECT queries are permitted in CollectIQ.');
  }

  const firstWord = cleanSql.split(/\s+/)[0]?.toUpperCase();
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    throw new Error('Forbidden operation: Query must begin with SELECT or WITH.');
  }

  const rows = queryAll<T>(cleanSql);
  return {
    rows,
    rowCount: rows.length,
  };
}
