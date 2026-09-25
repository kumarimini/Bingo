import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineSetupScreen() {
  const router = useRouter();
  const [names, setNames] = useState(['Player 1', 'Player 2']);
  const setup = useOfflineStore((s) => s.setup);

  const updateName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const addPlayer = () => {
    if (names.length >= 4) return;
    setNames((prev) => [...prev, `Player ${prev.length + 1}`]);
  };

  const removePlayer = (i: number) => {
    if (names.length <= 2) return;
    setNames((prev) => prev.filter((_, idx) => idx !== i));
  };

  const start = () => {
    setup(names.map((n) => n.trim() || 'Player'));
    router.push('/offline/card-creation');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Pass & Play</Text>
      <Text style={styles.subtitle}>Each player creates a card on this device, then passes it along.</Text>

      <ScrollView style={{ marginTop: spacing(3) }}>
        {names.map((name, i) => (
          <View key={i} style={styles.row}>
            <TextInput
              value={name}
              onChangeText={(v) => updateName(i, v)}
              style={styles.input}
              placeholder={`Player ${i + 1}`}
              placeholderTextColor={colors.textMuted}
            />
            {names.length > 2 && (
              <Button title="✕" variant="ghost" onPress={() => removePlayer(i)} style={styles.removeBtn} />
            )}
          </View>
        ))}
        {names.length < 4 && (
          <Button title="+ Add Player" variant="secondary" onPress={addPlayer} />
        )}
      </ScrollView>

      <Button title="Start" onPress={start} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3) },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginTop: spacing(2) },
  subtitle: { color: colors.textMuted, marginTop: spacing(1), fontSize: font.body },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.5),
    color: colors.text,
    fontSize: font.body,
  },
  removeBtn: { marginLeft: spacing(1), paddingHorizontal: spacing(1.5) },
});
