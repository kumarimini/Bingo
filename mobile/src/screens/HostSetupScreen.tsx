import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { colors, spacing, font, radius } from '../theme/theme';

export default function HostSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  const handleHost = () => {
    router.push({ pathname: '/host/lobby', params: { hostName: name.trim() || 'Host' } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Host Game</Text>
      <Text style={styles.subtitle}>
        Everyone plays on this device, passed around — a room code is generated for your game just like the online
        flow.
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />
      <Button title="Host Game" onPress={handleHost} />
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
    marginBottom: spacing(2),
  },
});
