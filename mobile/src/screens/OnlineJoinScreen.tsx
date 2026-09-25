import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { useOnlineStore } from '../store/onlineStore';
import { colors, spacing, font, radius } from '../theme/theme';

export default function OnlineJoinScreen() {
  const router = useRouter();
  const connect = useOnlineStore((s) => s.connect);
  const joinRoom = useOnlineStore((s) => s.joinRoom);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connect();
  }, []);

  const handleJoin = async () => {
    setError(null);
    if (!code.trim()) {
      setError('Enter a room code');
      return;
    }
    setLoading(true);
    const res = await joinRoom(code.trim(), name.trim() || 'Player');
    setLoading(false);
    if (res.ok) {
      router.push('/online/lobby');
    } else {
      setError(res.error ?? 'Could not join room');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Join Game</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Room Code"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={loading ? 'Joining…' : 'Join'} onPress={handleJoin} disabled={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(3), justifyContent: 'center' },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '800', marginBottom: spacing(3), textAlign: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1.75),
    color: colors.text,
    fontSize: font.body,
    marginBottom: spacing(2),
  },
  error: { color: colors.danger, marginBottom: spacing(1.5), textAlign: 'center' },
});
