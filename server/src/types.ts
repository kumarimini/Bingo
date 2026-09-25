export type GameStatus =
  | 'WAITING'
  | 'CARD_CREATION'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'COMPLETED';

export type RoundNumber = 1 | 2 | 3;

export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  grid: (number | null)[][]; // 5x5, null until filled
  nextNumber: number; // next number to place, 1-26 (26 = card complete)
  ready: boolean;
  connected: boolean;
  roundsWon: RoundNumber[];
}

export interface RoomState {
  code: string;
  hostId: string;
  status: GameStatus;
  players: Player[];
  calledNumbers: number[]; // in call order
  markedNumbers: number[]; // globally marked numbers
  currentRound: RoundNumber;
  winners: { round: RoundNumber; playerId: string; playerName: string }[];
  createdAt: number;
}

export const GRID_SIZE = 5;
export const CARD_TOTAL = GRID_SIZE * GRID_SIZE;
