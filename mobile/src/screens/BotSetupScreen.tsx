import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import DismissKeyboardView from '../components/DismissKeyboardView';
import { useOfflineStore } from '../store/offlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function BotSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const setup = useOfflineStore((s) => s.setup);

  const trimmedName = name.trim();

  const start = () => {
    if (!trimmedName) return;
    setup([
      { name: trimmedName, isBot: false },
      { name: 'Bot', isBot: true },
    ]);
    router.push('/offline/card-creation');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <DismissKeyboardView style={styles.content}>
        <Text style={styles.title}>Play vs Bot</Text>
        <Text style={styles.subtitle}>You vs one bot. The bot builds its card instantly and plays automatically.</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Button title="Start" onPress={start} disabled={!trimmedName} style={{ marginTop: spacing(1) }} />
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(3), justifyContent: 'center' },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(1), textAlign: 'center' },
  subtitle: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing(3), fontSize: font.body },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.75),
    color: colors.text,
    fontSize: font.body,
  },
});
