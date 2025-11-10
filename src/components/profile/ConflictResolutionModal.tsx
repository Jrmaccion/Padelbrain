/**
 * Conflict Resolution Modal
 *
 * Modal to help users resolve data conflicts when importing backups
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { DataConflict, MergeStrategy } from '@/types/user';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: DataConflict[];
  onResolve: (strategy: MergeStrategy) => Promise<void>;
  onCancel: () => void;
}

export function ConflictResolutionModal({
  visible,
  conflicts,
  onResolve,
  onCancel,
}: ConflictResolutionModalProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<MergeStrategy>('merge-smart');
  const [isLoading, setIsLoading] = useState(false);

  const strategies: Array<{
    value: MergeStrategy;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      value: 'merge-smart',
      label: 'Fusión Inteligente',
      description: 'Mantener la versión más reciente de cada dato. Los nuevos se añaden.',
      icon: '🤖',
    },
    {
      value: 'keep-both',
      label: 'Mantener Ambos',
      description: 'Conservar todos los datos de ambos dispositivos. Máxima seguridad.',
      icon: '🔄',
    },
    {
      value: 'use-local',
      label: 'Mantener Local',
      description: 'Ignorar el backup e mantener solo los datos de este dispositivo.',
      icon: '📱',
    },
    {
      value: 'use-remote',
      label: 'Usar Backup',
      description: 'Reemplazar todos los datos locales con los del backup.',
      icon: '☁️',
    },
  ];

  const handleResolve = async () => {
    setIsLoading(true);
    try {
      await onResolve(selectedStrategy);
    } finally {
      setIsLoading(false);
    }
  };

  const matchConflict = conflicts.find((c) => c.type === 'matches');
  const trainingConflict = conflicts.find((c) => c.type === 'trainings');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
              </View>
              <Text style={styles.title}>Conflicto Detectado</Text>
              <Text style={styles.subtitle}>
                Los datos del backup son diferentes a los de este dispositivo
              </Text>
            </View>

            {/* Conflict Details */}
            <View style={styles.details}>
              {matchConflict && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>🏆 Partidos</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Este dispositivo:</Text>
                    <Text style={styles.detailValue}>{matchConflict.local.count}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>En backup:</Text>
                    <Text style={styles.detailValue}>{matchConflict.remote.count}</Text>
                  </View>
                  {matchConflict.conflicts.onlyInLocal.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {matchConflict.conflicts.onlyInLocal.length} solo en este dispositivo
                    </Text>
                  )}
                  {matchConflict.conflicts.onlyInRemote.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {matchConflict.conflicts.onlyInRemote.length} solo en backup
                    </Text>
                  )}
                  {matchConflict.conflicts.modified.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {matchConflict.conflicts.modified.length} modificados en ambos
                    </Text>
                  )}
                </View>
              )}

              {trainingConflict && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>🎾 Entrenamientos</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Este dispositivo:</Text>
                    <Text style={styles.detailValue}>{trainingConflict.local.count}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>En backup:</Text>
                    <Text style={styles.detailValue}>{trainingConflict.remote.count}</Text>
                  </View>
                  {trainingConflict.conflicts.onlyInLocal.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {trainingConflict.conflicts.onlyInLocal.length} solo en este dispositivo
                    </Text>
                  )}
                  {trainingConflict.conflicts.onlyInRemote.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {trainingConflict.conflicts.onlyInRemote.length} solo en backup
                    </Text>
                  )}
                  {trainingConflict.conflicts.modified.length > 0 && (
                    <Text style={styles.detailInfo}>
                      • {trainingConflict.conflicts.modified.length} modificados en ambos
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Strategy Selection */}
            <View style={styles.strategies}>
              <Text style={styles.strategiesTitle}>¿Cómo quieres resolverlo?</Text>

              {strategies.map((strategy) => (
                <TouchableOpacity
                  key={strategy.value}
                  style={[
                    styles.strategyCard,
                    selectedStrategy === strategy.value && styles.strategyCardSelected,
                  ]}
                  onPress={() => setSelectedStrategy(strategy.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.strategyHeader}>
                    <Text style={styles.strategyIcon}>{strategy.icon}</Text>
                    <Text style={styles.strategyLabel}>{strategy.label}</Text>
                    {selectedStrategy === strategy.value && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.strategyDescription}>{strategy.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isLoading}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resolveButton, isLoading && styles.resolveButtonDisabled]}
                onPress={handleResolve}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resolveButtonText}>Continuar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  details: {
    padding: 16,
    gap: 12,
  },
  detailCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  detailInfo: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  strategies: {
    padding: 16,
  },
  strategiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  strategyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  strategyLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  strategyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  resolveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resolveButtonDisabled: {
    opacity: 0.6,
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
