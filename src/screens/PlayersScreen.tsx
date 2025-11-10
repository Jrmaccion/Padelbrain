/**
 * Players Screen
 *
 * Manage players (rivals and partners) with stats
 */

import { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import Header from '@/components/common/Header';
import SearchBar from '@/components/common/SearchBar';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useDataStore } from '@/store/useDataStore';
import { Player, PlayerStats } from '@/types';
import { useResponsive } from '@/constants/layout';
import { colors } from '@/constants/colors';
import { logger } from '@/services/logger';

export default function PlayersScreen() {
  const { deviceType } = useResponsive();
  const { players, loadPlayers, addPlayer, updatePlayer, deletePlayer, calculatePlayerStats } =
    usePlayersStore();
  const { matches } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rival' | 'partner'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!player.name.toLowerCase().includes(query)) return false;
      }

      // Type filter
      if (typeFilter !== 'all') {
        if (player.type === 'both') return true;
        if (player.type !== typeFilter) return false;
      }

      return true;
    });
  }, [players, searchQuery, typeFilter]);

  // Calculate stats for all players
  const playersWithStats = useMemo(() => {
    return filteredPlayers.map((player) => ({
      player,
      stats: calculatePlayerStats(player.id, matches),
    }));
  }, [filteredPlayers, matches, calculatePlayerStats]);

  // Sort by total matches
  const sortedPlayers = useMemo(() => {
    return playersWithStats.sort((a, b) => b.stats.totalMatches - a.stats.totalMatches);
  }, [playersWithStats]);

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setSelectedPlayer(null);
    setShowModal(true);
  };

  const handleDeletePlayer = async (player: Player) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar a ${player.name}?`)) {
        await deletePlayer(player.id);
        setSelectedPlayer(null);
      }
    } else {
      Alert.alert('Eliminar jugador', `¿Eliminar a ${player.name}?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deletePlayer(player.id);
            setSelectedPlayer(null);
          },
        },
      ]);
    }
  };

  const totalRivals = players.filter((p) => p.type === 'rival' || p.type === 'both').length;
  const totalPartners = players.filter((p) => p.type === 'partner' || p.type === 'both').length;

  return (
    <View style={styles.container}>
      <Header title="Jugadores" />

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
          <Text style={styles.addButtonText}>+ Nuevo Jugador</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Summary */}
        <View style={[styles.statsContainer, deviceType !== 'mobile' && styles.statsContainerWide]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{players.length}</Text>
            <Text style={styles.statLabel}>Total Jugadores</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRivals}</Text>
            <Text style={styles.statLabel}>Rivales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPartners}</Text>
            <Text style={styles.statLabel}>Compañeros</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar jugadores..."
          />

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'all' && styles.filterChipActive]}
              onPress={() => setTypeFilter('all')}
            >
              <Text
                style={[styles.filterChipText, typeFilter === 'all' && styles.filterChipTextActive]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'rival' && styles.filterChipActive]}
              onPress={() => setTypeFilter('rival')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === 'rival' && styles.filterChipTextActive,
                ]}
              >
                Rivales
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, typeFilter === 'partner' && styles.filterChipActive]}
              onPress={() => setTypeFilter('partner')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === 'partner' && styles.filterChipTextActive,
                ]}
              >
                Compañeros
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Players List */}
        {sortedPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No hay jugadores</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery
                ? 'No se encontraron jugadores con ese nombre'
                : 'Añade jugadores para trackear estadísticas'}
            </Text>
          </View>
        ) : (
          sortedPlayers.map(({ player, stats }) => (
            <PlayerCard
              key={player.id}
              player={player}
              stats={stats}
              onPress={() => setSelectedPlayer(player)}
            />
          ))
        )}
      </ScrollView>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedPlayer(null)}>
          <PlayerDetailView
            player={selectedPlayer}
            stats={calculatePlayerStats(selectedPlayer.id, matches)}
            onClose={() => setSelectedPlayer(null)}
            onEdit={() => handleEditPlayer(selectedPlayer)}
            onDelete={() => handleDeletePlayer(selectedPlayer)}
          />
        </Modal>
      )}

      {/* Add/Edit Player Modal */}
      {showModal && (
        <AddEditPlayerModal
          player={editingPlayer}
          onClose={() => {
            setShowModal(false);
            setEditingPlayer(null);
          }}
          onSave={async (data) => {
            try {
              if (editingPlayer) {
                await updatePlayer(editingPlayer.id, data);
              } else {
                await addPlayer(data);
              }
              setShowModal(false);
              setEditingPlayer(null);
            } catch (error) {
              logger.error('Failed to save player', error as Error);
              Alert.alert('Error', 'No se pudo guardar el jugador');
            }
          }}
        />
      )}
    </View>
  );
}

// Player Card Component
function PlayerCard({
  player,
  stats,
  onPress,
}: {
  player: Player;
  stats: PlayerStats;
  onPress: () => void;
}) {
  const typeLabel =
    player.type === 'both' ? 'Rival y Compañero' : player.type === 'rival' ? 'Rival' : 'Compañero';
  const typeEmoji = player.type === 'both' ? '🤝⚔️' : player.type === 'rival' ? '⚔️' : '🤝';

  return (
    <TouchableOpacity style={styles.playerCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.playerHeader}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerAvatarText}>
            {player.avatar || player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerType}>
            {typeEmoji} {typeLabel}
          </Text>
        </View>
      </View>

      {stats.totalMatches > 0 && (
        <View style={styles.playerStats}>
          {stats.matchesAgainst > 0 && (
            <View style={styles.statBlock}>
              <Text style={styles.statBlockLabel}>Contra {player.name}</Text>
              <Text
                style={[
                  styles.statBlockValue,
                  { color: stats.winRateAgainst >= 50 ? '#10B981' : '#EF4444' },
                ]}
              >
                {stats.winRateAgainst}%
              </Text>
              <Text style={styles.statBlockDetail}>
                {stats.winsAgainst}V - {stats.lossesAgainst}D
              </Text>
            </View>
          )}
          {stats.matchesWith > 0 && (
            <View style={styles.statBlock}>
              <Text style={styles.statBlockLabel}>Con {player.name}</Text>
              <Text
                style={[
                  styles.statBlockValue,
                  { color: stats.winRateWith >= 50 ? '#10B981' : '#EF4444' },
                ]}
              >
                {stats.winRateWith}%
              </Text>
              <Text style={styles.statBlockDetail}>
                {stats.winsWith}V - {stats.lossesWith}D
              </Text>
            </View>
          )}
        </View>
      )}

      {stats.totalMatches === 0 && (
        <Text style={styles.noMatchesText}>Sin partidos registrados</Text>
      )}
    </TouchableOpacity>
  );
}

// Player Detail View
function PlayerDetailView({
  player,
  stats,
  onClose,
  onEdit,
  onDelete,
}: {
  player: Player;
  stats: PlayerStats;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.modalHeaderActions}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.detailContainer}>
          {/* Player Info */}
          <View style={styles.detailHeader}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>
                {player.avatar || player.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.detailName}>{player.name}</Text>
            <Text style={styles.detailType}>
              {player.type === 'both'
                ? '🤝⚔️ Rival y Compañero'
                : player.type === 'rival'
                  ? '⚔️ Rival'
                  : '🤝 Compañero'}
            </Text>
          </View>

          {/* Stats Summary */}
          {stats.totalMatches > 0 && (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📊 Estadísticas Generales</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total partidos:</Text>
                  <Text style={styles.detailValue}>{stats.totalMatches}</Text>
                </View>
              </View>

              {stats.matchesAgainst > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>⚔️ Como Rival</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Partidos:</Text>
                    <Text style={styles.detailValue}>{stats.matchesAgainst}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Win Rate:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: stats.winRateAgainst >= 50 ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {stats.winRateAgainst}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Record:</Text>
                    <Text style={styles.detailValue}>
                      {stats.winsAgainst}V - {stats.lossesAgainst}D
                    </Text>
                  </View>
                  {stats.recentForm && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Forma reciente:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color:
                              stats.recentForm === 'hot'
                                ? '#10B981'
                                : stats.recentForm === 'cold'
                                  ? '#EF4444'
                                  : '#64748B',
                          },
                        ]}
                      >
                        {stats.recentForm === 'hot'
                          ? '🔥 En racha'
                          : stats.recentForm === 'cold'
                            ? '📉 Bajo'
                            : '➡️ Normal'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {stats.matchesWith > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>🤝 Como Compañero</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Partidos:</Text>
                    <Text style={styles.detailValue}>{stats.matchesWith}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Win Rate:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: stats.winRateWith >= 50 ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {stats.winRateWith}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Record:</Text>
                    <Text style={styles.detailValue}>
                      {stats.winsWith}V - {stats.lossesWith}D
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Player Details */}
          {(player.preferredPosition ||
            player.playStyle ||
            player.strengths ||
            player.weaknesses ||
            player.notes) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📝 Información Adicional</Text>
              {player.preferredPosition && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Posición preferida:</Text>
                  <Text style={styles.detailValue}>
                    {player.preferredPosition === 'right' ? 'Derecha' : 'Izquierda'}
                  </Text>
                </View>
              )}
              {player.playStyle && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estilo de juego:</Text>
                  <Text style={styles.detailValue}>{player.playStyle}</Text>
                </View>
              )}
              {player.strengths && player.strengths.length > 0 && (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Fortalezas:</Text>
                  <View style={styles.tagsContainer}>
                    {player.strengths.map((s, i) => (
                      <View key={i} style={styles.strengthTag}>
                        <Text style={styles.strengthText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {player.weaknesses && player.weaknesses.length > 0 && (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Debilidades:</Text>
                  <View style={styles.tagsContainer}>
                    {player.weaknesses.map((w, i) => (
                      <View key={i} style={styles.weaknessTag}>
                        <Text style={styles.weaknessText}>{w}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {player.notes && (
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Notas:</Text>
                  <Text style={styles.detailNotes}>{player.notes}</Text>
                </View>
              )}
            </View>
          )}

          {stats.totalMatches === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎾</Text>
              <Text style={styles.emptyTitle}>Sin partidos</Text>
              <Text style={styles.emptyMessage}>
                Aún no has jugado ningún partido con {player.name}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Add/Edit Player Modal
function AddEditPlayerModal({
  player,
  onClose,
  onSave,
}: {
  player: Player | null;
  onClose: () => void;
  onSave: (data: Omit<Player, 'id' | 'createdAt'>) => Promise<void>;
}) {
  const [name, setName] = useState(player?.name || '');
  const [type, setType] = useState<Player['type']>(player?.type || 'rival');
  const [notes, setNotes] = useState(player?.notes || '');
  const [avatar, setAvatar] = useState(player?.avatar || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    await onSave({
      name: name.trim(),
      type,
      notes: notes.trim() || undefined,
      avatar: avatar.trim() || undefined,
    });
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>✕ Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{player ? 'Editar Jugador' : 'Nuevo Jugador'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Nombre del jugador"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Tipo *</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'rival' && styles.typeButtonActive]}
                  onPress={() => setType('rival')}
                >
                  <Text
                    style={[styles.typeButtonText, type === 'rival' && styles.typeButtonTextActive]}
                  >
                    ⚔️ Rival
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'partner' && styles.typeButtonActive]}
                  onPress={() => setType('partner')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'partner' && styles.typeButtonTextActive,
                    ]}
                  >
                    🤝 Compañero
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'both' && styles.typeButtonActive]}
                  onPress={() => setType('both')}
                >
                  <Text
                    style={[styles.typeButtonText, type === 'both' && styles.typeButtonTextActive]}
                  >
                    🤝⚔️ Ambos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Avatar (emoji)</Text>
              <TextInput
                style={styles.formInput}
                value={avatar}
                onChangeText={setAvatar}
                placeholder="😀"
                placeholderTextColor="#94A3B8"
                maxLength={2}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Notas</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas sobre este jugador..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  content: { flex: 1, padding: 16 },

  // Stats
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statsContainerWide: { flexWrap: 'wrap' },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  // Search and Filter
  searchFilterContainer: { marginBottom: 16, gap: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },

  // Player Cards
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  playerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: { fontSize: 24, color: '#FFFFFF', fontWeight: '700' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  playerType: { fontSize: 13, color: '#64748B' },
  playerStats: { flexDirection: 'row', gap: 16 },
  statBlock: { flex: 1 },
  statBlockLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  statBlockValue: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  statBlockDetail: { fontSize: 11, color: '#94A3B8' },
  noMatchesText: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptyMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  backButtonText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  modalHeaderActions: { flexDirection: 'row', gap: 8 },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: { fontSize: 20 },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: { fontSize: 20 },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  saveButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { flex: 1, padding: 16 },

  // Detail View
  detailContainer: { gap: 16 },
  detailHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatarText: { fontSize: 40, color: '#FFFFFF', fontWeight: '700' },
  detailName: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  detailType: { fontSize: 16, color: '#64748B' },
  detailSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  detailBlock: { marginBottom: 12 },
  detailNotes: { fontSize: 14, color: '#475569', lineHeight: 20, marginTop: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  strengthTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  strengthText: { fontSize: 13, color: '#065F46', fontWeight: '600' },
  weaknessTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weaknessText: { fontSize: 13, color: '#991B1B', fontWeight: '600' },

  // Form
  formContainer: { gap: 20 },
  formField: { gap: 8 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  formTextArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  typeButtons: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  typeButtonTextActive: { color: '#FFFFFF' },
});
