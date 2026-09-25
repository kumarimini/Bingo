import { Platform } from 'react-native';

// Set this once you've deployed the server somewhere public (see the root
// README's "Deploying the server" section) — this is what Play Store / real
// device builds fall back to when EXPO_PUBLIC_SERVER_URL isn't set at build
// time. It's what makes "two friends in different locations" actually work.
const PRODUCTION_SERVER_URL = 'https://YOUR-DEPLOYED-SERVER-URL.example.com';

// 10.0.2.2 is the special alias an Android emulator uses to reach its host
// machine's localhost; iOS simulators can reach the host directly. These
// only make sense for local development, never for a real device.
const DEV_DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

// For a physical device during development (same Wi-Fi as your dev machine),
// set EXPO_PUBLIC_SERVER_URL to your machine's LAN IP, e.g.
// EXPO_PUBLIC_SERVER_URL=http://192.168.1.20:4000 npm start
export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || (__DEV__ ? DEV_DEFAULT_URL : PRODUCTION_SERVER_URL);

export const SOCKET_ACK_TIMEOUT_MS = 8000;

export const ROOM_CODE_LENGTH = 5;
