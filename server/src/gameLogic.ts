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

export type LineType = 'row' | 'col' | 'diag-main' | 'diag-anti';

export interface Line {
  type: LineType;
  index: number; // row/col index (0-4); unused for diagonals
  cells: [number, number][];
}

function buildAllLines(): Line[] {
  const lines: Line[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    lines.push({ type: 'row', index: r, cells: Array.from({ length: GRID_SIZE }, (_, c) => [r, c]) });
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    lines.push({ type: 'col', index: c, cells: Array.from({ length: GRID_SIZE }, (_, r) => [r, c]) });
  }
  lines.push({ type: 'diag-main', index: 0, cells: Array.from({ length: GRID_SIZE }, (_, i) => [i, i]) });
  lines.push({
    type: 'diag-anti',
    index: 0,
    cells: Array.from({ length: GRID_SIZE }, (_, i) => [i, GRID_SIZE - 1 - i]),
  });
  return lines;
}

// Every possible winning line on a 5x5 card: 5 rows + 5 columns + 2 diagonals.
const ALL_LINES = buildAllLines();

export function getCompletedLines(grid: (number | null)[][], markedNumbers: number[]): Line[] {
  const marked = new Set(markedNumbers);
  return ALL_LINES.filter((line) =>
    line.cells.every(([r, c]) => {
      const v = grid[r][c];
      return v !== null && marked.has(v);
    })
  );
}

export function countCompletedLines(grid: (number | null)[][], markedNumbers: number[]): number {
  return getCompletedLines(grid, markedNumbers).length;
}

/** Checks whether a player's card satisfies the given round's winning pattern. */
export function checkRoundWin(
  grid: (number | null)[][],
  markedNumbers: number[],
  round: RoundNumber
): boolean {
  if (round === 1) return countCompletedLines(grid, markedNumbers) >= 1;
  if (round === 2) return countCompletedLines(grid, markedNumbers) >= 2;
  // round 3: full house
  const marked = new Set(markedNumbers);
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
