import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { Grid } from '../game/types';
import { getCompletedLines } from '../game/logic';
import { colors, radius, font } from '../theme/theme';

interface Props {
  grid: Grid;
  markedNumbers?: number[];
  onCellPress?: (row: number, col: number) => void;
}

export default function BingoGrid({ grid, markedNumbers = [], onCellPress }: Props) {
  const marked = new Set(markedNumbers);
  const completedLines = getCompletedLines(grid, markedNumbers);

  return (
    <View style={styles.grid}>
      {grid.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((cell, cIdx) => {
            const isMarked = cell !== null && marked.has(cell);
            const isEmpty = cell === null;
            return (
              <Pressable
                key={cIdx}
                disabled={!onCellPress || !isEmpty}
                onPress={() => onCellPress?.(rIdx, cIdx)}
                style={[styles.cell, isEmpty ? styles.cellEmpty : styles.cellFilled, isMarked && styles.cellMarked]}
              >
                {cell !== null && <Text style={styles.cellText}>{cell}</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 5 5" preserveAspectRatio="none" pointerEvents="none">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isMarked = cell !== null && marked.has(cell);
            if (!isMarked) return null;
            return (
              <SvgLine
                key={`strike-${r}-${c}`}
                x1={c + 0.2}
                y1={r + 0.2}
                x2={c + 0.8}
                y2={r + 0.8}
                stroke={colors.strike}
                strokeWidth={0.06}
                strokeLinecap="round"
              />
            );
          })
        )}

        {completedLines.map((line, i) => {
          const [r1, c1] = line.cells[0];
          const [r2, c2] = line.cells[line.cells.length - 1];
          return (
            <SvgLine
              key={`line-${line.type}-${line.index}-${i}`}
              x1={c1 + 0.5}
              y1={r1 + 0.5}
              x2={c2 + 0.5}
              y2={r2 + 0.5}
              stroke={colors.winLine}
              strokeWidth={0.09}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderRadius: radius.md,
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
  cellText: {
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '700',
  },
});
