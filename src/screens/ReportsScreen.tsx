// src/screens/ReportsScreen.tsx
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Header from '@/components/common/Header';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useResponsive } from '@/constants/layout';
import DateRangeExportButton from '@/components/report/DateRangeExportButton';
import { exportPdfAndShare } from '@/services/report/exportPdf';
import { exportToCsv } from '@/services/report/exportCsv';

export default function ReportsScreen() {
  const { items: matches } = useMatches();
  const { items: trainings } = useTrainings();
  const { deviceType, layout: responsiveLayout } = useResponsive();

  const [lastInfo, setLastInfo] = useState<string>('');

  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(now.getDate() - 30);

  const fromISO = new Date(thirtyAgo.setHours(0, 0, 0, 0)).toISOString();
  const toISO = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  const stats = useMemo(() => {
    const m = matches.length;
    const w = matches.filter(x => x.result?.outcome === 'won').length;
    const wr = m > 0 ? Math.round((w / m) * 100) : 0;
    return { matches: m, wins: w, winRate: wr, trainings: trainings.length };
  }, [matches, trainings]);

  const tryMinimal = async () => {
    try {
      await exportPdfAndShare(matches, trainings, {
        title: 'Informe de actividad (30 días)',
        from: fromISO,
        to: toISO,
        includeMatches: true,
        includeTrainings: true,
        filename: 'PadelBrain-Informe-30dias',
      });
      setLastInfo(`Generado ${new Date().toLocaleString()}`);
      if (Platform.OS === 'web') {
        Alert.alert('Impresión iniciada', 'Se ha abierto el diálogo de impresión. Selecciona "Guardar como PDF" para descargar el informe.');
      } else {
        Alert.alert('PDF generado', 'PDF creado. Si está disponible, se ha abierto el diálogo de compartir.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el PDF');
    }
  };

  const exportCsvLast30Days = async () => {
    try {
      await exportToCsv(matches, trainings, {
        title: 'Exportación CSV (30 días)',
        from: fromISO,
        to: toISO,
        includeMatches: true,
        includeTrainings: true,
        filename: 'PadelBrain-Export-30dias',
      });
      setLastInfo(`CSV generado ${new Date().toLocaleString()}`);
      if (Platform.OS === 'web') {
        Alert.alert('CSV descargado', 'El archivo CSV se ha descargado correctamente.');
      } else {
        Alert.alert('CSV generado', 'CSV creado. Se ha abierto el diálogo de compartir.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el CSV');
    }
  };

  const isWeb = () => Platform.OS === 'web'; // ✅ como función

  return (
    <ScrollView style={styles.container}>
      <View style={[
        styles.wrapper,
        deviceType !== 'mobile' && {
          maxWidth: responsiveLayout.getMaxWidth(),
          alignSelf: 'center',
          width: '100%',
        }
      ]}>
        <Header title="Informes" />

        <View style={styles.card}>
          <Text style={styles.title}>Estado actual</Text>
          <Text style={styles.p}>
            Matches: <Text style={styles.bold}>{stats.matches}</Text> |
            Trainings: <Text style={styles.bold}>{stats.trainings}</Text> |
            WinRate: <Text style={styles.bold}>{stats.wins}/{stats.matches} ({stats.winRate}%)</Text>
          </Text>
          <Text style={[styles.p, styles.muted]}>
            Rango rápido: {new Date(fromISO).toLocaleDateString()} → {new Date(toISO).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🧾 Exportar informe PDF</Text>
          <Text style={[styles.p, styles.muted]}>
            Genera un PDF con tus partidos y entrenamientos de un rango de fechas.
          </Text>

          <View style={styles.grid}>
            <DateRangeExportButton
              matches={matches}
              trainings={trainings}
              defaultPreset="30d"
              buttonStyle={{ backgroundColor: '#0EA5E9', borderLeftColor: '#0EA5E9' }}
              buttonTextStyle={{ color: '#0C4A6E' }}
            />

            <TouchableOpacity style={[styles.btn, styles.btnAlt]} onPress={tryMinimal}>
              <Text style={styles.btnText}>Exportar rápido (últimos 30 días)</Text>
            </TouchableOpacity>

            {isWeb() && (
              <TouchableOpacity style={[styles.btn, styles.btnAlt2]} onPress={tryMinimal}>
                <Text style={styles.btnText}>Prueba pipeline PDF (HTML mínimo)</Text>
              </TouchableOpacity>
            )}
          </View>

          {lastInfo ? (
            <Text style={[styles.p, styles.muted]}>{lastInfo}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>📊 Exportar datos CSV</Text>
          <Text style={[styles.p, styles.muted]}>
            Descarga tus datos en formato CSV para análisis en Excel, Google Sheets u otras herramientas.
          </Text>

          <View style={styles.grid}>
            <TouchableOpacity style={[styles.btn, styles.btnCsv]} onPress={exportCsvLast30Days}>
              <Text style={styles.btnText}>📥 Descargar CSV (últimos 30 días)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  wrapper: {},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16,
    margin: 16
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  p: { fontSize: 14, color: '#0F172A', marginBottom: 6 },
  bold: { fontWeight: '700' },
  muted: { color: '#64748B' },
  grid: { gap: 12 },
  btn: {
    backgroundColor: '#3B82F6',
    borderLeftColor: '#3B82F6',
    borderLeftWidth: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, borderRadius: 12
  },
  btnAlt: { backgroundColor: '#10B981', borderLeftColor: '#10B981' },
  btnAlt2: { backgroundColor: '#F59E0B', borderLeftColor: '#F59E0B' },
  btnCsv: { backgroundColor: '#8B5CF6', borderLeftColor: '#8B5CF6' },
  btnText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
});
