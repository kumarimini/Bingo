import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { colors, spacing, font } from '../theme/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎱 BINGO</Text>
        <Text style={styles.tagline}>You choose the position. Call your own numbers.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Play Online" onPress={() => router.push('/online/create')} />
        <View style={{ height: spacing(1.5) }} />
        <Button title="Join Room" variant="secondary" onPress={() => router.push('/online/join')} />
        <View style={{ height: spacing(1.5) }} />
        <Button title="Play Offline (Pass & Play)" variant="ghost" onPress={() => router.push('/offline/setup')} />
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
