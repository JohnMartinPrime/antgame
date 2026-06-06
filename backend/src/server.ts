import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool, { runMigrations } from './db';
// import posthog from './analytics';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const ANT_POINTS = 200;
const TIME_BONUS_PER_SECOND = 50;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

runMigrations().catch((err: Error) => {
  console.error('[db] Migration failed:', err.message);
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: (err as Error).message });
  }
});

app.post('/api/game/start', (req, res) => {
  const { distinctId } = req.body as { distinctId?: string };
  // posthog.capture({
  //   distinctId: distinctId ?? 'anonymous',
  //   event: 'game_start_server',
  //   properties: { source: 'backend' },
  // });
  res.json({ ok: true });
});

app.post('/api/scores', async (req, res) => {
  const { playerName, score, antsCaught, antCount, durationSeconds, timeRemainingSeconds, won } =
    req.body as Record<string, unknown>;

  if (typeof playerName !== 'string' || playerName.trim().length === 0 || playerName.length > 32) {
    res.status(400).json({ error: 'playerName must be 1–32 characters' });
    return;
  }
  if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
    res.status(400).json({ error: 'Invalid score' });
    return;
  }
  if (typeof antCount !== 'number' || antCount < 1 || typeof durationSeconds !== 'number' || durationSeconds < 1) {
    res.status(400).json({ error: 'Invalid antCount or durationSeconds' });
    return;
  }

  const maxPossible = antCount * ANT_POINTS + durationSeconds * TIME_BONUS_PER_SECOND;
  if (score > maxPossible) {
    res.status(400).json({ error: 'Score exceeds maximum possible' });
    return;
  }

  try {
    const insert = await pool.query<{ id: number }>(
      `INSERT INTO scores (player_name, score, ants_caught, ant_count, duration_s, time_remaining_s, won)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [playerName.trim(), score, antsCaught, antCount, durationSeconds, timeRemainingSeconds, won],
    );

    const rankRow = await pool.query<{ rank: string }>(
      `SELECT COUNT(*) + 1 AS rank FROM scores
       WHERE ant_count = $1 AND duration_s = $2 AND score > $3`,
      [antCount, durationSeconds, score],
    );

    res.json({ id: insert.rows[0].id, rank: parseInt(rankRow.rows[0].rank, 10) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/scores/leaderboard', async (req, res) => {
  const antCount = parseInt(req.query['antCount'] as string, 10) || 10;
  const durationSeconds = parseInt(req.query['durationSeconds'] as string, 10) || 30;

  try {
    const result = await pool.query<{
      rank: string;
      player_name: string;
      score: number;
      ants_caught: number;
      time_remaining_s: number;
      created_at: string;
    }>(
      `SELECT player_name, score, ants_caught, time_remaining_s, created_at,
              RANK() OVER (ORDER BY score DESC) AS rank
       FROM scores
       WHERE ant_count = $1 AND duration_s = $2
       ORDER BY score DESC
       LIMIT 100`,
      [antCount, durationSeconds],
    );

    res.json({
      entries: result.rows.map(r => ({
        rank: parseInt(r.rank, 10),
        playerName: r.player_name,
        score: r.score,
        antsCaught: r.ants_caught,
        timeRemainingSeconds: r.time_remaining_s,
        createdAt: r.created_at,
      })),
      total: result.rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);
});
