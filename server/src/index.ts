import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { EVENTS } from './events';
import {
  createRoom,
  getRoom,
  joinRoom,
  findRoomBySocket,
  removeRoomIfEmpty,
  sweepStaleRooms,
} from './roomManager';
import { generateCard, checkBingo, computeScore, MAX_NUMBER } from './gameLogic';
import { MIN_PLAYERS, MAX_PLAYERS_LIMIT, MIN_ROUNDS, MAX_ROUNDS_LIMIT } from './types';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function broadcastRoom(code: string) {
  const room = getRoom(code);
  if (!room) return;
  io.to(code).emit(EVENTS.ROOM_UPDATE, room);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.floor(n) || lo));
}

// A socket that creates or joins a second room (e.g. the player backed out to
// Home and started a new game) would otherwise stay subscribed to the old
// room's broadcasts forever, occasionally clobbering the new room's state on
// screen with stale data from the abandoned one.
function leaveOtherRooms(socket: Socket) {
  for (const room of socket.rooms) {
    if (room !== socket.id) socket.leave(room);
  }
}

io.on('connection', (socket: Socket) => {
  socket.on(
    EVENTS.CREATE_ROOM,
    ({ playerName, maxPlayers, totalRounds }: { playerName: string; maxPlayers?: number; totalRounds?: number }, cb) => {
      leaveOtherRooms(socket);
      const playerId = uuid();
      const room = createRoom(
        playerId,
        playerName || 'Player',
        clamp(maxPlayers ?? MIN_PLAYERS, MIN_PLAYERS, MAX_PLAYERS_LIMIT),
        clamp(totalRounds ?? MIN_ROUNDS, MIN_ROUNDS, MAX_ROUNDS_LIMIT)
      );
      room.players[0].socketId = socket.id;
      socket.join(room.code);
      cb?.({ ok: true, room, playerId });
    }
  );

  socket.on(
    EVENTS.JOIN_ROOM,
    ({ code, playerName }: { code: string; playerName: string }, cb) => {
      code = (code || '').trim().toUpperCase();
      const room = getRoom(code);
      if (!room) return cb?.({ ok: false, error: 'Room not found' });
      if (room.status !== 'WAITING') return cb?.({ ok: false, error: 'Game already started' });
      if (room.players.length >= room.maxPlayers) return cb?.({ ok: false, error: 'Room is full' });
      const playerId = uuid();
      const updated = joinRoom(code, playerId, playerName || 'Player');
      if (!updated) return cb?.({ ok: false, error: 'Cannot join room' });
      leaveOtherRooms(socket);
      const player = updated.players.find((p) => p.id === playerId)!;
      player.socketId = socket.id;
      socket.join(code);
      cb?.({ ok: true, room: updated, playerId });
      broadcastRoom(code);
    }
  );

  socket.on(EVENTS.START_GAME, ({ code, playerId }: { code: string; playerId: string }, cb) => {
    const room = getRoom(code);
    if (!room) return cb?.({ ok: false, error: 'Room not found' });
    if (room.hostId !== playerId) return cb?.({ ok: false, error: 'Only the host can start the game' });
    if (room.status !== 'WAITING') return cb?.({ ok: false, error: 'Game already started' });
    if (room.players.length < MIN_PLAYERS) return cb?.({ ok: false, error: `Need at least ${MIN_PLAYERS} players` });

    room.players.forEach((p) => (p.grid = generateCard()));
    room.status = 'PLAYING';
    room.currentRound = 1;
    room.calledNumbers = [];
    room.markedNumbers = [];

    io.to(code).emit(EVENTS.GAME_START, { room });
    io.to(code).emit(EVENTS.ROUND_START, { round: 1 });
    cb?.({ ok: true });
    broadcastRoom(code);
  });

  socket.on(
    EVENTS.CALL_NUMBER,
    ({ code, playerId, number }: { code: string; playerId: string; number: number }, cb) => {
      const room = getRoom(code);
      if (!room) return cb?.({ ok: false, error: 'Room not found' });
      if (room.status !== 'PLAYING') return cb?.({ ok: false, error: 'Game not active' });
      if (room.calledNumbers.includes(number)) {
        return cb?.({ ok: false, error: 'Number already called' });
      }
      if (number < 1 || number > MAX_NUMBER) return cb?.({ ok: false, error: 'Invalid number' });

      room.calledNumbers.push(number);
      const caller = room.players.find((p) => p.id === playerId);
      io.to(code).emit(EVENTS.NUMBER_CALLED, { number, calledBy: caller?.name ?? 'Unknown' });
      cb?.({ ok: true });
      broadcastRoom(code);
    }
  );

  socket.on(
    EVENTS.MARK_NUMBER,
    ({ code, number }: { code: string; number: number }, cb) => {
      const room = getRoom(code);
      if (!room) return cb?.({ ok: false, error: 'Room not found' });
      if (room.status !== 'PLAYING') return cb?.({ ok: false, error: 'Game not active' });
      if (!room.calledNumbers.includes(number)) {
        return cb?.({ ok: false, error: 'Number not called yet' });
      }
      if (room.markedNumbers.includes(number)) {
        return cb?.({ ok: false, error: 'Number already marked' });
      }
      room.markedNumbers.push(number);
      io.to(code).emit(EVENTS.NUMBER_MARKED, { number });
      cb?.({ ok: true });
      broadcastRoom(code);
    }
  );

  socket.on(EVENTS.BINGO_CLAIM, ({ code, playerId }: { code: string; playerId: string }, cb) => {
    const room = getRoom(code);
    if (!room) return cb?.({ ok: false, error: 'Room not found' });
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return cb?.({ ok: false, error: 'Player not found' });
    if (room.status !== 'PLAYING') return cb?.({ ok: false, error: 'Game not active' });

    const round = room.currentRound;
    if (player.roundsWon.includes(round)) {
      io.to(socket.id).emit(EVENTS.BINGO_INVALID, { reason: 'Already won this round' });
      return cb?.({ ok: false });
    }

    const won = checkBingo(player.grid, room.markedNumbers);
    if (!won) {
      io.to(socket.id).emit(EVENTS.BINGO_INVALID, { reason: 'No completed line yet' });
      return cb?.({ ok: false });
    }

    player.roundsWon.push(round);
    player.totalScore += computeScore(player.grid, room.markedNumbers);
    room.winners.push({ round, playerId: player.id, playerName: player.name });
    io.to(code).emit(EVENTS.BINGO_VALID, { playerId: player.id, playerName: player.name, round });
    io.to(code).emit(EVENTS.ROUND_END, { round, winner: player.name });

    if (round >= room.totalRounds) {
      room.status = 'COMPLETED';
      io.to(code).emit(EVENTS.GAME_END, { winners: room.winners, players: room.players });
    } else {
      room.currentRound = round + 1;
      room.players.forEach((p) => (p.grid = generateCard()));
      room.calledNumbers = [];
      room.markedNumbers = [];
      io.to(code).emit(EVENTS.ROUND_START, { round: room.currentRound });
    }

    cb?.({ ok: true });
    broadcastRoom(code);
  });

  socket.on('disconnect', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;
    player.connected = false;
    io.to(room.code).emit(EVENTS.PLAYER_DISCONNECTED, { playerId: player.id });
    broadcastRoom(room.code);
    removeRoomIfEmpty(room.code);
  });
});

// Safety net for rooms abandoned without a clean disconnect (e.g. the app was
// backgrounded/killed, or the player navigated to a new game on the same
// socket without ever closing the old one) — a disconnect event alone can't
// catch those, so periodically sweep anything old enough to be stale.
const SWEEP_INTERVAL_MS = 30 * 60 * 1000;
const STALE_ROOM_MAX_AGE_MS = 3 * 60 * 60 * 1000;
setInterval(() => sweepStaleRooms(STALE_ROOM_MAX_AGE_MS), SWEEP_INTERVAL_MS);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
  console.log(`Bingo server listening on :${PORT}`);
});
