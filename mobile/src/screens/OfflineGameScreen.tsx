import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import BingoGrid from '../components/BingoGrid';
import NumberCallPad from '../components/NumberCallPad';
import { useOfflineStore } from '../store/offlineStore';
import { useBotAutoplay } from '../game/useBotAutoplay';
import { roundLabel } from '../game/logic';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineGameScreen() {
  const router = useRouter();
  useBotAutoplay();

  const { players, calledNumbers, markedNumbers, currentRound, status, winners } = useOfflineStore();
  const callNumber = useOfflineStore((s) => s.callNumber);
  const markNumber = useOfflineStore((s) => s.markNumber);
  const claimBingo = useOfflineStore((s) => s.claimBingo);

  const [activeIdx, setActiveIdx] = useState(0);
  const [padOpen, setPadOpen] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const seenWinnersRef = useRef(0);

  // Picks up wins from anyone — a human tapping Bingo or a bot auto-claiming.
  useEffect(() => {
    if (winners.length > seenWinnersRef.current) {
      const latest = winners[winners.length - 1];
      seenWinnersRef.current = winners.length;
      setResultMsg({ ok: true, text: `${latest.playerName} completed ROUND ${latest.round}.` });
    }
  }, [winners]);

  const activePlayer = players[activeIdx];
  const lastCalled = calledNumbers[calledNumbers.length - 1];

  if (!activePlayer) return null;

  const handleCellPress = (row: number, col: number) => {
    const num = activePlayer.grid[row][col];
    if (num === null) return;
    if (!calledNumbers.includes(num)) return;
    if (markedNumbers.includes(num)) return;
    markNumber(num);
  };

  const handleBingo = () => {
    const res = claimBingo(activePlayer.id);
    if (!res.ok) {
      setResultMsg({ ok: false, text: res.message });
    }
    // A successful claim is picked up by the winners-watching effect above.
  };

  const closeResult = () => {
    setResultMsg(null);
    if (useOfflineStore.getState().status === 'COMPLETED') {
      router.replace('/offline/complete');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.roundLabel}>ROUND {currentRound} · {roundLabel(currentRound)}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {players.map((p, i) => (
          <Pressable key={p.id} onPress={() => setActiveIdx(i)} style={[styles.tab, i === activeIdx && styles.tabActive]}>
            <Text style={[styles.tabText, i === activeIdx && styles.tabTextActive]}>
              {p.isBot ? '🤖 ' : ''}
              {p.name}
            </Text>
            {p.roundsWon.length > 0 && <Text style={styles.tabWins}> 🏆{p.roundsWon.length}</Text>}
          </Pressable>
        ))}
      </ScrollView>

      <BingoGrid
        grid={activePlayer.grid}
        markedNumbers={markedNumbers}
        onCellPress={activePlayer.isBot ? undefined : handleCellPress}
      />

      <View style={styles.lastCalled}>
        <Text style={styles.lastCalledLabel}>Last Called</Text>
        <Text style={styles.lastCalledNumber}>{lastCalled ?? '–'}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Call Number" onPress={() => setPadOpen(true)} style={{ flex: 1 }} />
        <View style={{ width: spacing(1.5) }} />
        <Button
          title="Bingo"
          variant="danger"
          onPress={handleBingo}
          disabled={activePlayer.isBot}
          style={{ flex: 1 }}
        />
      </View>

      <NumberCallPad
        visible={padOpen}
        calledNumbers={calledNumbers}
        onSelect={(n) => {
          callNumber(n);
          setPadOpen(false);
        }}
        onClose={() => setPadOpen(false)}
      />

      <Modal visible={!!resultMsg} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{resultMsg?.ok ? '🎉 BINGO!' : 'Not Bingo'}</Text>
            <Text style={styles.resultText}>{resultMsg?.text}</Text>
            <Button title="Continue" onPress={closeResult} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2.5) },
  roundLabel: { color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing(1.5), letterSpacing: 1 },
  tabs: { marginBottom: spacing(1.5), flexGrow: 0 },
  tab: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    marginRight: spacing(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  tabWins: { color: colors.gold, fontSize: font.small },
  lastCalled: { alignItems: 'center', marginVertical: spacing(2) },
  lastCalledLabel: { color: colors.textMuted, fontSize: font.small },
  lastCalledNumber: { color: colors.text, fontSize: font.h1, fontWeight: '800' },
  actions: { flexDirection: 'row' },
  resultBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: spacing(3) },
  resultCard: { backgroundColor: colors.bgAlt, borderRadius: radius.lg, padding: spacing(3), width: '100%', alignItems: 'center' },
  resultTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing(1) },
  resultText: { color: colors.textMuted, marginBottom: spacing(2.5), textAlign: 'center' },
});
