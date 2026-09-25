import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './config';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      // Allow the polling handshake to fall back to if a direct websocket
      // upgrade fails (common on emulators and some Wi-Fi networks) —
      // forcing websocket-only here was silently breaking the connection.
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      timeout: 8000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
