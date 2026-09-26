import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OfflineMenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Offline</Text>

      <Pressable style={styles.card} onPress={() => router.push('/bot/setup')}>
        <Text style={styles.emoji}>🤖</Text>
        <Text style={styles.cardTitle}>Play With Computer</Text>
        <Text style={styles.cardSubtitle}>You vs a bot, turn by turn</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/offline/board')}>
        <Text style={styles.emoji}>🎫</Text>
        <Text style={styles.cardTitle}>Just Show Me the Board</Text>
        <Text style={styles.cardSubtitle}>A personal card you mark yourself</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing(4) },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(3),
    marginBottom: spacing(2),
    alignItems: 'center',
  },
  emoji: { fontSize: 40, marginBottom: spacing(1) },
  cardTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing(0.5) },
  cardSubtitle: { color: colors.textMuted, fontSize: font.small },
});
