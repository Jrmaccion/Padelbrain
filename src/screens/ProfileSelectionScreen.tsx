/**
 * Profile Selection Screen
 *
 * Initial screen where users select or create their profile.
 * Optimized for a seamless onboarding experience.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useResponsive } from '@/constants/layout';
import { useUserStore } from '@/store/useUserStore';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CreateProfileModal } from '@/components/profile/CreateProfileModal';
import { ConflictResolutionModal } from '@/components/profile/ConflictResolutionModal';
import { uploadAndRestoreWeb, BackupData } from '@/services/dataBackup';
import { logger } from '@/services/logger';
import type { MergeStrategy, DataConflict } from '@/types/user';

export function ProfileSelectionScreen() {
  const { layout } = useResponsive();
  const { allProfiles, loadProfiles, switchUser, createNewProfile, importProfile } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles()
      .catch((error) => {
        logger.error('Failed to load profiles', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadProfiles]);

  const handleProfileSelect = async (profileId: string) => {
    try {
      await switchUser(profileId);
      // Navigation will be handled by App.tsx when activeUser changes
    } catch (error) {
      logger.error('Failed to switch user', error as Error);
    }
  };

  const handleCreateProfile = async (name: string, email: string, avatar: string) => {
    try {
      await createNewProfile(name, email, avatar);
      setShowCreateModal(false);
    } catch (error) {
      logger.error('Failed to create profile', error as Error);
      throw error; // Let modal handle the error
    }
  };

  const handleImportPress = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        if (file) {
          try {
            setImportError(null);
            const backupData = await uploadAndRestoreWeb(file);

            // Check if profile already exists
            const existingProfile = allProfiles.find((p) => p.id === backupData.user.id);

            if (existingProfile) {
              // Profile exists - check for conflicts
              const detectedConflicts = await importProfile(backupData, 'detect-only');

              if (detectedConflicts && detectedConflicts.length > 0) {
                setConflicts(detectedConflicts);
                setPendingImport(backupData);
                setShowConflictModal(true);
              } else {
                // No conflicts, import directly
                await importProfile(backupData, 'merge-smart');
              }
            } else {
              // New profile, import directly
              await importProfile(backupData, 'merge-smart');
            }
          } catch (error) {
            logger.error('Failed to import backup', error as Error);
            setImportError((error as Error).message || 'Error al importar el backup');
          }
        }
      };
      input.click();
    } else {
      setImportError('La importación solo está disponible en la versión web por ahora');
    }
  };

  const handleResolveConflicts = async (strategy: MergeStrategy) => {
    if (!pendingImport) return;

    try {
      await importProfile(pendingImport, strategy);
      setShowConflictModal(false);
      setPendingImport(null);
      setConflicts([]);
    } catch (error) {
      logger.error('Failed to resolve conflicts', error as Error);
      setImportError('Error al resolver conflictos');
    }
  };

  const handleCancelConflictResolution = () => {
    setShowConflictModal(false);
    setPendingImport(null);
    setConflicts([]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfiles...</Text>
      </View>
    );
  }

  const isEmpty = allProfiles.length === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: layout.getPaddingHorizontal() }]}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandIcon}>🎾</Text>
          <Text style={styles.brandText}>PadelBrain</Text>
        </View>
        <Text style={styles.subtitle}>Selecciona tu perfil</Text>
      </View>

      {/* Error Message */}
      {importError && (
        <View style={[styles.errorBanner, { marginHorizontal: layout.getPaddingHorizontal() }]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{importError}</Text>
          <TouchableOpacity onPress={() => setImportError(null)}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
          </View>
          <Text style={styles.emptyTitle}>Bienvenido a PadelBrain</Text>
          <Text style={styles.emptyDescription}>
            Crea tu primer perfil o importa uno existente para comenzar a trackear tus partidos y
            entrenamientos
          </Text>

          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyCreateButtonText}>Crear Mi Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emptyImportButton}
            onPress={handleImportPress}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyImportButtonText}>📥 Importar Backup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={allProfiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProfileCard
                profile={item}
                onPress={() => handleProfileSelect(item.id)}
                showStats={false}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Floating Action Buttons */}
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.fabSecondary}
              onPress={handleImportPress}
              activeOpacity={0.8}
            >
              <Text style={styles.fabSecondaryText}>📥</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabPrimary}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.fabPrimaryText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modals */}
      <CreateProfileModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProfile}
      />

      <ConflictResolutionModal
        visible={showConflictModal}
        conflicts={conflicts}
        onResolve={handleResolveConflicts}
        onCancel={handleCancelConflictResolution}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  errorClose: {
    fontSize: 20,
    color: '#991B1B',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 400,
  },
  emptyCreateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyImportButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyImportButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  fabSecondaryText: {
    fontSize: 24,
  },
  fabPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPrimaryText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
