import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BingoGrid from '../components/BingoGrid';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font } from '../theme/theme';

export default function OfflineCardCreationScreen() {
  const router = useRouter();
  const players = useOfflineStore((s) => s.players);
  const placeNumber = useOfflineStore((s) => s.placeNumber);
  const [turnIndex, setTurnIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const player = players[turnIndex];
  if (!player) return null;

  const complete = player.nextNumber > 25;

  const handleCellPress = (row: number, col: number) => {
    placeNumber(player.id, row, col);
  };

  const goNext = () => {
    if (turnIndex + 1 < players.length) {
      setTurnIndex(turnIndex + 1);
      setRevealed(false);
    } else {
      router.replace('/offline/game');
    }
  };

  if (!revealed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.handoff}>
          <Text style={styles.handoffTitle}>Pass the device to</Text>
          <Text style={styles.handoffName}>{player.name}</Text>
          <Button title="I'm Ready" onPress={() => setRevealed(true)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
