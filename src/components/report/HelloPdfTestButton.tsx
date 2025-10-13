// src/components/report/HelloPdfTestButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { printHelloPdf } from '@/services/report/printTest';

export default function HelloPdfTestButton() {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={printHelloPdf}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>🧪 Generar PDF “Hola”</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0EA5E9',
    borderLeftColor: '#0EA5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#0C4A6E' },
});
