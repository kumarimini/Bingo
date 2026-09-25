import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOfflineStore } from '../store/offlineStore';
import { generateRoomCode } from '../game/roomCode';
import { colors, spacing, font, radius } from '../theme/theme';

export default function HostLobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hostName?: string }>();
  const hostName = params.hostName || 'Host';

  const roomCode = useMemo(() => generateRoomCode(), []);
  const [players, setPlayers] = useState<string[]>([hostName]);
  const [newName, setNewName] = useState('');
  const setup = useOfflineStore((s) => s.setup);

  const addPlayer = () => {
    if (players.length >= 6) return;
    const trimmed = newName.trim();
    setPlayers((prev) => [...prev, trimmed || `Player ${prev.length + 1}`]);
    setNewName('');
  };

  const removePlayer = (i: number) => {
    if (i === 0 || players.length <= 2) return; // keep the host, keep at least 2 players
    setPlayers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const startGame = () => {
    setup(
      'host',
      roomCode,
      players.map((name) => ({ name, isBot: false }))
    );
    router.push('/offline/card-creation');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.label}>ROOM CODE</Text>
      <Text style={styles.code}>{roomCode}</Text>

      <Text style={styles.playersLabel}>Players ({players.length})</Text>
      <ScrollView style={{ marginBottom: spacing(2) }}>
        {players.map((name, i) => (
          <View key={i} style={styles.playerRow}>
            <Text style={styles.playerName}>
              {name}
              {i === 0 ? ' (host)' : ''}
            </Text>
            {i > 0 && players.length > 2 && (
              <Button title="✕" variant="ghost" onPress={() => removePlayer(i)} style={styles.removeBtn} />
            )}
          </View>
        ))}
      </ScrollView>

      {players.length < 6 && (
        <View style={styles.addRow}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Add a player's name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={addPlayer}
          />
          <Button title="Add" variant="secondary" onPress={addPlayer} style={styles.addBtn} />
        </View>
      )}

      <Button title="Start Game" onPress={startGame} disabled={players.length < 2} />
      {players.length < 2 && <Text style={styles.hint}>Add at least one more player to start.</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3) },
  label: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(2), letterSpacing: 1 },
  code: { color: colors.gold, fontSize: 44, fontWeight: '800', textAlign: 'center', marginBottom: spacing(3), letterSpacing: 4 },
  playersLabel: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing(1.5) },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing(1.75),
    borderRadius: radius.md,
    marginBottom: spacing(1),
  },
  playerName: { color: colors.text, fontWeight: '600' },
  removeBtn: { paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.5) },
  addRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(2) },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.5),
    color: colors.text,
    fontSize: font.body,
    marginRight: spacing(1),
  },
  addBtn: { paddingHorizontal: spacing(2.5) },
  hint: { color: colors.textMuted, textAlign: 'center', marginTop: spacing(1), fontSize: font.small },
});
