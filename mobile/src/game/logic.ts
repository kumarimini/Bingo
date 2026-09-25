import { GRID_SIZE, CARD_TOTAL, Grid, RoundNumber } from './types';

export function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

/** A complete, valid 5x5 card with 1-25 placed in random cells — used to instantly fill a bot's card. */
export function randomFilledGrid(): Grid {
  const numbers = Array.from({ length: CARD_TOTAL }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  const grid = emptyGrid();
  let idx = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = numbers[idx++];
    }
  }
  return grid;
}

export function isCardComplete(grid: Grid, nextNumber: number): boolean {
  return nextNumber > CARD_TOTAL;
}

export function validateCard(grid: Grid): boolean {
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
  cells: [number, number][]; // [row, col] pairs, in order
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

/** Every row/column/diagonal that's fully marked on this card right now. */
export function getCompletedLines(grid: Grid, markedNumbers: number[]): Line[] {
  const marked = new Set(markedNumbers);
  return ALL_LINES.filter((line) =>
    line.cells.every(([r, c]) => {
      const v = grid[r][c];
      return v !== null && marked.has(v);
    })
  );
}

export function countCompletedLines(grid: Grid, markedNumbers: number[]): number {
  return getCompletedLines(grid, markedNumbers).length;
}

export function checkRoundWin(grid: Grid, markedNumbers: number[], round: RoundNumber): boolean {
  if (round === 1) return countCompletedLines(grid, markedNumbers) >= 1;
  if (round === 2) return countCompletedLines(grid, markedNumbers) >= 2;
  const marked = new Set(markedNumbers);
  return grid.every((row) => row.every((cell) => cell !== null && marked.has(cell)));
}

export function roundLabel(round: RoundNumber): string {
  if (round === 1) return 'One Line';
  if (round === 2) return 'Two Lines';
  return 'Full House';
}
