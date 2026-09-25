import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { checkRoundWin } from './logic';

const TICK_MS = 1500;
const BOT_CALL_CHANCE = 0.5;

/**
 * Drives every bot player in the local game store: instantly marks called
 * numbers that appear on a bot's card (a bot never "forgets" to mark),
 * occasionally calls a fresh number to keep the game moving, and claims
 * Bingo the moment a bot's card satisfies the current round's pattern.
 * A no-op once there are no bot players (e.g. Host Game mode).
 */
export function useBotAutoplay() {
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useOfflineStore.getState();
      if (state.status !== 'PLAYING') return;
      const bots = state.players.filter((p) => p.isBot);
      if (bots.length === 0) return;

      for (const bot of bots) {
        for (const row of bot.grid) {
          for (const num of row) {
            if (num !== null && state.calledNumbers.includes(num) && !state.markedNumbers.includes(num)) {
              state.markNumber(num);
            }
          }
        }
      }

      const afterMarks = useOfflineStore.getState();
      const uncalled: number[] = [];
      for (let n = 1; n <= 25; n++) {
        if (!afterMarks.calledNumbers.includes(n)) uncalled.push(n);
      }
      if (uncalled.length > 0 && Math.random() < BOT_CALL_CHANCE) {
        afterMarks.callNumber(uncalled[Math.floor(Math.random() * uncalled.length)]);
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
