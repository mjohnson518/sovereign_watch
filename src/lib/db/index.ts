/**
 * Database Connection
 * 
 * Uses Vercel Postgres with Drizzle ORM.
 * Supports running without database for local development (API-only mode).
 */

import * as schema from './schema';

// Check if database is configured
const isDatabaseConfigured = !!(
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL
);

const skipDatabase = process.env.SKIP_DATABASE === 'true';

// Lazy initialization to avoid connection errors on import
let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const { sql } = require('@vercel/postgres');
  const { drizzle } = require('drizzle-orm/vercel-postgres');
  return drizzle(sql, { schema });
}

/**
 * Get the database instance.
 * Returns null if database is not configured or SKIP_DATABASE is true.
 */
export function getDb() {
  if (skipDatabase || !isDatabaseConfigured) {
    return null;
  }
  
  if (!_db) {
    try {
      _db = createDb();
    } catch (error) {
      console.warn('[DB] Failed to initialize database connection:', error);
      return null;
    }
  }
  
  return _db;
}

/**
 * Legacy export for backwards compatibility.
 * Throws if database is not configured.
 */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error(
        'Database not configured. Set POSTGRES_URL environment variable or use getDb() for optional database access.'
      );
    }
    return (instance as any)[prop];
  },
});

// Export whether database is available
export const isDbAvailable = isDatabaseConfigured && !skipDatabase;

// Re-export schema for convenience
export * from './schema';

