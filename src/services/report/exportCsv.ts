// src/services/report/exportCsv.ts
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Match, Training } from '@/types';

export interface CsvExportOptions {
  title: string;
  from: string;  // ISO date
  to: string;    // ISO date
  includeMatches: boolean;
  includeTrainings: boolean;
  filename?: string; // without extension
}

function fmtDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function between(dateISO: string, fromISO: string, toISO: string): boolean {
  const t = new Date(dateISO).getTime();
  const f = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  return t >= f && t <= to;
}

function buildMatchesCsv(matches: Match[]): string {
  if (matches.length === 0) return '';

  const headers = [
    'Fecha',
    'Torneo',
    'Categoría',
    'Ronda',
    'Lugar',
    'Tipo Pista',
    'Rival Derecha',
    'Rival Izquierda',
    'Compañero/a',
    'Posición',
    'Resultado',
    'Marcador',
    'Duración (min)',
    'Fortalezas',
    'Debilidades',
    'Plan de Juego',
    'Análisis Ataque',
    'Análisis Defensa',
    'Análisis Transiciones',
    'Rating Técnico',
    'Rating Táctico',
    'Rating Mental',
    'Rating Físico',
    'Sueño',
    'Energía',
    'Nutrición',
    'Salud',
    'Estrés',
    'Aprendizajes',
    'Qué Haría Diferente',
    'Notas'
  ];

  const rows = matches.map(m => [
    fmtDate(m.date),
    m.tournament || '',
    m.category || '',
    m.round || '',
    m.location || '',
    m.courtType === 'interior' ? 'Interior' : m.courtType === 'exterior' ? 'Exterior' : '',
    m.opponents?.right || '',
    m.opponents?.left || '',
    m.partner || '',
    m.position === 'right' ? 'Derecha' : m.position === 'left' ? 'Izquierda' : '',
    m.result?.outcome === 'won' ? 'Victoria' : m.result?.outcome === 'lost' ? 'Derrota' : '',
    m.result?.score || '',
    m.result?.durationMin || '',
    m.strengths?.join('; ') || '',
    m.weaknesses?.join('; ') || '',
    m.plan || '',
    m.analysis?.attack || '',
    m.analysis?.defense || '',
    m.analysis?.transitions || '',
    m.ratings?.technical || '',
    m.ratings?.tactical || '',
    m.ratings?.mental || '',
    m.ratings?.physical || '',
    m.sleep || '',
    m.energy || '',
    m.nutrition || '',
    m.health || '',
    m.stress || '',
    m.reflections?.learned || '',
    m.reflections?.diffNextTime || '',
    m.notes || ''
  ].map(escapeCsv));

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

function buildTrainingsCsv(trainings: Training[]): string {
  if (trainings.length === 0) return '';

  const headers = [
    'Fecha',
    'Entrenador',
    'Lugar',
    'Compañeros',
    'Objetivos',
    'Sueño',
    'Energía',
    'Nutrición',
    'Salud',
    'Estrés',
    'Rating Técnico',
    'Rating Táctico',
    'Rating Mental',
    'Rating Físico',
    'Aprendizajes',
    'Mejorar Próxima Vez',
    'Notas'
  ];

  const rows = trainings.map(t => [
    fmtDate(t.date),
    t.coach || '',
    t.location || '',
    t.trainingPartners?.join('; ') || '',
    t.goals?.join('; ') || '',
    t.sleep || '',
    t.energy || '',
    t.nutrition || '',
    t.health || '',
    t.stress || '',
    t.postReview?.technical || '',
    t.postReview?.tactical || '',
    t.postReview?.mental || '',
    t.postReview?.physical || '',
    t.postReview?.learned || '',
    t.postReview?.improveNext || '',
    t.notes || ''
  ].map(escapeCsv));

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export async function exportToCsv(
  matches: Match[],
  trainings: Training[],
  options: CsvExportOptions
): Promise<void> {
  const { from, to, includeMatches, includeTrainings, filename } = options;

  // Filter by date range
  const filteredMatches = includeMatches
    ? matches.filter(m => m?.date && between(m.date, from, to))
    : [];

  const filteredTrainings = includeTrainings
    ? trainings.filter(t => t?.date && between(t.date, from, to))
    : [];

  // Build CSV content
  let csvContent = '';

  if (filteredMatches.length > 0) {
    csvContent += '# PARTIDOS\n';
    csvContent += buildMatchesCsv(filteredMatches);
    csvContent += '\n\n';
  }

  if (filteredTrainings.length > 0) {
    csvContent += '# ENTRENAMIENTOS\n';
    csvContent += buildTrainingsCsv(filteredTrainings);
  }

  if (!csvContent.trim()) {
    throw new Error('No hay datos para exportar en el rango de fechas seleccionado');
  }

  const finalFilename = filename || `padelbrain_export_${fmtDate(from).replace(/\//g, '-')}_${fmtDate(to).replace(/\//g, '-')}`;

  // Platform-specific handling
  if (Platform.OS === 'web') {
    // Web: Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // Native: Save to file system and share
    const fileUri = `${(FileSystem as any).documentDirectory}${finalFilename}.csv`;
    await (FileSystem as any).writeAsStringAsync(fileUri, csvContent, {
      encoding: (FileSystem as any).EncodingType.UTF8
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar datos a CSV'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }
  }
}
