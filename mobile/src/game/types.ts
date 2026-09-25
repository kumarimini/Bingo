export type GameStatus =
  | 'WAITING'
  | 'CARD_CREATION'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'COMPLETED';

export type RoundNumber = 1 | 2 | 3;

export type Grid = (number | null)[][];

export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  grid: Grid;
  nextNumber: number;
  ready: boolean;
  connected: boolean;
  roundsWon: RoundNumber[];
}

export interface RoomState {
  code: string;
  hostId: string;
  status: GameStatus;
  players: Player[];
  calledNumbers: number[];
  markedNumbers: number[];
  currentRound: RoundNumber;
  winners: { round: RoundNumber; playerId: string; playerName: string }[];
  createdAt: number;
}

export const GRID_SIZE = 5;
export const CARD_TOTAL = GRID_SIZE * GRID_SIZE;
