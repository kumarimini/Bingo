import { Platform } from 'react-native';

// 10.0.2.2 is the special alias an Android emulator uses to reach its host
// machine's localhost; iOS simulators can reach the host directly.
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

// For a physical device on the same Wi-Fi, set EXPO_PUBLIC_SERVER_URL to your
// machine's LAN IP, e.g. EXPO_PUBLIC_SERVER_URL=http://192.168.1.20:4000
export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || DEFAULT_URL;

export const SOCKET_ACK_TIMEOUT_MS = 8000;

export const ROOM_CODE_LENGTH = 5;
