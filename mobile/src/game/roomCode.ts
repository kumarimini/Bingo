// Purely cosmetic — there's no server or networking, so this code isn't looked
// up anywhere. It just gives the "Host Game" lobby the same visual identity
// the PRD's room-code screens describe, for a single device passed around.

// Excludes visually ambiguous characters (0/O, 1/I).
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}
