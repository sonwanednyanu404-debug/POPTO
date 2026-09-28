import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema-sql';
import { runSeed } from './seed';

function getDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;

  const isLambda = Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isLambda) {
    const tmpPath = '/tmp/popto.db';
    if (!fs.existsSync(tmpPath)) {
      const bundled = path.resolve(process.cwd(), 'data', 'popto.db');
      try {
        if (fs.existsSync(bundled)) {
          fs.copyFileSync(bundled, tmpPath);
        }
      } catch (copyErr) {
        console.warn('Copy bundled db warning:', copyErr);
      }
    }
    return tmpPath;
  }

  return path.resolve(process.cwd(), 'data', 'popto.db');
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    const dataDir = path.dirname(dbPath);
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch {
      // ignored on read-only environments
    }

    db = new Database(dbPath);
    try {
      const isLambda = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
      if (isLambda) {
        db.pragma('journal_mode = DELETE');
      } else {
        db.pragma('journal_mode = WAL');
      }
      db.pragma('foreign_keys = ON');
    } catch (pIrr) {
      console.warn('Pragma warning:', pIrr);
    }

    // Auto-initialize schema and seed if brand new database
    try {
      const checkTable = db.prepare("SELECT count(name) as count FROM sqlite_master WHERE type='table' AND name='users'").get() as { count: number } | undefined;
      if (!checkTable || checkTable.count === 0) {
        db.exec(SCHEMA_SQL);
        runSeed(db);
      }
    } catch (conflictErr) {
      // Handled
    }
  }
  return db;
}

export function queryAll<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[] {
  const stmt = getDb().prepare(sql);
  return (params ? stmt.all(...params) : stmt.all()) as T[];
}

export function queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined {
  const stmt = getDb().prepare(sql);
  return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
}

export function execute(sql: string, params?: unknown[]): Database.RunResult {
  const stmt = getDb().prepare(sql);
  return params ? stmt.run(...params) : stmt.run();
}

export function transaction<T>(fn: () => T): T {
  const txn = getDb().transaction(fn);
  return txn();
}

export default getDb;
