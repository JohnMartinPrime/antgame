export interface GameConfig {
  antCount: number;
  durationSeconds: number;
}

export interface GameResult {
  score: number;
  antsCaught: number;
  antCount: number;
  durationSeconds: number;
  timeRemainingSeconds: number;
  won: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  antsCaught: number;
  timeRemainingSeconds: number;
  createdAt: string;
}

export const STANDARD_CONFIG: GameConfig = { antCount: 10, durationSeconds: 30 };
export const ANT_POINTS = 200;
export const TIME_BONUS_PER_SECOND = 50;
