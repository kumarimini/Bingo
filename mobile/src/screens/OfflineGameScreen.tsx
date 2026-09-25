import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import BingoGrid from '../components/BingoGrid';
import BingoLettersHeader from '../components/BingoLettersHeader';
import { useOfflineStore } from '../store/offlineStore';
import { useBotAutoplay } from '../game/useBotAutoplay';
import { checkRoundWin, countCompletedLines } from '../game/logic';
import { playTapSound, playWinSound } from '../game/sounds';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineGameScreen() {
  const router = useRouter();
  useBotAutoplay();

  const { players, markedNumbers, currentRound, winners } = useOfflineStore();
  const callNumber = useOfflineStore((s) => s.callNumber);
  const markNumber = useOfflineStore((s) => s.markNumber);
  const claimBingo = useOfflineStore((s) => s.claimBingo);

  const human = players.find((p) => !p.isBot);

  const [resultMsg, setResultMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const seenWinnersRef = useRef(0);

  // Picks up wins from anyone — the human touching the winning number or a bot auto-claiming.
  useEffect(() => {
    if (winners.length > seenWinnersRef.current) {
      const latest = winners[winners.length - 1];
      seenWinnersRef.current = winners.length;
      setResultMsg({ ok: true, text: `${latest.playerName} completed ROUND ${latest.round}.` });
      playWinSound();
    }
  }, [winners]);

  if (!human) return null;

  const crossedLetters = Math.min(5, countCompletedLines(human.grid, markedNumbers));

  const handleCellPress = (row: number, col: number) => {
    const num = human.grid[row][col];
    if (num === null) return;
    if (markedNumbers.includes(num)) return;
    callNumber(num);
    markNumber(num);
    playTapSound();

    const latest = useOfflineStore.getState();
    const me = latest.players.find((p) => p.id === human.id);
    if (!me || me.roundsWon.includes(latest.currentRound)) return;
    if (checkRoundWin(me.grid, latest.markedNumbers, latest.currentRound)) {
      claimBingo(me.id);
    }
  };

  const closeResult = () => {
    setResultMsg(null);
    if (useOfflineStore.getState().status === 'COMPLETED') {
      router.replace('/offline/complete');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <BingoLettersHeader crossedCount={crossedLetters} />
      <Text style={styles.roundLabel}>ROUND {currentRound}</Text>

      <BingoGrid grid={human.grid} markedNumbers={markedNumbers} onCellPress={handleCellPress} />

      <Modal visible={!!resultMsg} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{resultMsg?.ok ? '🎉 BINGO!' : 'Not Bingo'}</Text>
            <Text style={styles.resultText}>{resultMsg?.text}</Text>
            <Button title="Continue" onPress={closeResult} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2.5), paddingTop: spacing(6) },
  roundLabel: { color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing(2), letterSpacing: 1 },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
