import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { colors, spacing, font } from '../theme/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎱 BINGO</Text>
        <Text style={styles.tagline}>Build your card, call the numbers, and race to complete the pattern.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Host Game" onPress={() => router.push('/online/create')} />
        <View style={{ height: spacing(1.5) }} />
        <Button title="Join Game" variant="secondary" onPress={() => router.push('/online/join')} />
        <View style={{ height: spacing(1.5) }} />
        <Button title="Play vs Bot" variant="secondary" onPress={() => router.push('/bot/setup')} />
      </View>

      <Text style={styles.footer}>3 Rounds · One Line → Two Lines → Full House</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'space-between' },
  header: { marginTop: spacing(8), alignItems: 'center' },
  logo: { fontSize: font.h1, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  tagline: { color: colors.textMuted, marginTop: spacing(1), textAlign: 'center', fontSize: font.body },
  actions: { marginBottom: spacing(4) },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: font.small, marginBottom: spacing(2) },
});
