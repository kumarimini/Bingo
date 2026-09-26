import { COLUMN_LETTERS, COLUMN_RANGES, GRID_SIZE, FREE_SPACE, Grid } from './types';

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
  COLUMN_LETTERS.forEach((letter, col) => {
    const [lo, hi] = COLUMN_RANGES[letter];
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

export type LineType = 'row' | 'col' | 'diag-main' | 'diag-anti';

export interface Line {
  type: LineType;
  index: number;
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

const ALL_LINES = buildAllLines();

export function getCompletedLines(grid: Grid, markedNumbers: number[]): Line[] {
  return ALL_LINES.filter((line) => line.cells.every(([r, c]) => isMarked(grid[r][c], markedNumbers)));
}

export function countCompletedLines(grid: Grid, markedNumbers: number[]): number {
  return getCompletedLines(grid, markedNumbers).length;
}

export function isFullHouse(grid: Grid, markedNumbers: number[]): boolean {
  return grid.every((row) => row.every((cell) => isMarked(cell, markedNumbers)));
}

/** Classic single-round Bingo: the round is won the instant any one line completes. */
export function checkBingo(grid: Grid, markedNumbers: number[]): boolean {
  return countCompletedLines(grid, markedNumbers) >= 1;
}

const POINTS_PER_MARK = 10;
const POINTS_PER_LINE = 100;
const POINTS_FULL_HOUSE = 300;

/** A simple, transparent running score: points per number you've marked,
 * plus a bonus per completed line, plus a bigger bonus for a full house. */
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
