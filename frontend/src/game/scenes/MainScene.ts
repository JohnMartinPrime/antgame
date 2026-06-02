import Phaser from 'phaser';
import posthog from 'posthog-js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    // Load assets here in later milestones.
  }

  create(): void {
    this.add
      .text(400, 300, 'Antgame loading...', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // End-to-end pipeline verification event (see CLAUDE.md).
    // Fires in create() — not preload() — because the scene is fully ready here.
    posthog.capture('game_start', {
      scene: 'MainScene',
      timestamp: Date.now(),
    });

    console.log('[MainScene] game_start event fired to PostHog');
  }

  update(_time: number, _delta: number): void {
    // Game loop — empty for scaffold.
  }
}
