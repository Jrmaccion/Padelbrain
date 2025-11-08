import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import Header from '@/components/common/Header';
import TrainingList from '@/components/trainings/TrainingList';
import QuickEntryForm from '@/components/quick-entry/QuickEntryForm';
import DraftManager, { saveDraftFromForm, resetToDraft } from '@/components/quick-entry/DraftManager';
import { useDataStore } from '@/store/useDataStore';
import { Training } from '@/types';
import { useResponsive } from '@/constants/layout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import FilterButton, { FilterOption } from '@/components/common/FilterButton';

export default function TrainingsScreen() {
  const {
    trainings: items,
    isLoadingTrainings,
    trainingsError,
    loadTrainings: load,
    addTraining: add,
    updateTraining: update,
    removeTraining: remove,
    clearErrors
  } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [draftToLoad, setDraftToLoad] = useState<any>(null);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [coachFilter, setCoachFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);

  const { deviceType, layout: responsiveLayout } = useResponsive();

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (training: Training) => {
    if (editingTraining) {
      // Update existing training
      await update(training.id, training);
      if (!trainingsError) {
        setShowForm(false);
        setEditingTraining(null);
        setSelectedTraining(null);
        Alert.alert(
          '✅ Entrenamiento actualizado',
          'Los cambios se han guardado correctamente.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Create new training
      await add(training);
      if (!trainingsError) {
        setShowForm(false);
        Alert.alert(
          '✅ Entrenamiento guardado',
          'El entrenamiento se ha registrado correctamente en tu historial.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setSelectedTraining(null);
    setDraftToLoad(null);
    setShowForm(true);
  };

  const handleSaveDraft = async (draft: Partial<Training>) => {
    await saveDraftFromForm('training', draft);
  };

  const handleLoadDraft = (draft: any) => {
    setDraftToLoad(draft.data);
    setShowForm(true);
  };

  const handleItemPress = (item: Training) => {
    setSelectedTraining(item);
  };

  const closeDetail = () => {
    setSelectedTraining(null);
  };

  const handleDelete = async () => {
    if (!selectedTraining) return;

    const confirmed = typeof window !== 'undefined' && (window as any).confirm
      ? (window as any).confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')
      : true;

    if (confirmed && selectedTraining) {
      await remove(selectedTraining.id);
      if (!trainingsError) {
        setSelectedTraining(null);
      }
    }
  };

  const handleResetToDraft = async () => {
    if (!selectedTraining) return;

    Alert.alert(
      'Convertir a borrador',
      '¿Quieres convertir este entrenamiento en borrador? Se eliminará del historial y podrás editarlo desde "Borradores".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Convertir',
          onPress: async () => {
            await resetToDraft('training', selectedTraining);
            await remove(selectedTraining.id);
            if (!trainingsError) {
              setSelectedTraining(null);
            }
          }
        }
      ]
    );
  };

  // Extract unique filter options
  const coachOptions: FilterOption[] = useMemo(() => {
    const coaches = new Set(items.map(t => t.coach).filter((coach): coach is string => Boolean(coach)));
    return Array.from(coaches).map(coach => ({
      label: coach,
      value: coach,
      count: items.filter(t => t.coach === coach).length
    }));
  }, [items]);

  const locationOptions: FilterOption[] = useMemo(() => {
    const locations = new Set(items.map(t => t.location).filter((loc): loc is string => Boolean(loc)));
    return Array.from(locations).map(loc => ({
      label: loc,
      value: loc,
      count: items.filter(t => t.location === loc).length
    }));
  }, [items]);

  // Filter trainings based on search and filters
  const filteredTrainings = useMemo(() => {
    return items.filter(training => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          training.location,
          training.coach,
          training.notes,
          ...(training.goals || []),
          ...(training.trainingPartners || []),
          training.postReview?.learned,
          training.postReview?.improveNext
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Coach filter
      if (coachFilter.length > 0) {
        if (!coachFilter.includes(training.coach || '')) return false;
      }

      // Location filter
      if (locationFilter.length > 0) {
        if (!locationFilter.includes(training.location || '')) return false;
      }

      return true;
    });
  }, [items, searchQuery, coachFilter, locationFilter]);

  // Show loading spinner on initial load
  if (isLoadingTrainings && items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Entrenamientos" />
        <LoadingSpinner message="Cargando entrenamientos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Entrenamientos" />

      {/* Error message */}
      {trainingsError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {trainingsError}</Text>
          <TouchableOpacity onPress={clearErrors} style={styles.errorDismiss}>
            <Text style={styles.errorDismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.headerActionsContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? '✕ Cerrar' : '+ Nuevo Entrenamiento'}
          </Text>
        </TouchableOpacity>
      </View>

      <TrainingList
        items={filteredTrainings}
        onItemPress={handleItemPress}
          ListHeaderComponent={
            <View
              style={
                deviceType !== 'mobile'
                  ? { maxWidth: responsiveLayout.getMaxWidth(), alignSelf: 'center', width: '100%' }
                  : undefined
              }
            >
              <DraftManager onLoadDraft={handleLoadDraft} />

              {showForm && (
                <View style={styles.formContainer}>
                  <QuickEntryForm
                    type="training"
                    onSubmit={handleSubmit}
                    onSaveDraft={handleSaveDraft}
                    draftData={draftToLoad}
                    editMode={!!editingTraining}
                    itemToEdit={editingTraining || undefined}
                  />
                </View>
              )}

              <View style={[styles.statsContainer, deviceType !== 'mobile' && styles.statsContainerWide]}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{items.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {items.filter(t => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(t.date) > weekAgo;
                    }).length}
                  </Text>
                  <Text style={styles.statLabel}>Esta semana</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {items.filter(t => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return new Date(t.date) > monthAgo;
                    }).length}
                  </Text>
                  <Text style={styles.statLabel}>Este mes</Text>
                </View>
              </View>

              {/* Search and Filter Section */}
              <View style={styles.searchFilterContainer}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar por entrenador, lugar, objetivos..."
                  style={styles.searchBar}
                />
                <View style={styles.filterRow}>
                  {coachOptions.length > 0 && (
                    <FilterButton
                      label="Entrenador"
                      options={coachOptions}
                      selectedValues={coachFilter}
                      onSelect={setCoachFilter}
                    />
                  )}
                  {locationOptions.length > 0 && (
                    <FilterButton
                      label="Lugar"
                      options={locationOptions}
                      selectedValues={locationFilter}
                      onSelect={setLocationFilter}
                    />
                  )}
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial</Text>
                {(searchQuery || coachFilter.length > 0 || locationFilter.length > 0) && (
                  <Text style={styles.resultCount}>
                    {filteredTrainings.length} de {items.length}
                  </Text>
                )}
              </View>
            </View>
          }
        />

      {/* Modal de detalle */}
      <Modal
        visible={selectedTraining !== null}
        animationType="slide"
        onRequestClose={closeDetail}
      >
        {selectedTraining && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeDetail} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalle</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => handleEdit(selectedTraining)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResetToDraft} style={styles.draftButton}>
                  <Text style={styles.draftButtonText}>📝</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
            >
              <TrainingDetailView training={selectedTraining} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

// Componente de detalle
function TrainingDetailView({ training }: { training: Training }) {
  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailDate}>
        {new Date(training.date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>

      {training.coach && (
        <DetailSection title="👨‍🏫 Entrenador" content={training.coach} />
      )}

      {training.location && (
        <DetailSection title="📍 Lugar" content={training.location} />
      )}

      {training.goals && training.goals.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>🎯 Objetivos</Text>
          {training.goals.map((goal, i) => (
            <Text key={i} style={styles.detailListItem}>• {goal}</Text>
          ))}
        </View>
      )}

      {(training.sleep || training.energy || training.nutrition || training.health || training.stress) && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>💪 Estado Físico y Mental</Text>
          {training.sleep && <RatingRow label="Sueño" value={training.sleep} icon="😴" />}
          {training.energy && <RatingRow label="Energía" value={training.energy} icon="⚡" />}
          {training.nutrition && <RatingRow label="Nutrición" value={training.nutrition} icon="🍎" />}
          {training.health && <RatingRow label="Salud" value={training.health} icon="❤️" />}
          {training.stress && <RatingRow label="Estrés" value={training.stress} icon="😰" />}
        </View>
      )}

      {training.postReview && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>📊 Evaluación</Text>
          {training.postReview.technical && <RatingRow label="Técnico" value={training.postReview.technical} icon="🎾" />}
          {training.postReview.tactical && <RatingRow label="Táctico" value={training.postReview.tactical} icon="🎯" />}
          {training.postReview.mental && <RatingRow label="Mental" value={training.postReview.mental} icon="🧠" />}
          {training.postReview.learned && <DetailSection title="📚 Aprendizajes" content={training.postReview.learned} />}
          {training.postReview.improveNext && <DetailSection title="🔄 Mejorar próxima vez" content={training.postReview.improveNext} />}
        </View>
      )}

      {training.notes && (
        <DetailSection title="💭 Notas" content={training.notes} />
      )}
    </View>
  );
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailContent}>{content}</Text>
    </View>
  );
}

function RatingRow({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{icon} {label}</Text>
      <View style={styles.ratingDots}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={[
              styles.ratingDot,
              i <= value && styles.ratingDotActive
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: { minHeight: '100vh' as any, overflowX: 'hidden' as any }
    })
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5'
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1
  },
  errorDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorDismissText: {
    fontSize: 16,
    color: '#7F1D1D',
    fontWeight: '700'
  },
  headerActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  formContainer: {
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  // ⬅️ NUEVO
  statsContainerWide: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  listContainer: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B'
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 20
  },
  draftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  draftButtonText: {
    fontSize: 20
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButtonText: {
    fontSize: 20
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  modalContentContainer: {
    paddingBottom: 40
  },
  detailContainer: {
    gap: 20
  },
  detailDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
  detailContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22
  },
  detailListItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 20
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  ratingDots: {
    flexDirection: 'row',
    gap: 6
  },
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0'
  },
  ratingDotActive: {
    backgroundColor: '#3B82F6'
  },
  // Search and Filter
  searchFilterContainer: {
    marginBottom: 16,
    gap: 12
  },
  searchBar: {
    width: '100%'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  resultCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  }
});
