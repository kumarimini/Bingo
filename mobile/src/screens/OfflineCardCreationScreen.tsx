import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import BingoGrid from '../components/BingoGrid';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font } from '../theme/theme';

export default function OfflineCardCreationScreen() {
  const router = useRouter();
  const players = useOfflineStore((s) => s.players);
  const placeNumber = useOfflineStore((s) => s.placeNumber);
  const autoFillBotCard = useOfflineStore((s) => s.autoFillBotCard);
  const [turnIndex, setTurnIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Bots never need a "pass the device" turn — fill their card instantly and
  // skip straight to the next human, or to the game screen if none remain.
  const advance = (fromIndex: number) => {
    let idx = fromIndex;
    while (idx < players.length && players[idx].isBot) {
      autoFillBotCard(players[idx].id);
      idx++;
    }
    if (idx >= players.length) {
      router.replace('/offline/game');
    } else {
      setTurnIndex(idx);
      setRevealed(false);
    }
  };

  useEffect(() => {
    advance(0);
    // Only ever needs to run once, on mount, in case the very first player happens to be a bot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const player = players[turnIndex];
  if (!player || player.isBot) return null;

  const complete = player.nextNumber > 25;

  const handleCellPress = (row: number, col: number) => {
    placeNumber(player.id, row, col);
  };

  const goNext = () => advance(turnIndex + 1);

  if (!revealed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <BackButton />
        <View style={styles.handoff}>
          <Text style={styles.handoffTitle}>Pass the device to</Text>
          <Text style={styles.handoffName}>{player.name}</Text>
          <Button title="I'm Ready" onPress={() => setRevealed(true)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>CREATE YOUR CARD</Text>
      <Text style={styles.name}>{player.name}</Text>

      <View style={styles.nextBox}>
        <Text style={styles.nextLabel}>NEXT NUMBER</Text>
        <Text style={styles.nextNumber}>{complete ? '✓' : player.nextNumber}</Text>
      </View>

      <BingoGrid grid={player.grid} onCellPress={complete ? undefined : handleCellPress} />

      {complete && (
        <Button title={turnIndex + 1 < players.length ? 'Next Player' : 'Start Game'} onPress={goNext} style={{ marginTop: spacing(3) }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3) },
  handoff: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  handoffTitle: { color: colors.textMuted, fontSize: font.body, marginBottom: spacing(1) },
  handoffName: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(4) },
  title: { color: colors.textMuted, fontSize: font.small, letterSpacing: 1, textAlign: 'center', marginTop: spacing(2) },
  name: { color: colors.text, fontSize: font.h2, fontWeight: '700', textAlign: 'center', marginBottom: spacing(2) },
  nextBox: { alignItems: 'center', marginBottom: spacing(2) },
  nextLabel: { color: colors.textMuted, fontSize: font.small, letterSpacing: 1 },
  nextNumber: { color: colors.gold, fontSize: font.h1, fontWeight: '800' },
});
