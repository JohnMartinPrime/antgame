import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import type { GameConfig, GameResult } from '../types/game';

interface Props {
  config: GameConfig;
  onGameEnd: (result: GameResult) => void;
}

export default function GameCanvas({ config, onGameEnd }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#8B5E3C',
      parent: containerRef.current,
      scene: [MainScene],
      callbacks: {
        // postBoot runs before the first scene's create(), so the registry
        // values are available when MainScene reads them.
        postBoot: (g) => {
          g.registry.set('config', config);
          g.registry.set('onGameEnd', onGameEnd);
        },
      },
    });

    // destroy(true) removes the canvas from the DOM in addition to stopping the
    // game loop. Required to handle React StrictMode's double-mount in dev.
    return () => {
      game.destroy(true);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // config and onGameEnd are stable for the lifetime of this mount —
  // App only renders GameCanvas while screen === 'playing', with fixed props.

  return (
    <div
      ref={containerRef}
      style={{ width: '800px', height: '600px', margin: '0 auto' }}
    />
  );
}
