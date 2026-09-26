import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import BingoGrid from '../components/BingoGrid';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font } from '../theme/theme';

export default function OfflineCardCreationScreen() {
  const router = useRouter();
  const players = useOfflineStore((s) => s.players);
  const currentRound = useOfflineStore((s) => s.currentRound);
  const placeNumber = useOfflineStore((s) => s.placeNumber);
  const autoFillBotCard = useOfflineStore((s) => s.autoFillBotCard);

  // Bots don't need a turn — fill their cards instantly, behind the scenes.
  useEffect(() => {
    for (const p of players) {
      if (p.isBot && p.nextNumber === 1) autoFillBotCard(p.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const human = players.find((p) => !p.isBot);

  // The game starts automatically the moment the 25th number is placed.
  useEffect(() => {
    if (human && human.nextNumber > 25) {
      router.replace('/offline/game');
    }
  }, [human?.nextNumber]);

  if (!human) return <EmptyState message="No game in progress. Go back and start one from Home." />;

  const handleCellPress = (row: number, col: number) => {
    placeNumber(human.id, row, col);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.round}>ROUND {currentRound}</Text>
      <Text style={styles.title}>CREATE YOUR CARD</Text>
      <BingoGrid grid={human.grid} onCellPress={handleCellPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  round: { color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing(0.5), letterSpacing: 1 },
  title: {
    color: colors.textMuted,
    fontSize: font.small,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing(2),
    fontWeight: '700',
  },
});
