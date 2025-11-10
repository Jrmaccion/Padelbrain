/**
 * Profile Screen
 *
 * User profile management with export/import, editing, and stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useResponsive } from '@/constants/layout';
import { useUserStore } from '@/store/useUserStore';
import { useDataStore } from '@/store/useDataStore';
import { downloadBackup, uploadAndRestoreWeb, BackupData } from '@/services/dataBackup';
import { ConflictResolutionModal } from '@/components/profile/ConflictResolutionModal';
import { logger } from '@/services/logger';
import type { MergeStrategy, DataConflict } from '@/types/user';

export function ProfileScreen() {
  const { layout } = useResponsive();
  const { activeUser, signOut, importProfile } = useUserStore();
  const { matches, trainings } = useDataStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (!activeUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay usuario activo</Text>
      </View>
    );
  }

  const isEmoji = activeUser.avatar && activeUser.avatar.length <= 2;
  const isColor = activeUser.avatar && activeUser.avatar.startsWith('#');

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      await downloadBackup(activeUser, matches, trainings);
      setSuccessMessage('✅ Backup exportado correctamente');
      logger.action('User exported backup', {
        userId: activeUser.id,
        matchCount: matches.length,
        trainingCount: trainings.length,
      });
    } catch (error) {
      logger.error('Failed to export backup', error as Error);
      setErrorMessage((error as Error).message || 'Error al exportar el backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        if (file) {
          try {
            setErrorMessage(null);
            const backupData = await uploadAndRestoreWeb(file);

            // Check if importing to the same user
            if (backupData.user.id !== activeUser.id) {
              setErrorMessage('El backup pertenece a otro usuario. Cierra sesión para importarlo.');
              return;
            }

            // Check for conflicts
            const detectedConflicts = await importProfile(backupData, 'detect-only');

            if (detectedConflicts && detectedConflicts.length > 0) {
              setConflicts(detectedConflicts);
              setPendingImport(backupData);
              setShowConflictModal(true);
            } else {
              // No conflicts, import directly
              await importProfile(backupData, 'merge-smart');
              setSuccessMessage('✅ Backup importado correctamente');
            }
          } catch (error) {
            logger.error('Failed to import backup', error as Error);
            setErrorMessage((error as Error).message || 'Error al importar el backup');
          }
        }
      };
      input.click();
    } else {
      setErrorMessage('La importación solo está disponible en la versión web por ahora');
    }
  };

  const handleResolveConflicts = async (strategy: MergeStrategy) => {
    if (!pendingImport) return;

    try {
      await importProfile(pendingImport, strategy);
      setShowConflictModal(false);
      setPendingImport(null);
      setConflicts([]);
      setSuccessMessage('✅ Datos sincronizados correctamente');
    } catch (error) {
      logger.error('Failed to resolve conflicts', error as Error);
      setErrorMessage('Error al resolver conflictos');
    }
  };

  const handleCancelConflictResolution = () => {
    setShowConflictModal(false);
    setPendingImport(null);
    setConflicts([]);
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesión y volver a la selección de perfiles?')) {
        signOut();
      }
    } else {
      Alert.alert('Cerrar Sesión', '¿Cerrar sesión y volver a la selección de perfiles?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const lastSyncDate = activeUser.lastSyncAt
    ? new Date(activeUser.lastSyncAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Nunca';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: layout.getPaddingHorizontal() },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity onPress={() => setSuccessMessage(null)}>
              <Text style={styles.bannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setErrorMessage(null)}>
              <Text style={styles.bannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatar,
              isColor && { backgroundColor: activeUser.avatar },
              !isColor && styles.avatarDefault,
            ]}
          >
            {isEmoji ? (
              <Text style={styles.avatarEmoji}>{activeUser.avatar}</Text>
            ) : (
              <Text style={styles.avatarInitial}>{activeUser.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{activeUser.name}</Text>
            {activeUser.email && <Text style={styles.profileEmail}>{activeUser.email}</Text>}
            <Text style={styles.profileSync}>Última sincronización: {lastSyncDate}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🏆</Text>
            </View>
            <Text style={styles.statValue}>{matches.length}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🎾</Text>
            </View>
            <Text style={styles.statValue}>{trainings.length}</Text>
            <Text style={styles.statLabel}>Entrenamientos</Text>
          </View>
        </View>

        {/* Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup y Sincronización</Text>
          <Text style={styles.sectionDescription}>
            Exporta tus datos para hacer un respaldo o importa desde otro dispositivo
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, isExporting && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.8}
          >
            {isExporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>📤</Text>
                <Text style={styles.buttonText}>Exportar Backup</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleImport}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>📥</Text>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Importar Backup</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>👋</Text>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Device Info */}
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoTitle}>Información del Dispositivo</Text>
          {activeUser.deviceId && (
            <Text style={styles.deviceInfoText}>ID: {activeUser.deviceId.substring(0, 8)}...</Text>
          )}
          <Text style={styles.deviceInfoText}>
            Perfil creado: {new Date(activeUser.createdAt).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </ScrollView>

      {/* Conflict Resolution Modal */}
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
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
  bannerClose: {
    fontSize: 20,
    color: '#065F46',
    paddingHorizontal: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarDefault: {
    backgroundColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  profileSync: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  deviceInfo: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  deviceInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  deviceInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
