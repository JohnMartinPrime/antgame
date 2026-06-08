import Phaser from 'phaser';
import posthog from 'posthog-js';
import { ANT_POINTS, TIME_BONUS_PER_SECOND } from '../../types/game';
import type { GameConfig, GameResult } from '../../types/game';

const WIDTH = 800;
const HEIGHT = 600;
const FOCUS_RADIUS = 20;
const CATCH_HOLD_MS = 900;

interface Ant {
  gfx: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  turnTimer: number;
  catchProgress: number; // 0–1
  caught: boolean;
}

export default class MainScene extends Phaser.Scene {
  private glass!: Phaser.GameObjects.Graphics;
  private catchRings!: Phaser.GameObjects.Graphics;
  private ants: Ant[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private antText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private score = 0;
  private antsCaught = 0;
  private timeLeft = 0;
  private done = false;
  private startedAt = 0;

  constructor(
    private readonly gameConfig: GameConfig,
    private readonly onGameEnd: (result: GameResult) => void,
  ) {
    super({ key: 'MainScene' });
  }

  preload(): void {}

  create(): void {
    // scene.restart() reuses the class instance — reset all mutable state explicitly
    this.ants = [];
    this.score = 0;
    this.antsCaught = 0;
    this.timeLeft = this.gameConfig.durationSeconds;
    this.done = false;
    this.startedAt = Date.now();

    posthog.capture('game_start', {
      ant_count: this.gameConfig.antCount,
      duration_s: this.gameConfig.durationSeconds,
    });

    this.drawDirt();
    for (let i = 0; i < this.gameConfig.antCount; i++) this.spawnAnt();

    // catchRings sits above ants (depth 8), glass on top (depth 10)
    this.catchRings = this.add.graphics().setDepth(8);
    this.glass = this.add.graphics().setDepth(10);

    this.scoreText = this.add
      .text(16, 16, 'Score: 0', { fontSize: '20px', color: '#fff' })
      .setDepth(11);

    this.antText = this.add
      .text(16, 42, `0 / ${this.gameConfig.antCount} ants`, { fontSize: '14px', color: '#aaa' })
      .setDepth(11);

    this.timerText = this.add
      .text(WIDTH - 16, 16, String(this.gameConfig.durationSeconds), {
        fontSize: '20px',
        color: '#fff',
      })
      .setOrigin(1, 0)
      .setDepth(11);

    this.time.addEvent({
      delay: 1000,
      repeat: this.gameConfig.durationSeconds - 1,
      callback: () => {
        if (this.done) return;
        this.timeLeft--;
        this.timerText.setText(String(this.timeLeft));
        if (this.timeLeft <= 10) this.timerText.setColor('#ff4444');
        if (this.timeLeft <= 0) this.endGame(false);
      },
    });

    this.input.setDefaultCursor('none');
  }

  private drawDirt(): void {
    const g = this.add.graphics();
    g.fillStyle(0x5c3a1e, 0.45);
    for (let i = 0; i < 300; i++) {
      g.fillCircle(Math.random() * WIDTH, Math.random() * HEIGHT, Math.random() * 3 + 1);
    }
  }

  private spawnAnt(): void {
    const pad = 60;
    const x = pad + Math.random() * (WIDTH - pad * 2);
    const y = pad + Math.random() * (HEIGHT - pad * 2);
    const speed = 55 + Math.random() * 35;
    const angle = Math.random() * Math.PI * 2;
    const gfx = this.add.graphics().setDepth(5);
    this.renderAnt(gfx);
    this.ants.push({
      gfx,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      turnTimer: Math.random() * 2,
      catchProgress: 0,
      caught: false,
    });
  }

  private renderAnt(g: Phaser.GameObjects.Graphics): void {
    g.clear();
    g.fillStyle(0x0d0d0d);
    g.fillEllipse(0, -5, 5, 7);  // head
    g.fillEllipse(0, 2, 4, 6);   // thorax
    g.fillEllipse(0, 9, 7, 9);   // abdomen
    g.lineStyle(1, 0x0d0d0d, 1);
    for (const i of [-1, 0, 1]) {
      g.strokeLineShape(new Phaser.Geom.Line(-2, i * 3, -9, i * 3 + 4));
      g.strokeLineShape(new Phaser.Geom.Line(2, i * 3, 9, i * 3 + 4));
    }
  }

  update(_time: number, delta: number): void {
    if (this.done) return;
    const { x: mx, y: my } = this.input.activePointer;
    this.moveAnts(delta / 1000);
    this.checkCatch(mx, my, delta);
    this.drawGlass(mx, my);
  }

  private moveAnts(dt: number): void {
    for (const ant of this.ants) {
      if (ant.caught) continue;

      ant.turnTimer -= dt;
      if (ant.turnTimer <= 0) {
        const a = Math.random() * Math.PI * 2;
        ant.vx = Math.cos(a) * ant.speed;
        ant.vy = Math.sin(a) * ant.speed;
        ant.turnTimer = 0.8 + Math.random() * 1.5;
      }

      ant.x += ant.vx * dt;
      ant.y += ant.vy * dt;

      const m = 20;
      if (ant.x < m)          { ant.x = m;          ant.vx =  Math.abs(ant.vx); }
      if (ant.x > WIDTH - m)  { ant.x = WIDTH - m;  ant.vx = -Math.abs(ant.vx); }
      if (ant.y < m)          { ant.y = m;           ant.vy =  Math.abs(ant.vy); }
      if (ant.y > HEIGHT - m) { ant.y = HEIGHT - m;  ant.vy = -Math.abs(ant.vy); }

      ant.gfx.setPosition(ant.x, ant.y);
      ant.gfx.setRotation(Math.atan2(ant.vy, ant.vx) + Math.PI / 2);
    }
  }

  private checkCatch(mx: number, my: number, delta: number): void {
    this.catchRings.clear();

    for (const ant of this.ants) {
      if (ant.caught) continue;

      const inRange = Math.hypot(ant.x - mx, ant.y - my) < FOCUS_RADIUS;

      if (inRange) {
        ant.catchProgress = Math.min(1, ant.catchProgress + delta / CATCH_HOLD_MS);
        this.drawProgressRing(ant);
        if (ant.catchProgress >= 1) this.catchAnt(ant);
      } else {
        ant.catchProgress = Math.max(0, ant.catchProgress - delta / (CATCH_HOLD_MS * 0.35));
      }
    }
  }

  private drawProgressRing(ant: Ant): void {
    const steps = Math.ceil(ant.catchProgress * 40);
    if (steps === 0) return;

    this.catchRings.lineStyle(3, 0xff4400, 1);
    this.catchRings.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + ant.catchProgress * Math.PI * 2;
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (endAngle - startAngle) * (s / steps);
      const px = ant.x + Math.cos(a) * 14;
      const py = ant.y + Math.sin(a) * 14;
      if (s === 0) this.catchRings.moveTo(px, py);
      else this.catchRings.lineTo(px, py);
    }
    this.catchRings.strokePath();
  }

  private drawGlass(x: number, y: number): void {
    this.glass.clear();

    this.glass.fillStyle(0xffff99, 0.07);
    this.glass.fillCircle(x, y, 50);

    this.glass.lineStyle(4, 0xccccee, 0.9);
    this.glass.strokeCircle(x, y, 50);

    this.glass.lineStyle(7, 0x997744, 1);
    this.glass.strokeLineShape(new Phaser.Geom.Line(x + 36, y + 36, x + 64, y + 64));

    this.glass.fillStyle(0xffffff, 0.55);
    this.glass.fillCircle(x, y, FOCUS_RADIUS);
    this.glass.fillStyle(0xffdd22, 0.9);
    this.glass.fillCircle(x, y, FOCUS_RADIUS - 6);
  }

  private catchAnt(ant: Ant): void {
    ant.caught = true;
    ant.gfx.destroy();
    this.antsCaught++;
    this.score += ANT_POINTS;
    this.scoreText.setText(`Score: ${this.score}`);
    this.antText.setText(`${this.antsCaught} / ${this.gameConfig.antCount} ants`);

    posthog.capture('ant_caught', {
      score: this.score,
      ants_caught: this.antsCaught,
      time_remaining: this.timeLeft,
      ants_remaining: this.gameConfig.antCount - this.antsCaught,
    });

    if (this.antsCaught >= this.gameConfig.antCount) this.endGame(true);
  }

  private endGame(won: boolean): void {
    if (this.done) return;
    this.done = true;

    const timeRemainingSeconds = won ? this.timeLeft : 0;
    const finalScore = this.score + timeRemainingSeconds * TIME_BONUS_PER_SECOND;

    posthog.capture('run_ended', {
      outcome: won ? 'win' : 'loss',
      ants_caught: this.antsCaught,
      ants_escaped: this.gameConfig.antCount - this.antsCaught,
      time_remaining: timeRemainingSeconds,
      score: finalScore,
      duration_ms: Date.now() - this.startedAt,
    });

    if (this.gameConfig.antCount - this.antsCaught > 0) {
      posthog.capture('ant_escaped', { count: this.gameConfig.antCount - this.antsCaught });
    }

    this.input.setDefaultCursor('default');

    this.onGameEnd({
      score: finalScore,
      antsCaught: this.antsCaught,
      antCount: this.gameConfig.antCount,
      durationSeconds: this.gameConfig.durationSeconds,
      timeRemainingSeconds,
      won,
    });
  }
}
