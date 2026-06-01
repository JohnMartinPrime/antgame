import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

export default function GameCanvas(): React.JSX.Element {
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
    });

    // destroy(true) removes the canvas from the DOM in addition to stopping the
    // game loop. Required to handle React StrictMode's double-mount in dev —
    // without this, two Phaser instances compete for the same container node.
    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '800px', height: '600px', margin: '0 auto' }}
    />
  );
}
