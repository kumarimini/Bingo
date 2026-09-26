// Classic 75-ball Bingo: 5 columns (B/I/N/G/O), each with its own number
// range, a FREE center cell, and cards that are always fully generated at
// once — there's no manual placement phase anymore.
export const COLUMN_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const;
export type ColumnLetter = (typeof COLUMN_LETTERS)[number];

export const COLUMN_RANGES: Record<ColumnLetter, [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export const GRID_SIZE = 5;
export const FREE_SPACE = 0;
export const MAX_NUMBER = 75;

// A fully-generated 5x5 card. The center cell (row 2, col 2) is always
// FREE_SPACE (0); every other cell holds a real number from that column's
// range. Cards are always complete — there's no "empty" state to represent.
export type Grid = number[][];

export interface RoomState {
  code: string;
  hostId: string;
  status: 'WAITING' | 'PLAYING' | 'COMPLETED';
  maxPlayers: number;
  totalRounds: number;
  currentRound: number;
  players: {
    id: string;
    socketId: string | null;
    name: string;
    grid: Grid;
    connected: boolean;
    totalScore: number;
    roundsWon: number[];
  }[];
  calledNumbers: number[];
  markedNumbers: number[];
  winners: { round: number; playerId: string; playerName: string }[];
  createdAt: number;
}
