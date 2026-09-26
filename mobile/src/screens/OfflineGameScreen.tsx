import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import BingoGrid from '../components/BingoGrid';
import BingoLettersHeader from '../components/BingoLettersHeader';
import { useOfflineStore } from '../store/offlineStore';
import { useTurnBasedCaller } from '../game/useTurnBasedCaller';
import { countCompletedLines } from '../game/logic';
import { playTapSound, playWinSound } from '../game/sounds';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineGameScreen() {
  const router = useRouter();
  useTurnBasedCaller();

  const { players, markedNumbers, currentRound, turn, status, winners } = useOfflineStore();

  const human = players.find((p) => !p.isBot);
  const bot = players.find((p) => p.isBot);

  const [resultMsg, setResultMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Initialized from the store's current winners count (not 0) — this screen
  // remounts fresh for every round (card creation happens again in between),
  // and without this a stale ref would immediately re-show the *previous*
  // round's win the moment round 2 or 3 starts.
  const seenWinnersRef = useRef(winners.length);

  useEffect(() => {
    if (winners.length > seenWinnersRef.current) {
      const latest = winners[winners.length - 1];
      seenWinnersRef.current = winners.length;
      setResultMsg({ ok: true, text: `${latest.playerName} won Round ${latest.round}!` });
      playWinSound();
    }
  }, [winners]);

  if (!human) return <EmptyState message="No game in progress. Go back and start one from Home." />;

  const crossedLetters = Math.min(5, countCompletedLines(human.grid, markedNumbers));
  const isMyTurn = status === 'PLAYING' && turn === 'human';

  const handleCallNumber = () => {
    if (!isMyTurn) return;
    useOfflineStore.getState().performTurn();
    playTapSound();
  };

  const closeResult = () => {
    setResultMsg(null);
    const latestStatus = useOfflineStore.getState().status;
    if (latestStatus === 'COMPLETED') {
      router.replace('/offline/complete');
    } else if (latestStatus === 'CARD_CREATION') {
      router.replace('/offline/card-creation');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <BingoLettersHeader crossedCount={crossedLetters} />
      <Text style={styles.roundLabel}>ROUND {currentRound}</Text>

      <BingoGrid grid={human.grid} markedNumbers={markedNumbers} />

      <View style={styles.turnArea}>
        <Text style={styles.turnLabel}>{isMyTurn ? 'Your Turn' : `${bot?.name ?? 'Bot'} is calling…`}</Text>
        <Button
          title="Call Number"
          onPress={handleCallNumber}
          disabled={!isMyTurn}
          style={{ marginTop: spacing(1.5) }}
        />
      </View>

      <Modal visible={!!resultMsg} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎉 Bingo!</Text>
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
  turnArea: { alignItems: 'center', marginTop: spacing(3) },
  turnLabel: { color: colors.text, fontWeight: '700', fontSize: font.h3 },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
