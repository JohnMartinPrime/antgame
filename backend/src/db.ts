import { Pool } from 'pg';
import 'dotenv/config';
import { migration001 } from './migrations/001_create_scores';

console.log('DATABASE_URL is:', process.env.DATABASE_URL ?? 'NOT SET');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT 1').then(() => {
  console.log('[db] PostgreSQL connected');
}).catch((err: Error) => {
  console.error('[db] PostgreSQL connection failed:', err.message);
});

export async function runMigrations(): Promise<void> {
  await pool.query(migration001);
  console.log('[db] Migrations applied');
}

export default pool;
