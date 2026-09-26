import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { colors, spacing, font, radius } from '../theme/theme';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const entries = useLeaderboardStore((s) => s.entries);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Leaderboard</Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No scores yet — play a game to get on the board.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingBottom: spacing(3) }}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{MEDALS[index] ?? `#${index + 1}`}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.mode}>{item.mode}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing(3) },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(4), fontSize: font.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.75),
    marginBottom: spacing(1),
  },
  rank: { width: 40, fontSize: font.h3, textAlign: 'center' },
  info: { flex: 1, marginLeft: spacing(1) },
  name: { color: colors.text, fontWeight: '700', fontSize: font.body },
  mode: { color: colors.textMuted, fontSize: font.small },
  score: { color: colors.gold, fontWeight: '800', fontSize: font.h3 },
});
