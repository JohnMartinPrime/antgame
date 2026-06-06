export const migration001 = `
  CREATE TABLE IF NOT EXISTS scores (
    id               SERIAL      PRIMARY KEY,
    player_name      VARCHAR(32) NOT NULL,
    score            INTEGER     NOT NULL,
    ants_caught      INTEGER     NOT NULL,
    ant_count        INTEGER     NOT NULL,
    duration_s       INTEGER     NOT NULL,
    time_remaining_s INTEGER     NOT NULL,
    won              BOOLEAN     NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS scores_score_idx ON scores (score DESC);
`;
