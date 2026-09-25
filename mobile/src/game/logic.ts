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

function fullyMarkedRows(grid: Grid, marked: Set<number>): number {
  let count = 0;
  for (const row of grid) {
    if (row.every((cell) => cell !== null && marked.has(cell))) count += 1;
  }
  return count;
}

export function checkRoundWin(grid: Grid, markedNumbers: number[], round: RoundNumber): boolean {
  const marked = new Set(markedNumbers);
  if (round === 1) return fullyMarkedRows(grid, marked) >= 1;
  if (round === 2) return fullyMarkedRows(grid, marked) >= 2;
  return grid.every((row) => row.every((cell) => cell !== null && marked.has(cell)));
}

export function roundLabel(round: RoundNumber): string {
  if (round === 1) return 'One Line';
  if (round === 2) return 'Two Lines';
  return 'Full House';
}
