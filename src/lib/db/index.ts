/**
 * Database Connection
 * 
 * Uses Vercel Postgres with Drizzle ORM.
 * Falls back to standard PostgreSQL connection for local development.
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Create the database instance with schema
export const db = drizzle(sql, { schema });

// Re-export schema for convenience
export * from './schema';

