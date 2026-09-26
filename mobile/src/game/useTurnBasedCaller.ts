import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { playTapSound } from './sounds';

const TICK_MS = 1400;

/**
 * Drives only the bot's side of the turn: once it's the bot's turn, waits a
 * beat (so the alternation reads as a real turn, not an instant flip) and
 * then plays it. The human's turn is never touched here — it only advances
 * when the human explicitly taps "Call Number" on the game screen.
 */
export function useTurnBasedCaller() {
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useOfflineStore.getState();
      if (state.status !== 'PLAYING') return;
      if (state.turn !== 'bot') return;

      state.performTurn();
      playTapSound();
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);
}
