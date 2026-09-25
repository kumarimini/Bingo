import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineCompleteScreen() {
  const router = useRouter();
  const winners = useOfflineStore((s) => s.winners);
  const reset = useOfflineStore((s) => s.reset);

  const playAgain = () => {
    reset();
    router.push('/offline/setup');
  };

  const goHome = () => {
    reset();
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🏁 GAME COMPLETE</Text>

      <View style={styles.results}>
        {[1, 2, 3].map((round) => {
          const winner = winners.find((w) => w.round === round);
          return (
            <View key={round} style={styles.row}>
              <Text style={styles.roundText}>ROUND {round}</Text>
              <Text style={styles.winnerText}>{winner?.playerName ?? '—'}</Text>
            </View>
          );
        })}
      </View>

      <Button title="Play Again" onPress={playAgain} />
      <View style={{ height: spacing(1.5) }} />
      <Button title="Home" variant="ghost" onPress={goHome} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'center' },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing(4) },
  results: { marginBottom: spacing(5) },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing(2),
    borderRadius: radius.md,
    marginBottom: spacing(1.5),
  },
  roundText: { color: colors.textMuted, fontWeight: '700' },
  winnerText: { color: colors.gold, fontWeight: '700' },
});
