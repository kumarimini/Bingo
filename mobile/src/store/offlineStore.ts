import { create } from 'zustand';
import { generateCard, checkBingo, isFullHouse } from '../game/logic';
import { Grid, MAX_NUMBER } from '../game/types';

export interface OfflinePlayer {
  id: string;
  name: string;
  isBot: boolean;
  grid: Grid;
  announcedLine: boolean;
  announcedFullHouse: boolean;
}

export type Turn = 'human' | 'bot';
export type OfflineMode = 'bot' | 'board';

export interface Announcement {
  playerName: string;
  kind: 'line' | 'fullhouse';
}

interface OfflineState {
  mode: OfflineMode;
  players: OfflinePlayer[];
  calledNumbers: number[];
  markedNumbers: number[];
  turn: Turn;
  announcement: Announcement | null;

  setupBotGame: (humanName: string) => void;
  setupBoardOnly: (name: string) => void;
  fillBoard: () => void;
  performTurn: () => void;
  markCell: (playerId: string, row: number, col: number) => void;
  dismissAnnouncement: () => void;
  reset: () => void;
}

function makePlayer(id: string, name: string, isBot: boolean): OfflinePlayer {
  return { id, name, isBot, grid: generateCard(), announcedLine: false, announcedFullHouse: false };
}

// Checks every player for a newly-crossed milestone (first line, then full
// house) and returns the announcement for the first one found, marking it as
// announced so it's never repeated for that player on that board.
function checkAnnouncements(players: OfflinePlayer[], markedNumbers: number[]): { players: OfflinePlayer[]; announcement: Announcement | null } {
  let announcement: Announcement | null = null;
  const updated = players.map((p) => {
    if (!announcement && !p.announcedFullHouse && isFullHouse(p.grid, markedNumbers)) {
      announcement = { playerName: p.name, kind: 'fullhouse' };
      return { ...p, announcedLine: true, announcedFullHouse: true };
    }
    if (!announcement && !p.announcedLine && checkBingo(p.grid, markedNumbers)) {
      announcement = { playerName: p.name, kind: 'line' };
      return { ...p, announcedLine: true };
    }
    return p;
  });
  return { players: updated, announcement };
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  mode: 'bot',
  players: [],
  calledNumbers: [],
  markedNumbers: [],
  turn: 'human',
  announcement: null,

  setupBotGame: (humanName: string) => {
    set({
      mode: 'bot',
      players: [makePlayer('human', humanName, false), makePlayer('bot', 'Bot', true)],
      calledNumbers: [],
      markedNumbers: [],
      turn: 'human',
      announcement: null,
    });
  },

  setupBoardOnly: (name: string) => {
    set({
      mode: 'board',
      players: [makePlayer('human', name, false)],
      calledNumbers: [],
      markedNumbers: [],
      turn: 'human',
      announcement: null,
    });
  },

  fillBoard: () => {
    set((s) => ({
      players: s.players.map((p) => makePlayer(p.id, p.name, p.isBot)),
      calledNumbers: [],
      markedNumbers: [],
      turn: 'human',
      announcement: null,
    }));
  },

  // Bot mode only: calls one random not-yet-called number from the full
  // 1-75 pool (unlike our old 1-25 model, a 75-ball card only holds 24 of
  // the 75 possible numbers, so a call may not match either player's card —
  // that's expected, just like real Bingo) and marks it globally.
  performTurn: () => {
    const state = get();
    const uncalled: number[] = [];
    for (let n = 1; n <= MAX_NUMBER; n++) {
      if (!state.calledNumbers.includes(n)) uncalled.push(n);
    }
    if (uncalled.length === 0) return;
    const n = uncalled[Math.floor(Math.random() * uncalled.length)];

    set((s) => ({
      calledNumbers: [...s.calledNumbers, n],
      markedNumbers: [...s.markedNumbers, n],
      turn: s.turn === 'human' ? 'bot' : 'human',
    }));

    const latest = get();
    const { players, announcement } = checkAnnouncements(latest.players, latest.markedNumbers);
    if (announcement) set({ players, announcement });
  },

  // Board-only mode: tapping a cell marks that number directly (there's no
  // "called" concept — numbers are being called by whoever's running the
  // physical game, and the app is just a personal card you self-mark).
  markCell: (playerId: string, row: number, col: number) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return;
    const n = player.grid[row][col];
    if (n === 0 || state.markedNumbers.includes(n)) return;

    set((s) => ({ markedNumbers: [...s.markedNumbers, n] }));

    const latest = get();
    const { players, announcement } = checkAnnouncements(latest.players, latest.markedNumbers);
    if (announcement) set({ players, announcement });
  },

  dismissAnnouncement: () => set({ announcement: null }),

  reset: () =>
    set({
      players: [],
      calledNumbers: [],
      markedNumbers: [],
      turn: 'human',
      announcement: null,
    }),
}));
