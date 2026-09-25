import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { colors, radius, font, spacing } from '../theme/theme';

interface Props {
  visible: boolean;
  calledNumbers: number[];
  onSelect: (n: number) => void;
  onClose: () => void;
}

export default function NumberCallPad({ visible, calledNumbers, onSelect, onClose }: Props) {
  const called = new Set(calledNumbers);
  const all = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Call a Number</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {all.map((n) => {
              const disabled = called.has(n);
              return (
                <Pressable
                  key={n}
                  disabled={disabled}
                  onPress={() => onSelect(n)}
                  style={[styles.chip, disabled && styles.chipDisabled]}
                >
                  <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgAlt,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: '70%',
  },
  title: { color: colors.text, fontSize: font.h3, fontWeight: '700', marginBottom: spacing(1.5) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) },
  chip: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  chipDisabled: { backgroundColor: colors.surface },
  chipText: { color: colors.text, fontWeight: '700', fontSize: font.body },
  chipTextDisabled: { color: colors.textMuted },
  closeBtn: { marginTop: spacing(2), alignItems: 'center', padding: spacing(1.5) },
  closeText: { color: colors.textMuted, fontSize: font.body },
});
