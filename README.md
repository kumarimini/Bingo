# Bingo Mobile Game

Classic 75-ball Bingo for Android & iOS. Cards fill instantly (tap "Fill Board" — no manual placement), columns follow the standard B(1–15) / I(16–30) / N(31–45, FREE center) / G(46–60) / O(61–75) ranges, and a running Score rewards every mark, every completed line, and a full house.

## Structure

- `mobile/` — Expo (React Native + TypeScript) app, using Expo Router for navigation.
- `server/` — Node.js + TypeScript real-time backend (Express + Socket.IO), authoritative game state, in-memory rooms. Needed only for **Online** (real multiplayer between separate phones); everything under **Offline** is fully local, no server required.

## App flow

- **Splash** → **Home** (Offline / Online, plus a Sound On/Off toggle — no purchases, no locked features anywhere in the app).
- **Offline**
  - **Play With Computer** — you vs one bot. Numbers call themselves, one at a time, turns alternating between you (tap "Call Number") and the bot (calls automatically after a short pause). Score updates live; "Fill Board" starts a fresh game (logging your score to the Leaderboard first if it's above zero).
  - **Just Show Me the Board** — a personal card with no calling mechanic. Tap any of your own numbers to mark it yourself (e.g. while someone else calls numbers out loud in person). "Fill Board" gives you a fresh card.
- **Online** — enter/edit your name, type a room code + tap OK to join, or **Host a Game** (pick Max Players 2–6 and Number of Rounds 3–15, both freely adjustable). The host's lobby shows who's joined and starts the game once at least 2 players are in. Tapping any unmarked number on your own card calls and marks it in one motion, globally, for everyone in the room. Each round hands out a fresh card to every player; the game ends after the configured number of rounds, and final standings (cumulative score, rounds won) are shown and saved to the Leaderboard.
- **Leaderboard** — every game you've finished (Offline or Online) with a score above zero is saved locally on your device (name, score, mode), sorted highest-first.

## Running locally

### 1. Start the server (only needed for Online)

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

For friends on different networks to play Online together, the server needs to run somewhere public and always-on — not on your laptop. The free tier of [Render](https://render.com) works well for this and needs no credit card to start:

1. Push this repo to GitHub (if it isn't already).
2. In the Render dashboard: **New → Blueprint**, connect the repo. Render will read `server/render.yaml` and configure the service automatically (build: `npm install && npm run build`, start: `npm start`, free plan).
3. Deploy. Render gives you a public URL like `https://bingo-server-xxxx.onrender.com`.
4. Verify it's up: `curl https://bingo-server-xxxx.onrender.com/health` should return `{"ok":true}`.
5. Point the app at it — open `mobile/src/game/config.ts` and replace `PRODUCTION_SERVER_URL` with that URL. This is what any build you distribute (including a Play Store build) will use by default.

Note: Render's free plan spins the service down after inactivity, so the first connection after a quiet period can take several seconds while it wakes up — expect a brief delay on "Host a Game" occasionally, not a bug.

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

**Re-run `expo prebuild` + `gradlew assembleDebug` any time a native dependency changes** (e.g. a new `npx expo install` of a package with native code, like `@react-native-async-storage/async-storage`) — Metro's live JS reload during `npm start` does *not* pick up new native modules; you'll see "NativeModule is null" errors until you rebuild.

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

- **Cards**: classic 75-ball — column B holds 1–15, I holds 16–30, N holds 31–45 (center cell is always FREE), G holds 46–60, O holds 61–75. "Fill Board" generates a complete, valid card instantly; there's no manual number placement.
- **Calling & marking**: in Play With Computer and Online, calling a number marks it globally on every card that has it (not every card has every number here, unlike a simpler custom format — a call can miss your card entirely, same as real Bingo). In Just Show Me the Board, there's no calling at all — you mark your own numbers by tapping them.
- **Winning lines**: any full row, column, or diagonal. A round is won by classic single-line Bingo (any one completed line); reaching a full house (all 25 cells) is also tracked and scored separately.
- **Score**: +10 per number marked on your card, +100 per completed line, +300 for a full house. Fully transparent, always visible during play.
- **Play With Computer**: turns alternate — you tap "Call Number" on your turn, the bot calls automatically on its own after a short pause. Play continues past the first line (toward full house) until you tap "Fill Board" for a new game.
- **Online**: host picks Max Players (2–6) and Number of Rounds (3–15); the host starts the game once ≥2 players have joined. Each round gives everyone a fresh card; first to complete a line wins that round and everyone gets a new card for the next one. Final standings show cumulative score and rounds won per player.
- **Leaderboard**: every finished game (Offline or Online) with a score > 0 is saved locally (`AsyncStorage`) and shown sorted highest-first.
- No purchases, no locked features, anywhere.
- A back button sits in the same top-left spot on every screen (except Home), and tapping outside a text field dismisses the keyboard on every screen that has one.

## Not yet implemented (see PRD §24, "Future Features")

- Server-side/cross-device leaderboard (currently per-device local storage only), persistent accounts, reconnection into an in-progress game after app restart.
- Social features (friends, chat), progression (XP/levels), additional cosmetics.
- A database layer on the server — room/game state is kept in-memory for simplicity; add persistence before scaling past a single server instance.
