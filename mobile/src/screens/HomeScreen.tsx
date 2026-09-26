import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { useSettingsStore } from '../store/settingsStore';
import { COLUMN_LETTERS } from '../game/types';
import { colors, columnColors, spacing, font } from '../theme/theme';

export default function HomeScreen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          {COLUMN_LETTERS.map((letter) => (
            <Text key={letter} style={[styles.logoLetter, { color: columnColors[letter] }]}>
              {letter}
            </Text>
          ))}
        </View>
        <Text style={styles.tagline}>Build your card, call the numbers, and race to complete the pattern.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Offline" onPress={() => router.push('/offline')} />
        <View style={{ height: spacing(1.5) }} />
        <Button title="Online" variant="secondary" onPress={() => router.push('/online')} />

        <View style={styles.soundRow}>
          <Pressable
            style={[styles.soundBtn, soundEnabled && styles.soundBtnActive]}
            onPress={() => setSoundEnabled(true)}
          >
            <Text style={styles.soundText}>🔊 Sound On</Text>
          </Pressable>
          <Pressable
            style={[styles.soundBtn, !soundEnabled && styles.soundBtnActive]}
            onPress={() => setSoundEnabled(false)}
          >
            <Text style={styles.soundText}>🔇 Sound Off</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>Classic 75-ball Bingo</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'space-between' },
  header: { marginTop: spacing(8), alignItems: 'center' },
  logoRow: { flexDirection: 'row' },
  logoLetter: { fontSize: 44, fontWeight: '900', marginHorizontal: 2 },
  tagline: { color: colors.textMuted, marginTop: spacing(2), textAlign: 'center', fontSize: font.body },
  actions: { marginBottom: spacing(4) },
  soundRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing(3) },
  soundBtn: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.75),
    borderRadius: 999,
    backgroundColor: colors.surface,
    marginHorizontal: spacing(0.75),
  },
  soundBtnActive: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.primary },
  soundText: { color: colors.text, fontSize: font.small, fontWeight: '600' },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: font.small, marginBottom: spacing(2) },
});
