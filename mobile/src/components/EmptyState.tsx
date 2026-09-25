import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from './BackButton';
import { colors, spacing, font } from '../theme/theme';

interface Props {
  message: string;
}

// Shown instead of a blank screen when a screen is reached without the game
// state it needs (e.g. a cold start landing here, or state cleared by a
// "Home" reset elsewhere) — always leaves a way back via BackButton.
export default function EmptyState({ message }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.message}>{message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'center' },
  message: { color: colors.textMuted, textAlign: 'center', fontSize: font.body },
});
