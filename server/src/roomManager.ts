import { RoomState, Player } from './types';
import { generateCard, generateRoomCode } from './gameLogic';

const rooms = new Map<string, RoomState>();

export function createRoom(hostId: string, hostName: string, maxPlayers: number, totalRounds: number): RoomState {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();

  const host: Player = {
    id: hostId,
    socketId: null,
    name: hostName,
    grid: generateCard(),
    connected: true,
    totalScore: 0,
    roundsWon: [],
  };

  const room: RoomState = {
    code,
    hostId,
    status: 'WAITING',
    maxPlayers,
    totalRounds,
    currentRound: 1,
    players: [host],
    calledNumbers: [],
    markedNumbers: [],
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
  if (room.players.length >= room.maxPlayers) return undefined;
  if (room.players.some((p) => p.id === playerId)) return room;

  room.players.push({
    id: playerId,
    socketId: null,
    name: playerName,
    grid: generateCard(),
    connected: true,
    totalScore: 0,
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
