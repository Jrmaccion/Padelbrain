import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';
import Header from '@/components/common/Header';
import MatchList from '@/components/matches/MatchList';
import QuickEntryForm from '@/components/quick-entry/QuickEntryForm';
import DraftManager, { saveDraftFromForm } from '@/components/quick-entry/DraftManager';
import { useDataStore } from '@/store/useDataStore';
import { Match } from '@/types';
import { useResponsive } from '@/constants/layout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export default function MatchesScreen() {
  const {
    matches: items,
    isLoadingMatches,
    matchesError,
    loadMatches: load,
    addMatch: add,
    removeMatch: remove,
    clearErrors
  } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [draftData, setDraftData] = useState<Partial<Match> | undefined>(undefined);

  const { deviceType, layout: responsiveLayout } = useResponsive();

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (match: Match) => {
    await add(match);
    if (!matchesError) {
      setShowForm(false);
    }
  };

  const handleSaveDraft = async (draft: Partial<Match>) => {
    await saveDraftFromForm('match', draft);
  };

  const handleLoadDraft = (draft: any) => {
    setDraftData(draft.data);
    setShowForm(true);
  };

  const handleItemPress = (item: Match) => setSelectedMatch(item);
  const closeDetail = () => setSelectedMatch(null);

  const handleDelete = async () => {
    if (!selectedMatch) return;
    const confirmed =
      typeof window !== 'undefined' && (window as any).confirm
        ? (window as any).confirm('¿Estás seguro de que quieres eliminar este partido?')
        : true;
    if (confirmed) {
      await remove(selectedMatch.id);
      if (!matchesError) {
        setSelectedMatch(null);
      }
    }
  };

  const wins = items.filter((m) => m.result?.outcome === 'won').length;
  const losses = items.filter((m) => m.result?.outcome === 'lost').length;
  const winRate = items.length > 0 ? Math.round((wins / items.length) * 100) : 0;

  // Show loading spinner on initial load
  if (isLoadingMatches && items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Partidos" />
        <LoadingSpinner message="Cargando partidos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Partidos" />

      {/* Error message */}
      {matchesError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {matchesError}</Text>
          <TouchableOpacity onPress={clearErrors} style={styles.errorDismiss}>
            <Text style={styles.errorDismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addButtonText}>{showForm ? '✕ Cerrar' : '+ Nuevo Partido'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <DraftManager onLoadDraft={handleLoadDraft} />

        {showForm && (
          <View style={styles.formContainer}>
            <QuickEntryForm
              type="match"
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              draftData={draftData}
            />
          </View>
        )}

        <View style={[styles.statsContainer, deviceType !== 'mobile' && styles.statsContainerWide]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.winCard]}>
            <Text style={[styles.statValue, styles.winText]}>{wins}</Text>
            <Text style={styles.statLabel}>Victorias</Text>
          </View>
          <View style={[styles.statCard, styles.lossCard]}>
            <Text style={[styles.statValue, styles.lossText]}>{losses}</Text>
            <Text style={styles.statLabel}>Derrotas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial</Text>

        <MatchList
          items={items}
          onItemPress={handleItemPress}
        />
      </ScrollView>

      <Modal visible={selectedMatch !== null} animationType="slide" onRequestClose={closeDetail}>
        {selectedMatch && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeDetail} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Análisis</Text>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <MatchDetailView match={selectedMatch as unknown as UIMatch} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

/** Superset local para pintar campos opcionales sin tocar el tipo global Match */
type UIMatch = Match & {
  tournament?: string;
  category?: string;
  round?: string;
  location?: string;
  courtType?: 'interior' | 'exterior';
  time?: string;
  weather?: string;
  opponents?: { right?: string; left?: string };
  partner?: string;
  position?: 'right' | 'left';
  plan?: string;
  strengths?: string[];
  weaknesses?: string[];
  analysis?: { attack?: string; defense?: string; transitions?: string };
  ratings?: { technical?: number; tactical?: number; mental?: number; physical?: number };
  sleep?: number;
  energy?: number;
  nutrition?: number;
  health?: number;
  stress?: number;
  reflections?: { learned?: string; diffNextTime?: string };
  keywords?: string[];
  notes?: string;
  result?: { score?: string; durationMin?: number; outcome?: 'won' | 'lost' };
};

function MatchDetailView({ match }: { match: UIMatch }) {
  const isWin = match.result?.outcome === 'won';

  return (
    <View style={styles.detailContainer}>
      {/* Banner */}
      <View style={[styles.resultBanner, isWin ? styles.winBanner : styles.lossBanner]}>
        <Text style={styles.resultBannerText}>{isWin ? '🏆 VICTORIA' : '❌ DERROTA'}</Text>
      </View>

      {/* Fecha */}
      <Text style={styles.detailDate}>
        {new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      {/* Marcador */}
      {!!match.result?.score && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Marcador Final</Text>
          <Text style={styles.scoreValue}>{match.result.score}</Text>
          {!!match.result.durationMin && <Text style={styles.scoreDuration}>Duración: {match.result.durationMin} min</Text>}
        </View>
      )}

      {/* Info del partido */}
      <View style={styles.detailSection}>
        <Text style={styles.detailTitle}>📋 Información del Partido</Text>
        {!!match.tournament && <DetailRow icon="🏆" label="Torneo" value={match.tournament} />}
        {!!match.category && <DetailRow icon="📊" label="Categoría" value={match.category} />}
        {!!match.round && <DetailRow icon="🎯" label="Ronda" value={match.round} />}
        {!!match.location && <DetailRow icon="📍" label="Lugar" value={match.location} />}
        {!!match.courtType && <DetailRow icon="🏟️" label="Tipo de pista" value={match.courtType === 'interior' ? 'Interior' : 'Exterior'} />}
        {!!match.time && <DetailRow icon="⏰" label="Hora" value={match.time} />}
        {!!match.weather && <DetailRow icon="🌤️" label="Clima" value={match.weather} />}
        {!!(match as any).partner && <DetailRow icon="🧑‍🤝‍🧑" label="Compañero/a" value={(match as any).partner} />}
        {!!(match as any).position && (
          <DetailRow icon="🧭" label="Posición" value={(match as any).position === 'right' ? 'Derecha' : 'Izquierda'} />
        )}
      </View>

      {/* Rivales */}
      {match.opponents && (match.opponents.right || match.opponents.left) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>🤝 Rivales</Text>
          {!!match.opponents.right && <DetailRow icon="👤" label="Derecha" value={match.opponents.right} />}
          {!!match.opponents.left && <DetailRow icon="👤" label="Izquierda" value={match.opponents.left} />}
        </View>
      )}

      {/* Plan */}
      {!!match.plan && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>📝 Plan de Juego</Text>
          <Text style={styles.detailContent}>{match.plan}</Text>
        </View>
      )}

      {/* Fortalezas */}
      {match.strengths && match.strengths.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>💪 Fortalezas</Text>
          <View style={styles.tagsContainer}>
            {match.strengths.map((s, i) => (
              <View key={i} style={styles.strengthTag}>
                <Text style={styles.strengthText}>✓ {s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Debilidades */}
      {match.weaknesses && match.weaknesses.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>⚠️ Áreas de Mejora</Text>
          <View style={styles.tagsContainer}>
            {match.weaknesses.map((w, i) => (
              <View key={i} style={styles.weaknessTag}>
                <Text style={styles.weaknessText}>• {w}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Análisis */}
      {match.analysis && (match.analysis.attack || match.analysis.defense || match.analysis.transitions) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>🔍 Análisis Táctico</Text>
          {!!match.analysis.attack && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>⚔️ Ataque</Text>
              <Text style={styles.analysisText}>{match.analysis.attack}</Text>
            </View>
          )}
          {!!match.analysis.defense && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>🛡️ Defensa</Text>
              <Text style={styles.analysisText}>{match.analysis.defense}</Text>
            </View>
          )}
          {!!match.analysis.transitions && (
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>🔄 Transiciones</Text>
              <Text style={styles.analysisText}>{match.analysis.transitions}</Text>
            </View>
          )}
        </View>
      )}

      {/* Ratings */}
      {match.ratings && (match.ratings.technical || match.ratings.tactical || match.ratings.mental || match.ratings.physical) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>📊 Evaluación del Rendimiento</Text>
          {!!match.ratings.technical && <RatingRow label="Técnico" value={match.ratings.technical} icon="🎾" />}
          {!!match.ratings.tactical && <RatingRow label="Táctico" value={match.ratings.tactical} icon="🎯" />}
          {!!match.ratings.mental && <RatingRow label="Mental" value={match.ratings.mental} icon="🧠" />}
          {!!match.ratings.physical && <RatingRow label="Físico" value={match.ratings.physical} icon="💪" />}
        </View>
      )}

      {/* Estado */}
      {(match.sleep || match.energy || match.nutrition || match.health || match.stress) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>💊 Estado Previo al Partido</Text>
          {!!match.sleep && <RatingRow label="Sueño" value={match.sleep} icon="😴" />}
          {!!match.energy && <RatingRow label="Energía" value={match.energy} icon="⚡" />}
          {!!match.nutrition && <RatingRow label="Nutrición" value={match.nutrition} icon="🍎" />}
          {!!match.health && <RatingRow label="Salud" value={match.health} icon="❤️" />}
          {!!match.stress && <RatingRow label="Estrés" value={match.stress} icon="😰" />}
        </View>
      )}

      {/* Reflexiones */}
      {match.reflections && (match.reflections.learned || match.reflections.diffNextTime) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>💭 Reflexiones</Text>
          {!!match.reflections.learned && (
            <View style={styles.reflectionItem}>
              <Text style={styles.reflectionLabel}>📚 ¿Qué aprendí?</Text>
              <Text style={styles.reflectionText}>{match.reflections.learned}</Text>
            </View>
          )}
          {!!match.reflections.diffNextTime && (
            <View style={styles.reflectionItem}>
              <Text style={styles.reflectionLabel}>🔄 ¿Qué haría diferente?</Text>
              <Text style={styles.reflectionText}>{match.reflections.diffNextTime}</Text>
            </View>
          )}
        </View>
      )}

      {/* Keywords */}
      {match.keywords && match.keywords.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>🏷️ Etiquetas</Text>
          <View style={styles.keywordsContainer}>
            {match.keywords.map((k, i) => (
              <View key={i} style={styles.keywordTag}>
                <Text style={styles.keywordText}>#{k}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notas */}
      {!!match.notes && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>📝 Notas Adicionales</Text>
          <Text style={styles.detailContent}>{match.notes}</Text>
        </View>
      )}
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowIcon}>{icon}</Text>
      <Text style={styles.detailRowLabel}>{label}:</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

function RatingRow({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>
        {icon} {label}
      </Text>
      <View style={styles.ratingDots}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.ratingDot, i <= value && styles.ratingDotActive]} />
        ))}
      </View>
      <Text style={styles.ratingValue}>{value}/5</Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: { height: '100vh' as any, overflow: 'hidden' as any }
    })
  },
  errorBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#FCA5A5' },
  errorText: { fontSize: 14, color: '#991B1B', fontWeight: '600', flex: 1 },
  errorDismiss: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FCA5A5', justifyContent: 'center', alignItems: 'center' },
  errorDismissText: { fontSize: 16, color: '#7F1D1D', fontWeight: '700' },
  headerActions: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  addButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  content: {
    flex: 1,
    padding: 16,
    flexGrow: 1,
    ...Platform.select({
      web: { overflow: 'scroll' as any }
    })
  },
  formContainer: { marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#3B82F6', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  winCard: { borderColor: '#10B981' },
  winText: { color: '#10B981' },
  lossCard: { borderColor: '#EF4444' },
  lossText: { color: '#EF4444' },
  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#F1F5F9' },
  backButtonText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  deleteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { fontSize: 20 },
  modalContent: { flex: 1, padding: 16 },
  detailContainer: { gap: 16 },
  resultBanner: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  resultBannerText: { fontSize: 24, fontWeight: '700', letterSpacing: 2 },
  winBanner: { backgroundColor: '#D1FAE5' },
  lossBanner: { backgroundColor: '#FEE2E2' },
  detailDate: { fontSize: 18, fontWeight: '600', color: '#64748B', textAlign: 'center', marginBottom: 16, textTransform: 'capitalize' },
  scoreCard: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  scoreLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  scoreValue: { fontSize: 36, color: '#FFFFFF', fontWeight: '700', fontFamily: 'monospace' },
  detailSection: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  detailContent: { fontSize: 14, color: '#475569', lineHeight: 22 },
  strengthItem: { backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8, marginBottom: 8 },
  strengthText: { fontSize: 14, color: '#065F46', fontWeight: '600' },
  weaknessItem: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 8 },
  weaknessText: { fontSize: 14, color: '#991B1B', fontWeight: '600' },
} as NamedStyles<any>);

// ⬅️ NUEVO
const additionalStyles: NamedStyles<any> = {
  scoreDuration: { fontSize: 12, color: '#94A3B8', marginTop: 8 },

  // Detail rows
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailRowIcon: { fontSize: 16, marginRight: 8, width: 24 },
  detailRowLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginRight: 8, minWidth: 80 },
  detailRowValue: { fontSize: 13, color: '#1E293B', fontWeight: '500', flex: 1 },

  // Tags
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  strengthTag: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  weaknessTag: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  keywordTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  strengthText: { fontSize: 13, color: '#065F46', fontWeight: '600' },
  weaknessText: { fontSize: 13, color: '#991B1B', fontWeight: '600' },
  keywordText: { fontSize: 12, fontWeight: '600', color: '#1E40AF' },
  keywordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Analysis / reflections
  analysisItem: { marginBottom: 16 },
  analysisLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  analysisText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  reflectionItem: { marginBottom: 16 },
  reflectionLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  reflectionText: { fontSize: 13, color: '#475569', lineHeight: 20, fontStyle: 'italic' },

  // Ratings
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  ratingDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  ratingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  ratingDotActive: { backgroundColor: '#3B82F6' },
  ratingValue: { fontSize: 13, fontWeight: '700', color: '#64748B', marginLeft: 8 },

  // Responsive
  statsContainerWide: { flexDirection: 'row', flexWrap: 'wrap' }, // ⬅️ NUEVO
};

const styles = { ...baseStyles, ...additionalStyles } as const;
