import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLUMN_LETTERS } from '../game/types';
import { useSettingsStore } from '../store/settingsStore';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { colors, columnColors, spacing, font } from '../theme/theme';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    Promise.all([useSettingsStore.getState().load(), useLeaderboardStore.getState().load()]).finally(() => {
      const timer = setTimeout(() => router.replace('/home'), 900);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoRow}>
        {COLUMN_LETTERS.map((letter) => (
          <Text key={letter} style={[styles.logoLetter, { color: columnColors[letter] }]}>
            {letter}
          </Text>
        ))}
      </View>
      <Text style={styles.tagline}>Play · Connect · Win</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row' },
  logoLetter: { fontSize: 56, fontWeight: '900', marginHorizontal: 2 },
  tagline: { color: colors.textMuted, marginTop: spacing(2), fontSize: font.body, letterSpacing: 1 },
});
