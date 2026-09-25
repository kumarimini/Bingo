import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BingoGrid from '../components/BingoGrid';
import NumberCallPad from '../components/NumberCallPad';
import { useOnlineStore } from '../store/onlineStore';
import { roundLabel } from '../game/logic';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineGameScreen() {
  const router = useRouter();
  const room = useOnlineStore((s) => s.room);
  const playerId = useOnlineStore((s) => s.playerId);
  const lastCall = useOnlineStore((s) => s.lastCall);
  const bingoResult = useOnlineStore((s) => s.bingoResult);
  const gameEndWinners = useOnlineStore((s) => s.gameEndWinners);
  const callNumber = useOnlineStore((s) => s.callNumber);
  const markNumber = useOnlineStore((s) => s.markNumber);
  const claimBingo = useOnlineStore((s) => s.claimBingo);
  const clearBingoResult = useOnlineStore((s) => s.clearBingoResult);

  const [padOpen, setPadOpen] = useState(false);

  useEffect(() => {
    if (gameEndWinners) {
      router.replace('/online/complete');
    }
  }, [gameEndWinners]);

  if (!room || !playerId) return null;
  const me = room.players.find((p) => p.id === playerId);
  if (!me) return null;

  const handleCellPress = (row: number, col: number) => {
    const num = me.grid[row][col];
    if (num === null) return;
    if (!room.calledNumbers.includes(num)) return;
    if (room.markedNumbers.includes(num)) return;
    markNumber(num);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.roundLabel}>ROUND {room.currentRound} · {roundLabel(room.currentRound)}</Text>

      <View style={styles.playersRow}>
        {room.players.map((p) => (
          <Text key={p.id} style={styles.playerChip}>
            {p.name}{p.roundsWon.length ? ` 🏆${p.roundsWon.length}` : ''}
          </Text>
        ))}
      </View>

      <BingoGrid grid={me.grid} markedNumbers={room.markedNumbers} onCellPress={handleCellPress} />

      <View style={styles.lastCalled}>
        <Text style={styles.lastCalledLabel}>Last Called</Text>
        <Text style={styles.lastCalledNumber}>{lastCall?.number ?? '–'}</Text>
        {lastCall && <Text style={styles.calledBy}>by {lastCall.calledBy}</Text>}
      </View>

      <View style={styles.actions}>
        <Button title="Call Number" onPress={() => setPadOpen(true)} style={{ flex: 1 }} />
        <View style={{ width: spacing(1.5) }} />
        <Button title="Bingo" variant="danger" onPress={claimBingo} style={{ flex: 1 }} />
      </View>

      <NumberCallPad
        visible={padOpen}
        calledNumbers={room.calledNumbers}
        onSelect={(n) => {
          callNumber(n);
          setPadOpen(false);
        }}
        onClose={() => setPadOpen(false)}
      />

      <Modal visible={!!bingoResult} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{bingoResult?.ok ? '🎉 BINGO!' : 'Not Bingo'}</Text>
            <Text style={styles.resultText}>{bingoResult?.message}</Text>
            <Button title="Continue" onPress={clearBingoResult} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2.5) },
  roundLabel: { color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing(1), letterSpacing: 1 },
  playersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing(1.5) },
  playerChip: { color: colors.textMuted, marginHorizontal: spacing(1), fontSize: font.small },
  lastCalled: { alignItems: 'center', marginVertical: spacing(2) },
  lastCalledLabel: { color: colors.textMuted, fontSize: font.small },
  lastCalledNumber: { color: colors.text, fontSize: font.h1, fontWeight: '800' },
  calledBy: { color: colors.textMuted, fontSize: font.small },
  actions: { flexDirection: 'row' },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
