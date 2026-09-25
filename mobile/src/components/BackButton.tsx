import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, font } from '../theme/theme';

// Renders nothing when there's nowhere to go back to (i.e. on the Home screen).
export default function BackButton() {
  const router = useRouter();
  if (!router.canGoBack()) return null;

  return (
    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.btn}>
      <Text style={styles.text}>‹ Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.5),
    marginLeft: -spacing(1.5),
    marginBottom: spacing(1),
  },
  text: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
});
