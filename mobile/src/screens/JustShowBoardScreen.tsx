import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import BingoGrid from '../components/BingoGrid';
import { useOfflineStore } from '../store/offlineStore';
import { useSettingsStore } from '../store/settingsStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { computeScore } from '../game/logic';
import { playTapSound, playWinSound } from '../game/sounds';
import { colors, spacing, font, radius } from '../theme/theme';

export default function JustShowBoardScreen() {
  const router = useRouter();
  const name = useSettingsStore((s) => s.name);
  const setupBoardOnly = useOfflineStore((s) => s.setupBoardOnly);
  const fillBoard = useOfflineStore((s) => s.fillBoard);
  const markCell = useOfflineStore((s) => s.markCell);
  const players = useOfflineStore((s) => s.players);
  const markedNumbers = useOfflineStore((s) => s.markedNumbers);
  const announcement = useOfflineStore((s) => s.announcement);
  const dismissAnnouncement = useOfflineStore((s) => s.dismissAnnouncement);
  const addEntry = useLeaderboardStore((s) => s.addEntry);

  useEffect(() => {
    setupBoardOnly(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (announcement) playWinSound();
  }, [announcement]);

  const player = players[0];

  if (!player) return <EmptyState message="Setting up your board…" />;

  const score = computeScore(player.grid, markedNumbers);

  const handleCellPress = (row: number, col: number) => {
    markCell(player.id, row, col);
    playTapSound();
  };

  const handleFillBoard = () => {
    if (score > 0) addEntry({ name: player.name, score, mode: 'Solo' });
    fillBoard();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Just Show Me the Board</Text>

      <BingoGrid grid={player.grid} markedNumbers={markedNumbers} onCellPress={handleCellPress} />

      <Text style={styles.score}>Score: {score}</Text>

      <View style={styles.actions}>
        <Button title="Leaderboard" variant="secondary" onPress={() => router.push('/leaderboard')} style={{ flex: 1 }} />
        <View style={{ width: spacing(1.5) }} />
        <Button title="Fill Board" onPress={handleFillBoard} style={{ flex: 1 }} />
      </View>

      <Modal visible={!!announcement} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{announcement?.kind === 'fullhouse' ? '🏆 Full House!' : '🎉 Bingo!'}</Text>
            <Text style={styles.resultText}>
              {announcement?.kind === 'fullhouse'
                ? "You've marked the whole card!"
                : "You've completed a line!"}
            </Text>
            <Button title="Keep Playing" onPress={dismissAnnouncement} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2.5), paddingTop: spacing(6) },
  title: {
    color: colors.textMuted,
    fontSize: font.small,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing(2),
    fontWeight: '700',
  },
  score: { color: colors.gold, fontSize: font.h3, fontWeight: '800', textAlign: 'center', marginVertical: spacing(2) },
  actions: { flexDirection: 'row' },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
