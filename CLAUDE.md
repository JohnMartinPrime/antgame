# CLAUDE.md

Standing context for this project. This file is read at the start of every session.
It holds durable decisions and rules — not a task list. For "what to do today," see
the separate kickoff prompt.

## What this is

A 2D top-down browser game for my portfolio. A magnifying glass floats over a patch of
dirt and focuses a beam of sunlight to chase ants scurrying below. Asymmetric gameplay:
the glass hunts, the ants evade. Powerups exist for both sides.

## North star (read this before suggesting scope)

**The primary goal of this project is for me to learn PostHog deeply, for interview
preparation.** The game is the vehicle; PostHog is the point. When a tradeoff comes up,
favor the option that gets me richer, cleaner analytics learning over the one that adds
game complexity. If a proposed feature does not advance PostHog learning, flag it as
optional rather than building it by default.

## Load-bearing decisions (do not silently reverse these)

- **Single-player FIRST.** The player controls the glass; ants are AI/bots. Real-time
  multiplayer is a deliberate v2. **Do not scaffold Socket.io or any networking layer
  yet.** Single-player gives me everything I need for PostHog (custom events, funnels,
  retention, cohorts, feature flags).
- **Web only.** No React Native, no mobile app. One well-executed web game.
- **Backend is REST-only for now** (auth, match results, leaderboard). No WebSockets
  until the multiplayer v2 phase.

## Stack

- **Frontend:** Vite + React + Phaser.
  - Phaser owns the game canvas, mounted in a React `ref`/container.
  - React handles ONLY surrounding HUD, menus, and overlays. Do not render game
    entities through React.
- **Backend:** Express. Default runtime is Node.
  - (Bun is under consideration but NOT committed. If adopted: keep the standard `pg`
    driver rather than Bun's built-in SQL client, to stay portable back to Node, and
    verify `posthog-node` runs cleanly on Bun before relying on it.)
- **Database:** PostgreSQL, accessed via the `pg` driver.
- **Analytics:** PostHog — `posthog-js` (frontend) and `posthog-node` (backend).
- **Local dev:** Docker Compose with three services (frontend, backend, postgres).
- **Deploy:** Railway. Each service is defined separately on Railway (Dockerfiles /
  Railway builder). `docker-compose.yml` is a LOCAL-DEV artifact only — Railway does
  not deploy from it.

## PostHog notes that affect implementation

- **Lean on custom events, not session replay, for gameplay insight.** Phaser renders
  to a canvas; PostHog's canvas replay is capped around 4 fps and is off by default.
  A 4 fps replay of a fast chase is choppy and low-value. The real signal comes from
  well-designed custom events: game_start, ant_caught, ant_escaped, powerup_used,
  level_reached, run_ended, etc.
- **First milestone is end-to-end pipeline verification:** fire one PostHog custom
  event on game start and confirm it lands, before building real game logic. Don't
  let analytics integration slip to the end.
- Validate score/outcome events server-side where it matters — frontend events can be
  faked by users.

## Versioning and documentation rules

- **`package.json` is the single source of truth for library versions.** Read versions
  from it. Do NOT guess versions or rely on training-data memory for API shapes.
- For fast-moving libraries (Phaser, Vite, posthog-js), **prefer current official
  documentation over your training data.** If a Context7 MCP or web fetch is available,
  use it to confirm version-specific APIs rather than recalling them.
- If you're unsure whether an API is current for the installed version, say so and
  check, rather than emitting a plausible-looking method that may be deprecated.
- After install, fill in the block below from the actual installed versions.

### Current pinned versions (fill from package.json after install)

```
phaser:       3.90.0
vite:         8.0.14
react:        18.3.1
express:      4.22.2
pg:           8.21.0
posthog-js:   1.376.6
posthog-node: 4.18.0
```

## My working style

I'm technically comfortable but not a network guru. I value understanding the reasoning
behind decisions — explain the "why," not just the "what." I prefer methodical,
step-by-step work and I'd rather understand a choice than accept a black box.
