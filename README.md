# Bingo Mobile Game

Social multiplayer Bingo for Android & iOS, built from the v1.1 PRD: players build their own 5×5 cards by tapping boxes (numbers 1–25 assigned automatically, in order, wherever you tap), call numbers themselves, and any player can mark a called number — marking is global and syncs to everyone's card. Three rounds: One Line → Two Lines → Full House.

## Structure

- `mobile/` — Expo (React Native + TypeScript) app, using Expo Router for navigation.
- `server/` — Node.js + TypeScript real-time backend (Express + Socket.IO), authoritative game state, in-memory rooms.

## Running locally

### 1. Start the server

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

Then press `i` for iOS simulator or `a` for Android emulator (or scan the QR code with Expo Go on a physical device).

**Important — server URL:** the app defaults to `http://localhost:4000` on iOS (works out of the box for the iOS simulator) and `http://10.0.2.2:4000` on Android (the special alias an Android emulator uses to reach your machine's localhost). Neither works from a real phone. For a physical device, find your computer's LAN IP (e.g. `192.168.1.20`) and run:

```bash
EXPO_PUBLIC_SERVER_URL=http://192.168.1.20:4000 npm start
```

Both devices must be on the same Wi-Fi network.

### 3. Offline / Pass & Play

No server needed — from the Home screen tap "Play Offline (Pass & Play)". Multiple players share one device; each creates a card in turn, then the device is passed around during gameplay with a player-switcher tab strip. Global marking rules are enforced locally, mirroring the online logic.

## Core game rules implemented

- Card creation: tap any empty cell to place the next sequential number (1→25); no typing. Card auto-locks and the player is marked ready once all 25 are placed.
- Game auto-starts (online) once every player in the room is ready; offline starts once every local player's card is complete.
- Calling: any not-yet-called number (1–25) can be called; duplicates are rejected server-side.
- Marking: a number can only be marked once it's been called, and only once; marking is global — it appears on every player's card, at each player's own cell position for that number.
- Round patterns: Round 1 = any one full row; Round 2 = any two full rows; Round 3 = full house (all 25). Bingo claims are validated against the current round's pattern before being accepted.
- Three rounds run in sequence within the same game/card; a `GAME_END` fires after Round 3's winner is confirmed.

## Socket.IO protocol (server ⇄ client)

`CREATE_ROOM`, `JOIN_ROOM`, `ROOM_UPDATE`, `PLACE_NUMBER`, `PLAYER_READY`, `GAME_START`, `CALL_NUMBER`, `NUMBER_CALLED`, `MARK_NUMBER`, `NUMBER_MARKED`, `BINGO_CLAIM`, `BINGO_VALID`, `BINGO_INVALID`, `ROUND_START`, `ROUND_END`, `GAME_END`, `PLAYER_DISCONNECTED`.

Mirrored constants live in `server/src/events.ts` and `mobile/src/game/events.ts`.

## Not yet implemented (see PRD §24, "Future Features")

- Persistent accounts, rankings, profiles, reconnection into an in-progress game after app restart.
- Social features (friends, chat), progression (XP/levels), additional game modes, cosmetics, Offline AI mode.
- A database layer (PRD §25 lists `User`, `Game`, `GamePlayer`, `BingoCard`, etc.) — the MVP keeps all room/game state in-memory on the server process for simplicity; add persistence before scaling past a single server instance or supporting rankings/history.
