import { GRID_SIZE, CARD_TOTAL, Player, RoundNumber } from './types';

export function emptyGrid(): (number | null)[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

/** Places the player's nextNumber at (row, col) if the cell is empty and the card isn't full. */
export function placeNumber(
  player: Player,
  row: number,
  col: number
): { ok: true } | { ok: false; reason: string } {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return { ok: false, reason: 'Cell out of bounds' };
  }
  if (player.nextNumber > CARD_TOTAL) {
    return { ok: false, reason: 'Card already complete' };
  }
  if (player.grid[row][col] !== null) {
    return { ok: false, reason: 'Cell already filled' };
  }
  player.grid[row][col] = player.nextNumber;
  player.nextNumber += 1;
  return { ok: true };
}

export function isCardComplete(player: Player): boolean {
  return player.nextNumber > CARD_TOTAL;
}

/** Every number 1..25 appears exactly once. */
export function validateCard(grid: (number | null)[][]): boolean {
  const seen = new Set<number>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell === null || cell < 1 || cell > CARD_TOTAL) return false;
      if (seen.has(cell)) return false;
      seen.add(cell);
    }
  }
  return seen.size === CARD_TOTAL;
}

function fullyMarkedRows(grid: (number | null)[][], marked: Set<number>): number {
  let count = 0;
  for (const row of grid) {
    if (row.every((cell) => cell !== null && marked.has(cell))) count += 1;
  }
  return count;
}

/** Checks whether a player's card satisfies the given round's winning pattern. */
export function checkRoundWin(
  grid: (number | null)[][],
  markedNumbers: number[],
  round: RoundNumber
): boolean {
  const marked = new Set(markedNumbers);
  if (round === 1) return fullyMarkedRows(grid, marked) >= 1;
  if (round === 2) return fullyMarkedRows(grid, marked) >= 2;
  // round 3: full house
  return grid.every((row) => row.every((cell) => cell !== null && marked.has(cell)));
}

// Excludes visually ambiguous characters (0/O, 1/I) to keep codes easy to read and re-type.
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 5;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}
