import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, font } from '../theme/theme';

// Renders nothing when there's nowhere to go back to (i.e. on the Home screen).
// Absolutely positioned so it always sits in the same top-left spot regardless
// of how the rest of the screen is laid out (e.g. centered content columns).
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
    position: 'absolute',
    top: spacing(1),
    left: spacing(1.5),
    zIndex: 10,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.5),
  },
  text: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
});
