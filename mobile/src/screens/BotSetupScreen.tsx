import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

const MAX_BOTS = 3;

export default function BotSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [botCount, setBotCount] = useState(1);
  const setup = useOfflineStore((s) => s.setup);

  const start = () => {
    const human = { name: name.trim() || 'You', isBot: false };
    const bots = Array.from({ length: botCount }, (_, i) => ({ name: `Bot ${i + 1}`, isBot: true }));
    setup('bot', '', [human, ...bots]);
    router.push('/offline/card-creation');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Play vs Bot</Text>
      <Text style={styles.subtitle}>Bots build their cards instantly and play automatically.</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />

      <Text style={styles.stepperLabel}>Number of bots</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => setBotCount((n) => Math.max(1, n - 1))}
          style={styles.stepperBtn}
          disabled={botCount <= 1}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{botCount}</Text>
        <Pressable
          onPress={() => setBotCount((n) => Math.min(MAX_BOTS, n + 1))}
          style={styles.stepperBtn}
          disabled={botCount >= MAX_BOTS}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>

      <Button title="Start" onPress={start} style={{ marginTop: spacing(3) }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'center' },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(1), textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing(3), fontSize: font.body },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.75),
    color: colors.text,
    fontSize: font.body,
    marginBottom: spacing(3),
  },
  stepperLabel: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing(1) },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { color: colors.text, fontSize: font.h2, fontWeight: '700' },
  stepperValue: { color: colors.gold, fontSize: font.h1, fontWeight: '800', width: 72, textAlign: 'center' },
});
