import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOnlineStore } from '../store/onlineStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineCompleteScreen() {
  const router = useRouter();
  const gameEndWinners = useOnlineStore((s) => s.gameEndWinners);
  const gameEndPlayers = useOnlineStore((s) => s.gameEndPlayers);
  const room = useOnlineStore((s) => s.room);
  const reset = useOnlineStore((s) => s.reset);
  const addEntry = useLeaderboardStore((s) => s.addEntry);
  const winners = gameEndWinners ?? room?.winners ?? [];
  const players = gameEndPlayers ?? room?.players ?? [];
  const submitted = useRef(false);

  const standings = [...players].sort((a, b) => b.totalScore - a.totalScore);

  useEffect(() => {
    if (submitted.current || players.length === 0) return;
    submitted.current = true;
    for (const p of players) {
      if (p.totalScore > 0) addEntry({ name: p.name, score: p.totalScore, mode: 'Online' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]);

  const goHome = () => {
    reset();
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>🏁 Game Complete</Text>

      <FlatList
        data={standings}
        keyExtractor={(p) => p.id}
        style={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.roundsWon}>Won {item.roundsWon.length} round{item.roundsWon.length === 1 ? '' : 's'}</Text>
            </View>
            <Text style={styles.score}>{item.totalScore}</Text>
          </View>
        )}
      />

      <Text style={styles.summary}>
        {winners.length} round{winners.length === 1 ? '' : 's'} played
      </Text>

      <Button title="Home" onPress={goHome} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing(3) },
  list: { marginBottom: spacing(2) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing(2),
    borderRadius: radius.md,
    marginBottom: spacing(1.5),
  },
  rank: { color: colors.textMuted, fontWeight: '700', width: 36 },
  name: { color: colors.text, fontWeight: '700' },
  roundsWon: { color: colors.textMuted, fontSize: font.small },
  score: { color: colors.gold, fontWeight: '800', fontSize: font.h3 },
  summary: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing(3) },
});
