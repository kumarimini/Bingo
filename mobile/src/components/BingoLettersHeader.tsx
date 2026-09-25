import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { colors, spacing, font } from '../theme/theme';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

interface Props {
  /** How many letters (left to right) should be shown as struck through. */
  crossedCount: number;
}

export default function BingoLettersHeader({ crossedCount }: Props) {
  return (
    <View style={styles.row}>
      {LETTERS.map((letter, i) => {
        const crossed = i < crossedCount;
        return (
          <View key={letter} style={styles.letterBox}>
            <Text style={[styles.letter, crossed && styles.letterCrossed]}>{letter}</Text>
            {crossed && (
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" pointerEvents="none">
                <SvgLine x1={0.08} y1={0.08} x2={0.92} y2={0.92} stroke={colors.strike} strokeWidth={0.07} strokeLinecap="round" />
              </Svg>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing(1.5),
  },
  letterBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.text,
    fontSize: font.h1,
    fontWeight: '800',
  },
  letterCrossed: {
    color: colors.textMuted,
  },
});
