import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT 1').then(() => {
  console.log('[db] PostgreSQL connected');
}).catch((err: Error) => {
  console.error('[db] PostgreSQL connection failed:', err.message);
});

export default pool;
