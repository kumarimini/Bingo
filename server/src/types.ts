export type GameStatus = 'WAITING' | 'PLAYING' | 'COMPLETED';

export type Grid = number[][];

export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  grid: Grid;
  connected: boolean;
  totalScore: number;
  roundsWon: number[];
}

export interface RoomState {
  code: string;
  hostId: string;
  status: GameStatus;
  maxPlayers: number;
  totalRounds: number;
  currentRound: number;
  players: Player[];
  calledNumbers: number[];
  markedNumbers: number[];
  winners: { round: number; playerId: string; playerName: string }[];
  createdAt: number;
}

export const GRID_SIZE = 5;
export const FREE_SPACE = 0;
export const MAX_NUMBER = 75;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS_LIMIT = 6;
export const MIN_ROUNDS = 3;
export const MAX_ROUNDS_LIMIT = 15;
