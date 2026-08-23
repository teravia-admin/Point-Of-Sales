import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';

interface POSCalculatorProps {
  value: string;
  onChange: (val: string) => void;
}

export function POSCalculator({ value, onChange }: POSCalculatorProps) {
  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      onChange('0');
      return;
    }
    if (key === 'BACK') {
      onChange(value.length > 1 ? value.slice(0, -1) : '0');
      return;
    }
    if (value === '0' && key !== '.') {
      onChange(key);
      return;
    }
    onChange(value + key);
  };

  const keys = [
    ['7', '8', '9', 'C'],
    ['4', '5', '6', 'BACK'],
    ['1', '2', '3', '00'],
    ['0', '000', '.', '='],
  ];

  return (
    <Surface style={styles.container} elevation={2}>
      <View style={styles.display}>
        <Text variant="headlineMedium" style={styles.displayText}>
          {value || '0'}
        </Text>
      </View>
      {keys.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((k) => (
            <TouchableOpacity
              key={k}
              style={[
                styles.keyBtn,
                k === 'C' && styles.clearBtn,
                k === '=' && styles.equalBtn,
              ]}
              onPress={() => handleKeyPress(k)}
            >
              <Text style={[styles.keyText, (k === 'C' || k === '=') && styles.specialText]}>
                {k === 'BACK' ? '⌫' : k}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF' },
  display: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  displayText: { fontWeight: 'bold', color: '#1E293B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  keyBtn: {
    flex: 1,
    height: 48,
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearBtn: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  equalBtn: { backgroundColor: '#4F46E5', borderColor: '#4338CA' },
  keyText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  specialText: { color: '#EF4444' },
});
