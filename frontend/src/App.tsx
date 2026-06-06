import React, { useState } from 'react';
import GameCanvas from './game/GameCanvas';
import MenuScreen from './components/MenuScreen';
import GameOverScreen from './components/GameOverScreen';
import type { GameConfig, GameResult } from './types/game';
import { STANDARD_CONFIG } from './types/game';

type Screen = 'menu' | 'playing' | 'gameover';

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('menu');
  const [config, setConfig] = useState<GameConfig>(STANDARD_CONFIG);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  function handleStart(newConfig: GameConfig): void {
    setConfig(newConfig);
    setScreen('playing');
  }

  function handleGameEnd(result: GameResult): void {
    setLastResult(result);
    setScreen('gameover');
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {screen === 'menu' && <MenuScreen onStart={handleStart} />}
      {screen === 'playing' && (
        <GameCanvas config={config} onGameEnd={handleGameEnd} />
      )}
      {screen === 'gameover' && lastResult && (
        <GameOverScreen
          result={lastResult}
          onPlayAgain={() => setScreen('playing')}
          onMenu={() => setScreen('menu')}
        />
      )}
    </div>
  );
}
