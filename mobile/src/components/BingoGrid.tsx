import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Grid } from '../game/types';
import { colors, radius, font } from '../theme/theme';

interface Props {
  grid: Grid;
  markedNumbers?: number[];
  onCellPress?: (row: number, col: number) => void;
  highlightRows?: number[]; // rows fully marked, for a subtle win glow
}

export default function BingoGrid({ grid, markedNumbers = [], onCellPress, highlightRows = [] }: Props) {
  const marked = new Set(markedNumbers);

  return (
    <View style={styles.grid}>
      {grid.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((cell, cIdx) => {
            const isMarked = cell !== null && marked.has(cell);
            const isEmpty = cell === null;
            const rowHighlighted = highlightRows.includes(rIdx);
            return (
              <Pressable
                key={cIdx}
                disabled={!onCellPress || !isEmpty}
                onPress={() => onCellPress?.(rIdx, cIdx)}
                style={[
                  styles.cell,
                  isEmpty ? styles.cellEmpty : styles.cellFilled,
                  isMarked && styles.cellMarked,
                  rowHighlighted && styles.cellHighlight,
                ]}
              >
                {cell !== null && (
                  <Text style={[styles.cellText, isMarked && styles.cellTextMarked]}>{cell}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    padding: 6,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: {
    backgroundColor: colors.cellEmpty,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  cellFilled: {
    backgroundColor: colors.cellFilled,
  },
  cellMarked: {
    backgroundColor: colors.cellMarked,
  },
  cellHighlight: {
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  cellText: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
  },
  cellTextMarked: {
    color: colors.bg,
  },
});
