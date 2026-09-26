import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import EmptyState from '../components/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnlineStore } from '../store/onlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const room = useOnlineStore((s) => s.room);
  const playerId = useOnlineStore((s) => s.playerId);
  const startGame = useOnlineStore((s) => s.startGame);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (room && room.status === 'PLAYING') {
      router.replace('/online/game');
    }
  }, [room?.status]);

  if (!room) {
    return <EmptyState message="No active room. Go back and create or join one." />;
  }

  const isHost = room.hostId === playerId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = connectedCount >= 2;

  const handleStart = async () => {
    setError(null);
    setStarting(true);
    const res = await startGame();
    setStarting(false);
    if (!res.ok) setError(res.error ?? 'Could not start the game');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.label}>ROOM CODE</Text>
      <Text style={styles.code}>{room.code}</Text>

      <Text style={styles.playersLabel}>
        Players ({room.players.length}/{room.maxPlayers}) · {room.totalRounds} Rounds
      </Text>
      <FlatList
        data={room.players}
        keyExtractor={(p) => p.id}
        style={{ marginBottom: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>
              {item.name}
              {item.id === playerId ? ' (you)' : ''}
              {item.id === room.hostId ? ' 👑' : ''}
            </Text>
            <Text style={item.connected ? styles.ready : styles.disconnected}>
              {item.connected ? 'Ready' : 'Disconnected'}
            </Text>
          </View>
        )}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {isHost ? (
        <Button
          title={starting ? 'Starting…' : canStart ? 'Start Game' : 'Waiting for a player to join…'}
          disabled={!canStart || starting}
          onPress={handleStart}
        />
      ) : (
        <Text style={styles.waiting}>Waiting for the host to start the game…</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  label: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(2), letterSpacing: 1 },
  code: { color: colors.gold, fontSize: 48, fontWeight: '800', textAlign: 'center', marginBottom: spacing(3), letterSpacing: 4 },
  playersLabel: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing(1.5), textAlign: 'center' },
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
  disconnected: { color: colors.danger, fontWeight: '700' },
  waiting: { color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing(1.5) },
});
