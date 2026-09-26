import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import DismissKeyboardView from '../components/DismissKeyboardView';
import { useSettingsStore } from '../store/settingsStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function EditNameScreen() {
  const router = useRouter();
  const currentName = useSettingsStore((s) => s.name);
  const setName = useSettingsStore((s) => s.setName);
  const [name, setLocalName] = useState(currentName);

  const save = () => {
    setName(name);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <DismissKeyboardView style={styles.content}>
        <Text style={styles.title}>Edit Name</Text>
        <TextInput
          value={name}
          onChangeText={setLocalName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus
        />
        <Button title="Save" onPress={save} disabled={!name.trim()} />
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing(3), justifyContent: 'center' },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(3), textAlign: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.75),
    color: colors.text,
    fontSize: font.body,
    marginBottom: spacing(2),
  },
});
