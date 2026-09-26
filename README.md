# Bingo Mobile Game

Social Bingo for Android & iOS: players build their own 5×5 cards by tapping boxes (numbers 1–25 assigned automatically, in order, wherever you tap). The game starts the instant the 25th number is placed. Winning lines are classic Bingo: any row, column, or diagonal. Three rounds: One Line → Two Lines → Full House, each claimed automatically the moment a card satisfies it.

## Structure

- `mobile/` — Expo (React Native + TypeScript) app, using Expo Router for navigation.
- `server/` — Node.js + TypeScript real-time backend (Express + Socket.IO), authoritative game state, in-memory rooms. Needed only for **Host Game** / **Join Game** (real multiplayer between separate phones); everything else is fully local.

## Game modes

- **Host Game / Join Game** — real multiplayer over the internet, exactly two human players. One hosts (a room code is generated), the other enters that code from their own phone, anywhere. Requires the server below to be running and reachable. The "Create My Card" button stays disabled until someone else has actually joined the room. Tapping any unmarked number on your own card calls and marks it in one motion ("cuts" it), globally, on both cards.
- **Play vs Bot** — you vs exactly one bot, entirely on-device, no server needed. Different flow from Host/Join Game: numbers are called automatically, one by one, alternating turns between you and the bot (no tapping to call) — a short "Your Turn" / "Bot's Turn" indicator shows whose call is next. When either of you completes a round, a fresh card-creation phase starts for the *next* round (not the same card carried over) — the bot's new card fills instantly, you tap through yours again. Full house (round 3) is completed by both cards at the same instant every time (every card holds all 25 numbers), so it can end in a tie — both names show on the results screen when that happens.

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

## Building an installable app

### Android APK (local build, no account needed)

If you have the Android SDK + a JDK installed, you can build a real, installable, debug-signed APK entirely locally:

```bash
cd mobile
npx expo prebuild --platform android   # generates android/ (gitignored, regenerate anytime)
cd android
JAVA_HOME=/path/to/jdk-17 ./gradlew assembleDebug
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk` — install it with `adb install app-debug.apk`, or copy it to a phone and open it directly (Android will prompt to allow installs from that source). This uses Gradle's built-in debug keystore, so it installs and runs like a normal app, just not signed for the Play Store.

Use JDK 17 specifically — newer JDKs (21/23) can fail the Android Gradle Plugin build; `brew install openjdk@17` if you don't have it.

### iOS

Building for iOS needs the full Xcode.app (not just the Command Line Tools) — a multi-GB install from the App Store that requires an Apple ID sign-in, so it can't be done headlessly from a CI-style environment. From a Mac with Xcode installed:

```bash
cd mobile
npx expo run:ios              # simulator build, no Apple Developer account needed
```

For a build to install on a real iPhone or submit to TestFlight/the App Store, use EAS Build instead (works from any machine, including one without Xcode):

```bash
npx eas-cli@latest login                                # your free Expo account
npx eas-cli@latest build --platform ios --profile preview   # simulator build, no paid account needed
npx eas-cli@latest build --platform ios --profile production # real device / App Store, needs Apple Developer Program ($99/yr)
```

`eas.json` is already set up with `development`/`preview`/`production` profiles (the `preview` Android profile also builds an APK, as an alternative to the local Gradle build above).

### Publishing to the Play Store

Needs your Google Play Developer account (one-time $25 fee), app signing, and a store listing (screenshots, description, privacy policy). Once you're ready:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android
```

`eas build` will prompt you through generating a signing key the first time.

## Core game rules implemented

- Card creation: tap any empty cell to place the next sequential number (1→25); no typing, no "next number" indicator — just tap through. The game starts automatically the instant the 25th number is placed.
- Host/Join Game: no separate "call" step or Bingo button — tapping any not-yet-marked number on your own card calls and marks it in one action, globally, and it can't be tapped again.
- Play vs Bot: numbers call themselves, one at a time, turns alternating between you and the bot — nothing to tap during play itself, just watch your card fill in. A won round starts a brand-new card-creation phase for the next round rather than continuing on the same card.
- A round is claimed automatically the moment a card satisfies its pattern — no manual Bingo button anywhere.
- Winning lines: any full row, column, or diagonal counts. Round 1 = any one line, Round 2 = any two lines, Round 3 = full house (all 25).
- The BINGO letters at the top of the game screen cross out one at a time as your card completes lines (up to 5); a straight line is drawn across the grid for each completed line, and marked numbers show a strike-through.
- Tapping a number plays a short sound; completing a round plays a win sound.
- You only ever see your own card — opponents' and bots' cards stay hidden.
- A back button sits in the same top-left spot on every screen (except Home), and tapping outside a text field dismisses the keyboard on every screen that has one.

## Not yet implemented (see PRD §24, "Future Features")

- Persistent accounts, rankings, profiles, reconnection into an in-progress game after app restart.
- Social features (friends, chat), progression (XP/levels), additional game modes, cosmetics.
- A database layer — the server keeps all room/game state in-memory for simplicity; add persistence before scaling past a single server instance or supporting rankings/history.
