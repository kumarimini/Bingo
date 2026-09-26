import { create } from 'zustand';
import { emptyGrid, randomFilledGrid, checkRoundWin } from '../game/logic';
import { Grid, RoundNumber } from '../game/types';

export interface OfflinePlayer {
  id: string;
  name: string;
  isBot: boolean;
  grid: Grid;
  nextNumber: number;
  roundsWon: RoundNumber[];
}

export interface PlayerSpec {
  name: string;
  isBot: boolean;
}

export type Turn = 'human' | 'bot';

interface OfflineState {
  players: OfflinePlayer[];
  calledNumbers: number[];
  markedNumbers: number[];
  currentRound: RoundNumber;
  turn: Turn;
  status: 'CARD_CREATION' | 'PLAYING' | 'COMPLETED';
  winners: { round: RoundNumber; playerName: string }[];

  setup: (specs: PlayerSpec[]) => void;
  placeNumber: (playerId: string, row: number, col: number) => void;
  autoFillBotCard: (playerId: string) => void;
  autoCallNext: () => void;
  claimBingo: (playerId: string) => { ok: boolean; message: string };
  advanceRound: () => void;
  performTurn: () => void;
  reset: () => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  players: [],
  calledNumbers: [],
  markedNumbers: [],
  currentRound: 1,
  turn: 'human',
  status: 'CARD_CREATION',
  winners: [],

  setup: (specs: PlayerSpec[]) => {
    set({
      players: specs.map((spec, i) => ({
        id: `local-${i}`,
        name: spec.name,
        isBot: spec.isBot,
        grid: emptyGrid(),
        nextNumber: 1,
        roundsWon: [],
      })),
      calledNumbers: [],
      markedNumbers: [],
      currentRound: 1,
      turn: 'human',
      status: 'CARD_CREATION',
      winners: [],
    });
  },

  placeNumber: (playerId: string, row: number, col: number) => {
    set((state) => {
      const players = state.players.map((p) => {
        if (p.id !== playerId) return p;
        if (p.nextNumber > 25) return p;
        if (p.grid[row][col] !== null) return p;
        const grid = p.grid.map((r) => [...r]);
        grid[row][col] = p.nextNumber;
        return { ...p, grid, nextNumber: p.nextNumber + 1 };
      });
      const allComplete = players.every((p) => p.nextNumber > 25);
      return { players, status: allComplete ? 'PLAYING' : state.status };
    });
  },

  autoFillBotCard: (playerId: string) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId && p.nextNumber === 1 ? { ...p, grid: randomFilledGrid(), nextNumber: 26 } : p
      ),
    }));
    set((state) => ({
      status: state.players.every((p) => p.nextNumber > 25) ? 'PLAYING' : state.status,
    }));
  },

  // Calls one random not-yet-called number (every card holds all 25 numbers,
  // just at different positions, so any number always applies to both
  // players) and marks it globally. Flips whose "turn" it is, so the UI can
  // show calls happening one by one, alternating, rather than in a burst.
  autoCallNext: () => {
    const state = get();
    const uncalled: number[] = [];
    for (let n = 1; n <= 25; n++) {
      if (!state.calledNumbers.includes(n)) uncalled.push(n);
    }
    if (uncalled.length === 0) return;
    const n = uncalled[Math.floor(Math.random() * uncalled.length)];
    set((s) => ({
      calledNumbers: [...s.calledNumbers, n],
      markedNumbers: [...s.markedNumbers, n],
      turn: s.turn === 'human' ? 'bot' : 'human',
    }));
  },

  // Only records the win — does NOT advance the round. Full house (round 3)
  // is completed by both players at the exact same instant every time (every
  // card holds all 25 numbers, so "all marked" is true for everyone
  // simultaneously) — if this also reset/advanced the round immediately,
  // whichever player happened to be checked first would always win round 3
  // and the other's identical, simultaneous win would be silently dropped.
  // Call advanceRound() once after collecting every simultaneous winner.
  claimBingo: (playerId: string) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return { ok: false, message: 'Player not found' };
    if (player.roundsWon.includes(state.currentRound)) {
      return { ok: false, message: 'Already won this round' };
    }
    const won = checkRoundWin(player.grid, state.markedNumbers, state.currentRound);
    if (!won) return { ok: false, message: 'Your required pattern is not complete.' };

    const round = state.currentRound;
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, roundsWon: [...p.roundsWon, round] } : p
      ),
      winners: [...s.winners, { round, playerName: player.name }],
    }));

    return { ok: true, message: `${player.name} completed ROUND ${round}.` };
  },

  advanceRound: () => {
    set((s) => {
      const round = s.currentRound;
      const isFinalRound = round === 3;
      return {
        players: s.players.map((p) => (isFinalRound ? p : { ...p, grid: emptyGrid(), nextNumber: 1 })),
        currentRound: isFinalRound ? round : ((round + 1) as RoundNumber),
        calledNumbers: isFinalRound ? s.calledNumbers : [],
        markedNumbers: isFinalRound ? s.markedNumbers : [],
        turn: 'human',
        status: isFinalRound ? 'COMPLETED' : 'CARD_CREATION',
      };
    });
  },

  // The one shared step of "a turn happens": call a number, then check every
  // player for a completed round and claim for all of them before advancing
  // once. Used identically whether the human tapped "Call Number" or the
  // bot's own timer triggered it — the human explicitly drives their own
  // turn, the bot's turn (and only the bot's turn) runs on its own.
  performTurn: () => {
    get().autoCallNext();
    const latest = get();
    let anyWinner = false;
    for (const player of latest.players) {
      if (player.roundsWon.includes(latest.currentRound)) continue;
      if (checkRoundWin(player.grid, latest.markedNumbers, latest.currentRound)) {
        get().claimBingo(player.id);
        anyWinner = true;
      }
    }
    if (anyWinner) get().advanceRound();
  },

  reset: () =>
    set({
      players: [],
      calledNumbers: [],
      markedNumbers: [],
      currentRound: 1,
      turn: 'human',
      status: 'CARD_CREATION',
      winners: [],
    }),
}));
