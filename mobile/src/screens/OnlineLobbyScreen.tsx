import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOnlineStore } from '../store/onlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const room = useOnlineStore((s) => s.room);
  const playerId = useOnlineStore((s) => s.playerId);

  useEffect(() => {
    if (room && room.status !== 'WAITING') {
      router.replace('/online/card-creation');
    }
  }, [room?.status]);

  if (!room) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <BackButton />
        <Text style={styles.label}>No active room. Go back and create or join one.</Text>
      </SafeAreaView>
    );
  }

  const me = room.players.find((p) => p.id === playerId);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.label}>ROOM CODE</Text>
      <Text style={styles.code}>{room.code}</Text>

      <Text style={styles.playersLabel}>Players</Text>
      <FlatList
        data={room.players}
        keyExtractor={(p) => p.id}
        style={{ marginBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{item.name}{item.id === playerId ? ' (you)' : ''}</Text>
            <Text style={item.ready ? styles.ready : styles.notReady}>
              {item.ready ? '✓ Ready' : 'Waiting'}
            </Text>
          </View>
        )}
      />

      <Button
        title={
          me?.ready
            ? 'Waiting for others…'
            : room.players.length < 2
              ? 'Waiting for a player to join…'
              : 'Create My Card'
        }
        disabled={!!me?.ready || room.players.length < 2}
        onPress={() => router.push('/online/card-creation')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  label: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(2), letterSpacing: 1 },
  code: { color: colors.gold, fontSize: 48, fontWeight: '800', textAlign: 'center', marginBottom: spacing(4) },
  playersLabel: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing(1.5) },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing(1.75),
    borderRadius: radius.md,
    marginBottom: spacing(1),
  },
  playerName: { color: colors.text, fontWeight: '600' },
  ready: { color: colors.success, fontWeight: '700' },
  notReady: { color: colors.textMuted },
});
