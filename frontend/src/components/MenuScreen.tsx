import React, { useState } from 'react';
import type { GameConfig } from '../types/game';
import { STANDARD_CONFIG } from '../types/game';

const ANT_OPTIONS = [5, 7, 10, 15];
const TIME_OPTIONS = [20, 30, 60];

interface Props {
  onStart: (config: GameConfig) => void;
}

export default function MenuScreen({ onStart }: Props): React.JSX.Element {
  const [antCount, setAntCount] = useState(STANDARD_CONFIG.antCount);
  const [durationSeconds, setDurationSeconds] = useState(STANDARD_CONFIG.durationSeconds);

  const isStandard =
    antCount === STANDARD_CONFIG.antCount && durationSeconds === STANDARD_CONFIG.durationSeconds;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'monospace',
      }}
    >
      <h1 style={{ fontSize: 64, color: '#ffdd44', margin: '0 0 8px 0', letterSpacing: 8 }}>
        ANTGAME
      </h1>
      <p style={{ color: '#777', margin: '0 0 56px 0', fontSize: 15 }}>
        catch them all before time runs out
      </p>

      <div style={{ marginBottom: 28 }}>
        <div style={labelStyle}>Number of ants</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ANT_OPTIONS.map(n => (
            <button key={n} onClick={() => setAntCount(n)} style={optionStyle(antCount === n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={labelStyle}>Game time</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {TIME_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => setDurationSeconds(t)}
              style={optionStyle(durationSeconds === t)}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28, height: 22 }}>
        {isStandard ? (
          <span
            style={{
              background: '#ffdd44',
              color: '#000',
              fontSize: 11,
              fontWeight: 'bold',
              padding: '3px 12px',
              borderRadius: 12,
              letterSpacing: 2,
            }}
          >
            RANKED
          </span>
        ) : (
          <span style={{ color: '#555', fontSize: 13 }}>
            casual — scores not saved to leaderboard
          </span>
        )}
      </div>

      <button
        onClick={() => onStart({ antCount, durationSeconds })}
        style={{
          background: '#ffdd44',
          color: '#000',
          border: 'none',
          padding: '14px 52px',
          fontSize: 18,
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: 4,
          letterSpacing: 3,
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}
      >
        Start
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  marginBottom: 10,
  fontSize: 12,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: 2,
};

function optionStyle(selected: boolean): React.CSSProperties {
  return {
    background: selected ? '#ffdd44' : 'transparent',
    color: selected ? '#000' : '#fff',
    border: '1px solid ' + (selected ? '#ffdd44' : '#444'),
    padding: '8px 20px',
    fontSize: 16,
    cursor: 'pointer',
    borderRadius: 4,
    fontFamily: 'monospace',
    minWidth: 56,
  };
}
