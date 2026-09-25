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

type Mode = 'host' | 'bot';

interface OfflineState {
  mode: Mode;
  roomCode: string;
  players: OfflinePlayer[];
  calledNumbers: number[];
  markedNumbers: number[];
  currentRound: RoundNumber;
  activePlayerIndex: number;
  status: 'CARD_CREATION' | 'PLAYING' | 'COMPLETED';
  winners: { round: RoundNumber; playerName: string }[];

  setup: (mode: Mode, roomCode: string, specs: PlayerSpec[]) => void;
  placeNumber: (playerId: string, row: number, col: number) => void;
  autoFillBotCard: (playerId: string) => void;
  setActivePlayer: (index: number) => void;
  callNumber: (number: number) => void;
  markNumber: (number: number) => void;
  claimBingo: (playerId: string) => { ok: boolean; message: string };
  reset: () => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  mode: 'host',
  roomCode: '',
  players: [],
  calledNumbers: [],
  markedNumbers: [],
  currentRound: 1,
  activePlayerIndex: 0,
  status: 'CARD_CREATION',
  winners: [],

  setup: (mode: Mode, roomCode: string, specs: PlayerSpec[]) => {
    set({
      mode,
      roomCode,
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
      activePlayerIndex: 0,
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

  setActivePlayer: (index: number) => set({ activePlayerIndex: index }),

  callNumber: (number: number) => {
    set((state) => {
      if (state.calledNumbers.includes(number)) return state;
      return { calledNumbers: [...state.calledNumbers, number] };
    });
  },

  markNumber: (number: number) => {
    set((state) => {
      if (!state.calledNumbers.includes(number)) return state;
      if (state.markedNumbers.includes(number)) return state;
      return { markedNumbers: [...state.markedNumbers, number] };
    });
  },

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
      currentRound: round === 3 ? round : ((round + 1) as RoundNumber),
      status: round === 3 ? 'COMPLETED' : 'PLAYING',
    }));

    return { ok: true, message: `${player.name} completed ROUND ${round}.` };
  },

  reset: () =>
    set({
      mode: 'host',
      roomCode: '',
      players: [],
      calledNumbers: [],
      markedNumbers: [],
      currentRound: 1,
      activePlayerIndex: 0,
      status: 'CARD_CREATION',
      winners: [],
    }),
}));
