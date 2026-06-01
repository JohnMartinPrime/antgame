import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db';
import posthog from './analytics';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: (err as Error).message });
  }
});

// Example server-side PostHog event. The frontend calls this after game_start
// so the backend can record authoritative events users can't forge themselves.
app.post('/api/game/start', (req, res) => {
  const { distinctId } = req.body as { distinctId?: string };
  posthog.capture({
    distinctId: distinctId ?? 'anonymous',
    event: 'game_start_server',
    properties: { source: 'backend' },
  });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);
});
