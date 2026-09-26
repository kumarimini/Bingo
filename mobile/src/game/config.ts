import { Platform } from 'react-native';

const PRODUCTION_SERVER_URL =
  'https://bingo-server-3tsm.onrender.com';

const DEV_DEFAULT_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

export const SERVER_URL = PRODUCTION_SERVER_URL;

export const SOCKET_ACK_TIMEOUT_MS = 8000;

export const ROOM_CODE_LENGTH = 5;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS_LIMIT = 6;
export const MIN_ROUNDS = 3;
export const MAX_ROUNDS_LIMIT = 15;