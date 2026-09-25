# Bingo Mobile Game

Social Bingo for Android & iOS, built from the v1.1 PRD: players build their own 5×5 cards by tapping boxes (numbers 1–25 assigned automatically, in order, wherever you tap), call numbers themselves, and any player can mark a called number — marking is global and syncs to everyone's card. Three rounds: One Line → Two Lines → Full House.

This app is entirely **offline / local** — there is no backend and no network requirement of any kind. Everything runs on-device.

## Structure

- `mobile/` — Expo (React Native + TypeScript) app, using Expo Router for navigation. This is the whole project.

## Running locally

```bash
cd mobile
npm install   # first time only
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator (or scan the QR code with Expo Go on a physical device). No server, no environment variables, no network setup — it works the same everywhere.

## Game modes

### Host Game

From Home, tap **Host Game**, enter your name, and a room code is generated (cosmetic — there's no networking behind it; it exists to match the game's visual identity). From the lobby you add the names of everyone else playing, then start. This is Pass & Play: the device is physically handed around — each player creates their card in turn (with a "pass the device to \<name\>" handoff screen between turns), then during gameplay a tab strip lets whoever's turn it is switch to their own card. Global marking is enforced locally: marking a number updates it on every player's card immediately, exactly like the networked version described in the PRD.

### Play vs Bot

From Home, tap **Play vs Bot**, enter your name, and choose 1–3 bot opponents. Bots get a valid card instantly (no card-creation turn needed for them). During the game, each bot:

- Marks any called number that appears on its card the moment it's called (a bot never "forgets").
- Occasionally calls a fresh uncalled number itself, to keep the game moving.
- Claims Bingo automatically the instant its card satisfies the current round's pattern.

This all runs through the same store actions (`callNumber`, `markNumber`, `claimBingo`) a human uses — see `mobile/src/game/useBotAutoplay.ts`. A bot's card is shown read-only in its tab; you can't tap to mark on its behalf (and don't need to — marking is global, so any number you or another bot marks applies to every card, bots included).

## Core game rules implemented

- Card creation: tap any empty cell to place the next sequential number (1→25); no typing. The game moves to gameplay once every player's card is complete.
- Calling: any not-yet-called number (1–25) can be called; duplicates are rejected.
- Marking: a number can only be marked once it's been called, and only once; marking is global — it appears on every player's card, at each player's own cell position for that number.
- Round patterns: Round 1 = any one full row; Round 2 = any two full rows; Round 3 = full house (all 25). Bingo claims are validated against the current round's pattern before being accepted, and a player can't claim a round they've already won.
- Three rounds run in sequence on the same cards; the game ends once someone wins Round 3.

## Not yet implemented (see PRD §24, "Future Features")

- Real device-to-device multiplayer (separate phones playing together). That was explicitly scoped out in favor of this fully local build — see the game modes above for what replaced it.
- Persistent accounts, rankings, profiles, saved game history.
- Social features (friends, chat), progression (XP/levels), additional game modes, cosmetics.
