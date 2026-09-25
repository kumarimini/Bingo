import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BingoGrid from '../components/BingoGrid';
import BackButton from '../components/BackButton';
import { useOnlineStore } from '../store/onlineStore';
import { colors, spacing, font } from '../theme/theme';

export default function OnlineCardCreationScreen() {
  const router = useRouter();
  const room = useOnlineStore((s) => s.room);
  const playerId = useOnlineStore((s) => s.playerId);
  const placeNumber = useOnlineStore((s) => s.placeNumber);

  useEffect(() => {
    if (room && room.status.startsWith('ROUND_')) {
      router.replace('/online/game');
    }
  }, [room?.status]);

  if (!room || !playerId) return null;
  const me = room.players.find((p) => p.id === playerId);
  if (!me) return null;

  const complete = me.nextNumber > 25;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>CREATE YOUR CARD</Text>

      <BingoGrid grid={me.grid} onCellPress={complete ? undefined : (r, c) => placeNumber(r, c)} />

      {complete && <Text style={styles.waiting}>Card locked. Waiting for other players…</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  title: {
    color: colors.textMuted,
    fontSize: font.small,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  waiting: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(3) },
});
