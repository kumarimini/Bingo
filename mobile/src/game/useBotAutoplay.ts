import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { checkRoundWin } from './logic';

const TICK_MS = 1500;
const BOT_ACT_CHANCE = 0.6;

/**
 * Drives every bot player in the local game store. Mirrors what a human does
 * by tapping a cell: each tick, a bot may "touch" one still-unmarked number
 * from its own card, calling and marking it in one step. It also claims
 * Bingo the moment its card satisfies the current round's pattern.
 * A no-op once there are no bot players.
 */
export function useBotAutoplay() {
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useOfflineStore.getState();
      if (state.status !== 'PLAYING') return;
      const bots = state.players.filter((p) => p.isBot);
      if (bots.length === 0) return;

      for (const bot of bots) {
        if (Math.random() >= BOT_ACT_CHANCE) continue;
        const current = useOfflineStore.getState();
        const candidates: number[] = [];
        for (const row of bot.grid) {
          for (const num of row) {
            if (num !== null && !current.markedNumbers.includes(num)) candidates.push(num);
          }
        }
        if (candidates.length === 0) continue;
        const n = candidates[Math.floor(Math.random() * candidates.length)];
        current.callNumber(n);
        current.markNumber(n);
      }

      const latest = useOfflineStore.getState();
      for (const bot of latest.players.filter((p) => p.isBot)) {
        if (bot.roundsWon.includes(latest.currentRound)) continue;
        if (checkRoundWin(bot.grid, latest.markedNumbers, latest.currentRound)) {
          latest.claimBingo(bot.id);
          break; // round state may have advanced; the next tick picks up from there
        }
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);
}
