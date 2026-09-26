import { Grid, GRID_SIZE, FREE_SPACE, MAX_NUMBER } from './types';

const COLUMN_RANGES: [number, number][] = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A fresh, valid, fully-populated 5x5 card — column c only ever holds
 * numbers from that column's range, center cell is FREE. */
export function generateCard(): Grid {
  const grid: Grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(FREE_SPACE));
  COLUMN_RANGES.forEach(([lo, hi], col) => {
    const pool: number[] = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    const picked = shuffle(pool).slice(0, GRID_SIZE);
    for (let row = 0; row < GRID_SIZE; row++) {
      grid[row][col] = picked[row];
    }
  });
  grid[2][2] = FREE_SPACE;
  return grid;
}

export function isMarked(cell: number, markedNumbers: number[]): boolean {
  return cell === FREE_SPACE || markedNumbers.includes(cell);
}

interface Line {
  cells: [number, number][];
}

function buildAllLines(): Line[] {
  const lines: Line[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    lines.push({ cells: Array.from({ length: GRID_SIZE }, (_, c) => [r, c]) });
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    lines.push({ cells: Array.from({ length: GRID_SIZE }, (_, r) => [r, c]) });
  }
  lines.push({ cells: Array.from({ length: GRID_SIZE }, (_, i) => [i, i]) });
  lines.push({ cells: Array.from({ length: GRID_SIZE }, (_, i) => [i, GRID_SIZE - 1 - i]) });
  return lines;
}

const ALL_LINES = buildAllLines();

export function countCompletedLines(grid: Grid, markedNumbers: number[]): number {
  return ALL_LINES.filter((line) => line.cells.every(([r, c]) => isMarked(grid[r][c], markedNumbers))).length;
}

export function isFullHouse(grid: Grid, markedNumbers: number[]): boolean {
  return grid.every((row) => row.every((cell) => isMarked(cell, markedNumbers)));
}

/** Classic single-round Bingo: won the instant any one line completes. */
export function checkBingo(grid: Grid, markedNumbers: number[]): boolean {
  return countCompletedLines(grid, markedNumbers) >= 1;
}

const POINTS_PER_MARK = 10;
const POINTS_PER_LINE = 100;
const POINTS_FULL_HOUSE = 300;

export function computeScore(grid: Grid, markedNumbers: number[]): number {
  let marksOnCard = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== FREE_SPACE && markedNumbers.includes(cell)) marksOnCard++;
    }
  }
  const lines = countCompletedLines(grid, markedNumbers);
  const fullHouse = isFullHouse(grid, markedNumbers);
  return marksOnCard * POINTS_PER_MARK + lines * POINTS_PER_LINE + (fullHouse ? POINTS_FULL_HOUSE : 0);
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

export { MAX_NUMBER };
