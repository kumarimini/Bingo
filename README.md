# Bingo Mobile Game

Social Bingo for Android & iOS, built from the v1.1 PRD: players build their own 5×5 cards by tapping boxes (numbers 1–25 assigned automatically, in order, wherever you tap), call numbers themselves, and any player can mark a called number — marking is global and syncs to everyone's card. Winning lines are classic Bingo: any row, column, or diagonal. Three rounds: One Line → Two Lines → Full House.

## Structure

- `mobile/` — Expo (React Native + TypeScript) app, using Expo Router for navigation.
- `server/` — Node.js + TypeScript real-time backend (Express + Socket.IO), authoritative game state, in-memory rooms. Needed only for **Host Game** / **Join Game** (real multiplayer between separate phones); everything else is fully local.

## Game modes

- **Host Game / Join Game** — real multiplayer over the internet. One player hosts (a room code is generated), the other enters that code from their own phone, anywhere. Requires the server below to be running and reachable.
- **Play vs Bot** — single player vs 1–3 AI opponents, entirely on-device, no server needed. Bots get a card instantly and play automatically (self-mark, occasionally call, auto-claim Bingo).
- **Pass & Play (Same Device)** — local multiplayer, one device physically handed around. A room code is shown for flavor only — no networking involved.

## Running locally

### 1. Start the server (only needed for Host/Join Game)

```bash
cd server
npm install   # first time only
npm run dev
```

Server listens on `http://localhost:4000` (health check at `/health`).

### 2. Start the mobile app

```bash
cd mobile
npm install   # first time only
npm start
```

Press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go on a physical device.

**Server URL during development:** the app defaults to `http://localhost:4000` on iOS and `http://10.0.2.2:4000` on Android (the emulator's alias for your machine's localhost). For a physical device on the same Wi-Fi as your dev machine, override it:

```bash
EXPO_PUBLIC_SERVER_URL=http://192.168.1.20:4000 npm start
```

## Deploying the server (required for real multiplayer / Play Store release)

For two friends on different networks to play Host/Join Game together, the server needs to run somewhere public and always-on — not on your laptop. The free tier of [Render](https://render.com) works well for this and needs no credit card to start:

1. Push this repo to GitHub (if it isn't already).
2. In the Render dashboard: **New → Blueprint**, connect the repo. Render will read `server/render.yaml` and configure the service automatically (build: `npm install && npm run build`, start: `npm start`, free plan).
3. Deploy. Render gives you a public URL like `https://bingo-server-xxxx.onrender.com`.
4. Verify it's up: `curl https://bingo-server-xxxx.onrender.com/health` should return `{"ok":true}`.
5. Point the app at it — open `mobile/src/game/config.ts` and replace `PRODUCTION_SERVER_URL` with that URL. This is what any build you distribute (including a Play Store build) will use by default.

Note: Render's free plan spins the service down after inactivity, so the first connection after a quiet period can take several seconds while it wakes up — expect a brief delay on "Host Game" occasionally, not a bug.

If you'd rather not touch `config.ts`, the more "proper" Expo way is to set `EXPO_PUBLIC_SERVER_URL` as a build-time environment variable in your EAS build profile (`eas.json`) instead — either works.

## Publishing to the Play Store

Not something this repo can do on its own — it needs your Google Play Developer account (one-time $25 fee), app signing, and a store listing (screenshots, description, privacy policy). Once you're ready:

```bash
npx eas-cli@latest build --platform android
npx eas-cli@latest submit --platform android
```

`eas build` needs an Expo account (free) and will prompt you through generating a signing key the first time. This repo doesn't yet have `eas.json` set up — ask if you want that scaffolded.

## Core game rules implemented

- Card creation: tap any empty cell to place the next sequential number (1→25); no typing.
- Calling: any not-yet-called number (1–25) can be called; duplicates are rejected.
- Marking: a number can only be marked once it's been called, and only once; marking is global — it appears on every player's card, at each player's own cell position for that number.
- Winning lines: any full row, column, or diagonal counts. Round 1 = any one line, Round 2 = any two lines, Round 3 = full house (all 25).
- The BINGO letters at the top of the game screen cross out one at a time as your card completes lines (up to 5); a straight line is drawn across the grid for each completed line, and marked numbers show a strike-through.
- Tap-to-mark plays a short sound; completing a round plays a win sound.
- In Host/Join Game and Play vs Bot, you only ever see your own card — opponents' and bots' cards stay hidden. In Pass & Play, a tab strip lets whoever's turn it is switch to their own card (the device is shared, so this is by design).

## Not yet implemented (see PRD §24, "Future Features")

- Persistent accounts, rankings, profiles, reconnection into an in-progress game after app restart.
- Social features (friends, chat), progression (XP/levels), additional game modes, cosmetics.
- A database layer — the server keeps all room/game state in-memory for simplicity; add persistence before scaling past a single server instance or supporting rankings/history.
