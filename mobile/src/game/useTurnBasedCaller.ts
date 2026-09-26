import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { checkRoundWin } from './logic';
import { playTapSound } from './sounds';

const TICK_MS = 1600;

/**
 * Drives Play vs Bot's calling: one random number gets called (and marked
 * globally, since every card contains all 25 numbers) per tick, with whose
 * "turn" it is alternating each call. After every call, checks both players
 * for a completed round and auto-claims for whichever one qualifies.
 * A no-op once the game isn't actively in a round (card creation, complete).
 */
export function useTurnBasedCaller() {
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useOfflineStore.getState();
      if (state.status !== 'PLAYING') return;

      state.autoCallNext();
      playTapSound();

      // Collect every player who qualifies this tick (full house is always
      // simultaneous for both players) before advancing the round once.
      const latest = useOfflineStore.getState();
      let anyWinner = false;
      for (const player of latest.players) {
        if (player.roundsWon.includes(latest.currentRound)) continue;
        if (checkRoundWin(player.grid, latest.markedNumbers, latest.currentRound)) {
          latest.claimBingo(player.id);
          anyWinner = true;
        }
      }
      if (anyWinner) {
        useOfflineStore.getState().advanceRound();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);
}
