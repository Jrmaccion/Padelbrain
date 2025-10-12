import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Training, Match } from '@/types';
import { getItem, setItem, removeItem } from '@/services/storage';
import Card from '@/components/common/Card';

interface Draft {
  id: string;
  type: 'training' | 'match';
  data: Partial<Training | Match>;
  createdAt: string;
}

interface DraftManagerProps {
  onLoadDraft: (draft: Draft) => void;
}

const DRAFTS_KEY = 'app_drafts';

export default function DraftManager({ onLoadDraft }: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const savedDrafts = await getItem<Draft[]>(DRAFTS_KEY);
    if (savedDrafts) {
      setDrafts(savedDrafts);
    }
  };

  const saveDraft = async (type: 'training' | 'match', data: Partial<Training | Match>) => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      type,
      data,
      createdAt: new Date().toISOString()
    };

    const updatedDrafts = [...drafts, newDraft];
    await setItem(DRAFTS_KEY, updatedDrafts);
    setDrafts(updatedDrafts);
    
    Alert.alert('✅ Borrador guardado', 'Puedes continuar más tarde desde donde lo dejaste');
  };

  const deleteDraft = async (draftId: string) => {
    Alert.alert(
      'Eliminar borrador',
      '¿Estás seguro de que quieres eliminar este borrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedDrafts = drafts.filter(d => d.id !== draftId);
            await setItem(DRAFTS_KEY, updatedDrafts);
            setDrafts(updatedDrafts);
            // Recargar para asegurar sincronización
            await loadDrafts();
          }
        }
      ]
    );
  };

  const loadDraftHandler = (draft: Draft) => {
    onLoadDraft(draft);
    setShowDrafts(false);
  };

  const getDraftSummary = (draft: Draft): string => {
    const data = draft.data as any;
    const parts: string[] = [];

    if (data.date) {
      parts.push(new Date(data.date).toLocaleDateString());
    }

    if (draft.type === 'training') {
      if (data.coach) parts.push(`👨‍🏫 ${data.coach}`);
      if (data.location) parts.push(`📍 ${data.location}`);
    } else {
      if (data.tournament) parts.push(`🏆 ${data.tournament}`);
      if (data.result?.score) parts.push(`📊 ${data.result.score}`);
    }

    return parts.join(' • ') || 'Sin detalles';
  };

  const getCompletionPercentage = (draft: Draft): number => {
    const data = draft.data as any;
    let filled = 0;
    let total = 10;

    if (data.date) filled++;
    if (data.location) filled++;
    if (data.notes) filled++;
    if (data.sleep) filled++;
    if (data.energy) filled++;

    if (draft.type === 'training') {
      if (data.coach) filled++;
      if (data.goals?.length) filled++;
      if (data.postReview?.learned) filled++;
    } else {
      if (data.result?.score) filled++;
      if (data.strengths?.length) filled++;
      if (data.weaknesses?.length) filled++;
    }

    return Math.round((filled / total) * 100);
  };

  if (drafts.length === 0 && !showDrafts) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowDrafts(!showDrafts)}
      >
        <Text style={styles.toggleButtonText}>
          📋 Borradores ({drafts.length})
          {showDrafts ? ' ▼' : ' ▶'}
        </Text>
      </TouchableOpacity>

      {showDrafts && (
        <ScrollView style={styles.draftsContainer}>
          {drafts.map(draft => (
            <Card key={draft.id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftType}>
                  {draft.type === 'training' ? '🏃 Entrenamiento' : '🎾 Partido'}
                </Text>
                <Text style={styles.draftDate}>
                  {new Date(draft.createdAt).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.draftSummary}>{getDraftSummary(draft)}</Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getCompletionPercentage(draft)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {getCompletionPercentage(draft)}% completado
              </Text>

              <View style={styles.draftActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.loadButton]}
                  onPress={() => loadDraftHandler(draft)}
                >
                  <Text style={styles.actionButtonText}>📂 Cargar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteDraft(draft.id)}
                >
                  <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// Exportar función auxiliar para guardar borradores desde otros componentes
export async function saveDraftFromForm(
  type: 'training' | 'match',
  data: Partial<Training | Match>
): Promise<void> {
  const drafts = await getItem<Draft[]>(DRAFTS_KEY) || [];
  
  const newDraft: Draft = {
    id: Date.now().toString(),
    type,
    data,
    createdAt: new Date().toISOString()
  };

  const updatedDrafts = [...drafts, newDraft];
  await setItem(DRAFTS_KEY, updatedDrafts);
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  toggleButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155'
  },
  draftsContainer: {
    maxHeight: 400,
    marginTop: 12
  },
  draftCard: {
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE047',
    borderWidth: 1
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  draftType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E'
  },
  draftDate: {
    fontSize: 11,
    color: '#78716C'
  },
  draftSummary: {
    fontSize: 13,
    color: '#57534E',
    marginBottom: 12,
    lineHeight: 18
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4
  },
  progressText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 12
  },
  draftActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  loadButton: {
    backgroundColor: '#3B82F6'
  },
  deleteButton: {
    backgroundColor: '#EF4444'
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});