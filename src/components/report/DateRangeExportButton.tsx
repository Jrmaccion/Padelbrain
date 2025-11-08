// src/components/report/DateRangeExportButton.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Match, Training } from '@/types';
import { exportActivityReportPDF } from '@/services/report/exportPdf';

type PresetKey = '7d' | '30d' | '90d' | 'thisMonth' | 'custom';

interface Props {
  matches: Match[];
  trainings: Training[];
  defaultPreset?: PresetKey;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthBounds(d = new Date()) {
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from, to };
}

function addDays(base: Date, delta: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

export default function DateRangeExportButton({
  matches,
  trainings,
  defaultPreset = '30d',
  buttonStyle,
  buttonTextStyle
}: Props) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PresetKey>(defaultPreset);
  const [includeMatches, setIncludeMatches] = useState(true);
  const [includeTrainings, setIncludeTrainings] = useState(true);

  // Para "custom"
  const [fromStr, setFromStr] = useState('');
  const [toStr, setToStr] = useState('');

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (preset === '7d') {
      return { from: addDays(now, -7), to: now };
    }
    if (preset === '30d') {
      return { from: addDays(now, -30), to: now };
    }
    if (preset === '90d') {
      return { from: addDays(now, -90), to: now };
    }
    if (preset === 'thisMonth') {
      return monthBounds(now);
    }
    // custom
    const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    const f = validDate(fromStr) ? new Date(fromStr) : addDays(now, -30);
    const t = validDate(toStr) ? new Date(toStr) : now;
    return { from: f, to: t };
  }, [preset, fromStr, toStr]);

  const handleExport = async () => {
    try {
      if (!includeMatches && !includeTrainings) {
        Alert.alert('Selecciona contenido', 'Elige al menos "Partidos" o "Entrenos".');
        return;
      }

      // Create new Date objects to avoid mutating the original dates
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      const result = await exportActivityReportPDF(matches, trainings, {
        title: 'Informe de actividad',
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        includeMatches,
        includeTrainings,
        filename: `PadelBrain-Informe-${toISODate(from)}_${toISODate(to)}`,
      });

      setOpen(false);

      if (Platform.OS === 'web') {
        Alert.alert('Impresión iniciada', 'Se ha abierto el diálogo de impresión. Selecciona "Guardar como PDF" o tu impresora preferida.');
      } else {
        // On Android/iOS, share the generated PDF
        if (result.uri) {
          const Sharing = await import('expo-sharing');
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(result.uri, {
              dialogTitle: 'Compartir informe PDF',
              mimeType: 'application/pdf',
            });
          } else {
            Alert.alert('PDF generado', 'El archivo se ha creado correctamente.');
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Error al exportar', e?.message ?? 'Ocurrió un error inesperado');
    }
  };


  const PresetChip = ({ id, label }: { id: PresetKey; label: string }) => (
    <TouchableOpacity
      onPress={() => setPreset(id)}
      style={[styles.chip, preset === id && styles.chipActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, preset === id && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
      activeOpacity={0.7}
    >
      <Text style={[styles.toggleText, value ? styles.toggleTextOn : styles.toggleTextOff]}>
        {value ? '✓ ' : ''}{label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, buttonTextStyle]}>🧾 Exportar PDF (selector)</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.title}>Exportar informe</Text>

          <Text style={styles.sectionTitle}>Rango</Text>
          <View style={styles.rowWrap}>
            <PresetChip id="7d" label="Últimos 7 días" />
            <PresetChip id="30d" label="Últimos 30 días" />
            <PresetChip id="90d" label="Últimos 90 días" />
            <PresetChip id="thisMonth" label="Este mes" />
            <PresetChip id="custom" label="Personalizado" />
          </View>

          {preset === 'custom' && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Desde (YYYY-MM-DD)</Text>
              <TextInput
                value={fromStr}
                onChangeText={setFromStr}
                placeholder={toISODate(addDays(new Date(), -30))}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={[styles.label, { marginTop: 8 }]}>Hasta (YYYY-MM-DD)</Text>
              <TextInput
                value={toStr}
                onChangeText={setToStr}
                placeholder={toISODate(new Date())}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.hint}>Formato: 2025-01-31</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Contenido</Text>
          <View style={styles.rowWrap}>
            <Toggle label="Partidos" value={includeMatches} onChange={setIncludeMatches} />
            <Toggle label="Entrenos" value={includeTrainings} onChange={setIncludeTrainings} />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn]} onPress={() => setOpen(false)}>
              <Text style={styles.footerBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerBtn, styles.exportBtn]} onPress={handleExport}>
              <Text style={[styles.footerBtnText, { color: '#fff' }]}>Exportar PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Preview del rango seleccionado */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.rangePreview}>
              Rango seleccionado: {toISODate(from)} → {toISODate(to)}
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    borderColor: '#E2E8F0'
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#0C4A6E' },

  modal: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 12 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF'
  },
  chipActive: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  chipTextActive: { color: '#FFFFFF' },

  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10,
    backgroundColor: '#FFFFFF', fontSize: 14, color: '#0F172A'
  },
  hint: { fontSize: 11, color: '#64748B', marginTop: 4 },

  toggle: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 16, borderWidth: 1
  },
  toggleOn: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  toggleOff: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  toggleText: { fontSize: 13, fontWeight: '600' },
  toggleTextOn: { color: '#166534' },
  toggleTextOff: { color: '#334155' },

  footer: { flexDirection: 'row', gap: 12, marginTop: 20 },
  footerBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1
  },
  cancelBtn: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  exportBtn: { backgroundColor: '#0EA5E9', borderColor: '#0284C7' },
  footerBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },

  rangePreview: { fontSize: 12, color: '#475569', textAlign: 'center' }
});
