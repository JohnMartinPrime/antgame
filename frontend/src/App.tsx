import React from 'react';
import GameCanvas from './game/GameCanvas';

export default function App(): React.JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {/*
        GameCanvas owns the Phaser canvas. HUD/menu overlays go here as siblings,
        layered on top with CSS position:absolute.
      */}
      <GameCanvas />
    </div>
  );
}
