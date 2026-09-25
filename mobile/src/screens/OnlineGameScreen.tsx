import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import BingoGrid from '../components/BingoGrid';
import BingoLettersHeader from '../components/BingoLettersHeader';
import { useOnlineStore } from '../store/onlineStore';
import { checkRoundWin, countCompletedLines } from '../game/logic';
import { playTapSound, playWinSound } from '../game/sounds';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineGameScreen() {
  const router = useRouter();
  const room = useOnlineStore((s) => s.room);
  const playerId = useOnlineStore((s) => s.playerId);
  const bingoResult = useOnlineStore((s) => s.bingoResult);
  const gameEndWinners = useOnlineStore((s) => s.gameEndWinners);
  const callNumber = useOnlineStore((s) => s.callNumber);
  const markNumber = useOnlineStore((s) => s.markNumber);
  const claimBingo = useOnlineStore((s) => s.claimBingo);
  const clearBingoResult = useOnlineStore((s) => s.clearBingoResult);

  useEffect(() => {
    if (gameEndWinners) {
      router.replace('/online/complete');
    }
  }, [gameEndWinners]);

  useEffect(() => {
    if (bingoResult?.ok) playWinSound();
  }, [bingoResult]);

  const me = room?.players.find((p) => p.id === playerId);

  // Auto-claim the instant my own card satisfies the current round's pattern.
  // claimBingo() is fire-and-forget over the network, so without this guard a
  // second NUMBER_MARKED broadcast arriving before the server's response to
  // the first claim would fire a redundant claim — which the server (reading
  // its now-advanced currentRound) evaluates against the *next* round and
  // rejects, flashing a "Not Bingo" modal right after the real win. Track the
  // round we've already attempted so each round is only ever claimed once.
  const attemptedRoundRef = useRef<number | null>(null);
  useEffect(() => {
    if (!room || !me) return;
    if (me.roundsWon.includes(room.currentRound)) return;
    if (attemptedRoundRef.current === room.currentRound) return;
    if (checkRoundWin(me.grid, room.markedNumbers, room.currentRound)) {
      attemptedRoundRef.current = room.currentRound;
      claimBingo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.markedNumbers, room?.currentRound]);

  if (!room || !playerId || !me) return <EmptyState message="No active game. Go back and create or join a room." />;

  const crossedLetters = Math.min(5, countCompletedLines(me.grid, room.markedNumbers));
  const disconnectedOpponent = room.players.find((p) => p.id !== playerId && !p.connected);

  const handleCellPress = (row: number, col: number) => {
    const num = me.grid[row][col];
    if (num === null) return;
    if (room.markedNumbers.includes(num)) return;
    callNumber(num);
    markNumber(num);
    playTapSound();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <BingoLettersHeader crossedCount={crossedLetters} />
      <Text style={styles.roundLabel}>ROUND {room.currentRound}</Text>
      {disconnectedOpponent && (
        <Text style={styles.disconnectedBanner}>⚠️ {disconnectedOpponent.name} disconnected</Text>
      )}

      <BingoGrid grid={me.grid} markedNumbers={room.markedNumbers} onCellPress={handleCellPress} />

      <Modal visible={!!bingoResult} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{bingoResult?.ok ? '🎉 BINGO!' : 'Not Bingo'}</Text>
            <Text style={styles.resultText}>{bingoResult?.message}</Text>
            <Button title="Continue" onPress={clearBingoResult} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2.5), paddingTop: spacing(6) },
  roundLabel: { color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing(2), letterSpacing: 1 },
  disconnectedBanner: { color: colors.danger, textAlign: 'center', marginBottom: spacing(1.5), fontSize: font.small },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
