import { RoomState, Player, RoundNumber } from './types';
import { emptyGrid, generateRoomCode } from './gameLogic';

const rooms = new Map<string, RoomState>();

export function createRoom(hostId: string, hostName: string): RoomState {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();

  const host: Player = {
    id: hostId,
    socketId: null,
    name: hostName,
    grid: emptyGrid(),
    nextNumber: 1,
    ready: false,
    connected: true,
    roundsWon: [],
  };

  const room: RoomState = {
    code,
    hostId,
    status: 'WAITING',
    players: [host],
    calledNumbers: [],
    markedNumbers: [],
    currentRound: 1,
    winners: [],
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function joinRoom(code: string, playerId: string, playerName: string): RoomState | undefined {
  const room = rooms.get(code);
  if (!room) return undefined;
  if (room.status !== 'WAITING') return undefined;
  if (room.players.some((p) => p.id === playerId)) return room;

  room.players.push({
    id: playerId,
    socketId: null,
    name: playerName,
    grid: emptyGrid(),
    nextNumber: 1,
    ready: false,
    connected: true,
    roundsWon: [],
  });
  return room;
}

export function removeRoomIfEmpty(code: string) {
  const room = rooms.get(code);
  if (room && room.players.every((p) => !p.connected)) {
    rooms.delete(code);
  }
}

/** Removes any room older than maxAgeMs, regardless of connection state — a
 * backstop for rooms abandoned without ever triggering a socket disconnect. */
export function sweepStaleRooms(maxAgeMs: number) {
  const cutoff = Date.now() - maxAgeMs;
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(code);
  }
}

export function findRoomBySocket(socketId: string): RoomState | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) return room;
  }
  return undefined;
}

export function resetForNextRound(room: RoomState, nextRound: RoundNumber) {
  room.currentRound = nextRound;
  room.status = nextRound === 1 ? 'ROUND_1' : nextRound === 2 ? 'ROUND_2' : 'ROUND_3';
}
