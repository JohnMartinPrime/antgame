import React, { useState, useEffect } from 'react';
import type { GameResult, LeaderboardEntry } from '../types/game';
import { STANDARD_CONFIG, ANT_POINTS, TIME_BONUS_PER_SECOND } from '../types/game';

interface Props {
  result: GameResult;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ result, onPlayAgain, onMenu }: Props): React.JSX.Element {
  const isStandard =
    result.antCount === STANDARD_CONFIG.antCount &&
    result.durationSeconds === STANDARD_CONFIG.durationSeconds;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(isStandard);
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);

  useEffect(() => {
    if (!isStandard) return;
    fetch(
      `/api/scores/leaderboard?antCount=${STANDARD_CONFIG.antCount}&durationSeconds=${STANDARD_CONFIG.durationSeconds}`,
    )
      .then(r => r.json())
      .then((data: { entries: LeaderboardEntry[] }) => {
        setLeaderboard(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isStandard]);

  const qualifies =
    isStandard &&
    !loading &&
    result.score > 0 &&
    (leaderboard.length < 100 ||
      result.score > (leaderboard[leaderboard.length - 1]?.score ?? -1));

  const tentativeRank = leaderboard.filter(e => e.score > result.score).length + 1;

  async function handleSubmit(): Promise<void> {
    if (!playerName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          score: result.score,
          antsCaught: result.antsCaught,
          antCount: result.antCount,
          durationSeconds: result.durationSeconds,
          timeRemainingSeconds: result.timeRemainingSeconds,
          won: result.won,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: number; rank: number };
        setSubmittedRank(data.rank);
        setSubmitted(true);
        const lb = await fetch(
          `/api/scores/leaderboard?antCount=${STANDARD_CONFIG.antCount}&durationSeconds=${STANDARD_CONFIG.durationSeconds}`,
        );
        const lbData = (await lb.json()) as { entries: LeaderboardEntry[] };
        setLeaderboard(lbData.entries ?? []);
      }
    } catch (_err) {
      // Network/server error — fail silently, player can still play again
    } finally {
      setSubmitting(false);
    }
  }

  const antPoints = result.antsCaught * ANT_POINTS;
  const timeBonus = result.timeRemainingSeconds * TIME_BONUS_PER_SECOND;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        color: '#fff',
        fontFamily: 'monospace',
        overflowY: 'auto',
        paddingTop: 48,
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          fontSize: 40,
          margin: '0 0 6px 0',
          color: result.won ? '#ffdd44' : '#ff5555',
        }}
      >
        {result.won ? 'All caught!' : "Time's up!"}
      </h1>

      {/* Score breakdown */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#666', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
          Score breakdown
        </div>
        <div style={{ fontSize: 16, color: '#aaa', marginBottom: 5 }}>
          {result.antsCaught} ant{result.antsCaught !== 1 ? 's' : ''} × {ANT_POINTS} pts ={' '}
          <span style={{ color: '#fff' }}>{antPoints}</span>
        </div>
        {result.won && (
          <div style={{ fontSize: 16, color: '#aaa', marginBottom: 5 }}>
            {result.timeRemainingSeconds}s remaining × {TIME_BONUS_PER_SECOND} pts ={' '}
            <span style={{ color: '#fff' }}>{timeBonus}</span>
          </div>
        )}
        <div style={{ fontSize: 30, color: '#ffdd44', marginTop: 14, fontWeight: 'bold' }}>
          {result.score.toLocaleString()} pts
        </div>
      </div>

      {/* Leaderboard section — standard config only */}
      {isStandard && (
        <div style={{ width: 380, marginBottom: 32 }}>
          {loading ? (
            <div style={{ color: '#555', textAlign: 'center', padding: 24 }}>
              Loading leaderboard…
            </div>
          ) : (
            <>
              {/* Rank + submit form */}
              {!submitted && qualifies && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: '14px 16px',
                    border: '1px solid #333',
                    borderRadius: 4,
                  }}
                >
                  <div style={{ marginBottom: 10, color: '#ffdd44', fontSize: 14 }}>
                    You're ranked #{tentativeRank} — enter your name:
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value.slice(0, 32))}
                      onKeyDown={e => { if (e.key === 'Enter') void handleSubmit(); }}
                      placeholder="Your name"
                      maxLength={32}
                      autoFocus
                      style={{
                        flex: 1,
                        background: '#111',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '8px 12px',
                        fontFamily: 'monospace',
                        fontSize: 15,
                        borderRadius: 3,
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => void handleSubmit()}
                      disabled={submitting || !playerName.trim()}
                      style={{
                        background: '#ffdd44',
                        color: '#000',
                        border: 'none',
                        padding: '8px 18px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: 14,
                        fontWeight: 'bold',
                        borderRadius: 3,
                        opacity: !playerName.trim() || submitting ? 0.5 : 1,
                      }}
                    >
                      {submitting ? '…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {submitted && submittedRank !== null && (
                <div
                  style={{
                    marginBottom: 16,
                    color: '#ffdd44',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                >
                  Saved! You're #{submittedRank} on the leaderboard.
                </div>
              )}

              {/* Top 10 */}
              {leaderboard.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#555',
                      letterSpacing: 2,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Top {Math.min(leaderboard.length, 10)}
                  </div>
                  {leaderboard.slice(0, 10).map((entry, i) => {
                    const isMe =
                      submitted &&
                      playerName.trim() === entry.playerName &&
                      entry.score === result.score;
                    return (
                      <div
                        key={`${entry.rank}-${entry.playerName}`}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: '7px 0',
                          borderBottom: '1px solid #1e1e1e',
                          color: isMe ? '#ffdd44' : '#fff',
                          fontSize: 15,
                        }}
                      >
                        <span style={{ width: 28, color: '#555', fontSize: 13 }}>
                          #{i + 1}
                        </span>
                        <span style={{ flex: 1 }}>{entry.playerName}</span>
                        <span>{entry.score.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {leaderboard.length === 0 && !qualifies && (
                <div style={{ color: '#444', textAlign: 'center', fontSize: 14 }}>
                  No entries yet
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onPlayAgain}
          style={{
            background: '#ffdd44',
            color: '#000',
            border: 'none',
            padding: '12px 36px',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: 4,
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Play Again
        </button>
        <button
          onClick={onMenu}
          style={{
            background: 'transparent',
            color: '#aaa',
            border: '1px solid #333',
            padding: '12px 36px',
            fontSize: 16,
            cursor: 'pointer',
            borderRadius: 4,
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
