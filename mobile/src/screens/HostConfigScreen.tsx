import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { useOnlineStore } from '../store/onlineStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors, spacing, font, radius } from '../theme/theme';
import { MIN_PLAYERS, MAX_PLAYERS_LIMIT, MIN_ROUNDS, MAX_ROUNDS_LIMIT } from '../game/config';

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.stepperGroup}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          disabled={value <= min}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          disabled={value >= max}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HostConfigScreen() {
  const router = useRouter();
  const name = useSettingsStore((s) => s.name);
  const createRoom = useOnlineStore((s) => s.createRoom);
  const [maxPlayers, setMaxPlayers] = useState(MIN_PLAYERS);
  const [totalRounds, setTotalRounds] = useState(MIN_ROUNDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHost = async () => {
    setError(null);
    setLoading(true);
    const res = await createRoom(name, maxPlayers, totalRounds);
    setLoading(false);
    if (res.ok) {
      router.push('/online/lobby');
    } else {
      setError(res.error ?? 'Could not create room');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <BackButton />
      <Text style={styles.title}>Host A Game</Text>

      <Stepper label="Max Players" value={maxPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS_LIMIT} onChange={setMaxPlayers} />
      <Stepper label="Number of Rounds" value={totalRounds} min={MIN_ROUNDS} max={MAX_ROUNDS_LIMIT} onChange={setTotalRounds} />

      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Creating…' : 'Host'} onPress={handleHost} disabled={loading} style={{ marginTop: spacing(3) }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), paddingTop: spacing(6) },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(4), textAlign: 'center' },
  stepperGroup: { alignItems: 'center', marginBottom: spacing(3) },
  stepperLabel: { color: colors.textMuted, marginBottom: spacing(1), fontSize: font.body },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: { opacity: 0.4 },
  stepperBtnText: { color: colors.text, fontSize: font.h2, fontWeight: '700' },
  stepperValue: { color: colors.gold, fontSize: font.h1, fontWeight: '800', width: 80, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center', marginTop: spacing(1) },
});
