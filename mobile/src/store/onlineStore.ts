import { create } from 'zustand';
import { getSocket } from '../game/socket';
import { EVENTS } from '../game/events';
import { RoomState } from '../game/types';

interface LastCall {
  number: number;
  calledBy: string;
}

interface BingoResult {
  ok: boolean;
  message: string;
  round?: number;
  playerName?: string;
}

interface OnlineState {
  connected: boolean;
  room: RoomState | null;
  playerId: string | null;
  error: string | null;
  lastCall: LastCall | null;
  bingoResult: BingoResult | null;
  gameEndWinners: RoomState['winners'] | null;

  connect: () => void;
  createRoom: (playerName: string) => Promise<{ ok: boolean; error?: string }>;
  joinRoom: (code: string, playerName: string) => Promise<{ ok: boolean; error?: string }>;
  placeNumber: (row: number, col: number) => void;
  callNumber: (number: number) => void;
  markNumber: (number: number) => void;
  claimBingo: () => void;
  clearBingoResult: () => void;
  reset: () => void;
}

export const useOnlineStore = create<OnlineState>((set, get) => ({
  connected: false,
  room: null,
  playerId: null,
  error: null,
  lastCall: null,
  bingoResult: null,
  gameEndWinners: null,

  connect: () => {
    const socket = getSocket();
    if (socket.hasListeners(EVENTS.ROOM_UPDATE)) return;

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on(EVENTS.ROOM_UPDATE, (room: RoomState) => set({ room }));

    socket.on(EVENTS.NUMBER_CALLED, ({ number, calledBy }: LastCall) => {
      set({ lastCall: { number, calledBy } });
    });

    socket.on(EVENTS.BINGO_VALID, ({ playerName, round }: { playerName: string; round: number }) => {
      set({ bingoResult: { ok: true, message: `${playerName} completed ROUND ${round}.`, round, playerName } });
    });

    socket.on(EVENTS.BINGO_INVALID, ({ reason }: { reason: string }) => {
      set({ bingoResult: { ok: false, message: reason } });
    });

    socket.on(EVENTS.GAME_END, ({ winners }: { winners: RoomState['winners'] }) => {
      set({ gameEndWinners: winners });
    });
  },

  createRoom: (playerName: string) =>
    new Promise((resolve) => {
      const socket = getSocket();
      socket.emit(EVENTS.CREATE_ROOM, { playerName }, (res: any) => {
        if (res.ok) {
          set({ room: res.room, playerId: res.playerId });
          resolve({ ok: true });
        } else {
          resolve({ ok: false, error: res.error });
        }
      });
    }),

  joinRoom: (code: string, playerName: string) =>
    new Promise((resolve) => {
      const socket = getSocket();
      socket.emit(EVENTS.JOIN_ROOM, { code, playerName }, (res: any) => {
        if (res.ok) {
          set({ room: res.room, playerId: res.playerId });
          resolve({ ok: true });
        } else {
          resolve({ ok: false, error: res.error });
        }
      });
    }),

  placeNumber: (row: number, col: number) => {
    const { room, playerId } = get();
    if (!room || !playerId) return;
    getSocket().emit(EVENTS.PLACE_NUMBER, { code: room.code, playerId, row, col }, () => {});
  },

  callNumber: (number: number) => {
    const { room, playerId } = get();
    if (!room || !playerId) return;
    getSocket().emit(EVENTS.CALL_NUMBER, { code: room.code, playerId, number }, () => {});
  },

  markNumber: (number: number) => {
    const { room } = get();
    if (!room) return;
    getSocket().emit(EVENTS.MARK_NUMBER, { code: room.code, number }, () => {});
  },

  claimBingo: () => {
    const { room, playerId } = get();
    if (!room || !playerId) return;
    getSocket().emit(EVENTS.BINGO_CLAIM, { code: room.code, playerId }, () => {});
  },

  clearBingoResult: () => set({ bingoResult: null }),

  reset: () => set({ room: null, playerId: null, error: null, lastCall: null, bingoResult: null, gameEndWinners: null }),
}));
