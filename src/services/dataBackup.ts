/**
 * Data Backup and Restore Service
 *
 * Provides functionality to export all app data to JSON and import it back.
 * Useful for user backups, data migration, and disaster recovery.
 */

import { Platform } from 'react-native';
import { Match, Training } from '@/types';
import { UserProfile, SyncMetadata } from '@/types/user';
import { matchSchema, trainingSchema, userProfileSchema, syncMetadataSchema } from '@/schemas';
import { logger } from './logger';
import { getDeviceId } from './userManager';
import { z } from 'zod';

export interface BackupData {
  version: string;
  exportDate: string;
  user: UserProfile;
  sync: SyncMetadata;
  matches: Match[];
  trainings: Training[];
}

const BACKUP_VERSION = '2.0.0';

/**
 * Schema for validating backup data structure
 */
const backupDataSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  user: userProfileSchema,
  sync: syncMetadataSchema,
  matches: z.array(matchSchema),
  trainings: z.array(trainingSchema),
});

/**
 * Export all data to JSON format
 */
export async function exportData(
  user: UserProfile,
  matches: Match[],
  trainings: Training[]
): Promise<BackupData> {
  const deviceId = await getDeviceId();
  const exportDate = new Date().toISOString();

  const backupData: BackupData = {
    version: BACKUP_VERSION,
    exportDate,
    user: {
      ...user,
      lastSyncAt: exportDate,
      deviceId,
    },
    sync: {
      version: BACKUP_VERSION,
      exportDate,
      deviceId,
      userId: user.id,
      dataCount: {
        matches: matches.length,
        trainings: trainings.length,
      },
    },
    matches,
    trainings,
  };

  logger.info('Data exported', {
    userId: user.id,
    matchCount: matches.length,
    trainingCount: trainings.length,
    deviceId,
  });

  return backupData;
}

/**
 * Download exported data as JSON file (web only for now)
 */
export async function downloadBackup(
  user: UserProfile,
  matches: Match[],
  trainings: Training[]
): Promise<void> {
  try {
    const backupData = await exportData(user, matches, trainings);
    const jsonString = JSON.stringify(backupData, null, 2);
    const filename = `${user.name.replace(/\s+/g, '-')}-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      // Web: Create blob and trigger download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.action('Data backup downloaded (web)', { filename });
    } else {
      // Native: For now, return the JSON string
      // TODO: Implement native file sharing with expo-file-system
      logger.warn('Native backup download not yet implemented');
      throw new Error(
        'Export is currently only available on web. Use the PWA version to export your data.'
      );
    }
  } catch (error) {
    logger.error('Failed to download backup', error as Error);
    throw new Error('Failed to export data. Please try again.');
  }
}

/**
 * Import data from JSON string with validation
 */
export async function importData(jsonString: string): Promise<BackupData> {
  try {
    // Parse JSON
    const parsedData = JSON.parse(jsonString);

    // Validate structure
    const validatedData = backupDataSchema.parse(parsedData);

    logger.info('Data imported and validated', {
      version: validatedData.version,
      matchCount: validatedData.matches.length,
      trainingCount: validatedData.trainings.length,
    });

    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid backup data structure', error, {
        errors: error.errors,
      });
      throw new Error(
        `Invalid backup file format: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }

    if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in backup file', error);
      throw new Error('Invalid backup file: not valid JSON');
    }

    logger.error('Failed to import data', error as Error);
    throw new Error('Failed to import data. Please check the file and try again.');
  }
}

/**
 * Upload and restore data from file (web)
 */
export async function uploadAndRestoreWeb(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const backupData = await importData(jsonString);
        resolve(backupData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      const error = new Error('Failed to read file');
      logger.error('File read error', error);
      reject(error);
    };

    reader.readAsText(file);
  });
}

/**
 * Get human-readable summary of backup data
 */
export function getBackupSummary(backup: BackupData): string {
  const exportDate = new Date(backup.exportDate).toLocaleDateString();
  return `
Usuario: ${backup.user.name}
${backup.user.email ? `Email: ${backup.user.email}` : ''}
Fecha de exportación: ${exportDate}
Dispositivo: ${backup.sync.deviceId.substring(0, 8)}...
Partidos: ${backup.matches.length}
Entrenamientos: ${backup.trainings.length}
  `.trim();
}

/**
 * Merge imported data with existing data (optional deduplication)
 */
export function mergeData(
  existing: { matches: Match[]; trainings: Training[] },
  imported: BackupData,
  options: { replace: boolean } = { replace: false }
): { matches: Match[]; trainings: Training[] } {
  if (options.replace) {
    // Replace: Use only imported data
    return {
      matches: imported.matches,
      trainings: imported.trainings,
    };
  }

  // Merge: Combine and deduplicate by ID
  const mergedMatches = [...existing.matches];
  const existingMatchIds = new Set(existing.matches.map((m) => m.id));

  for (const match of imported.matches) {
    if (!existingMatchIds.has(match.id)) {
      mergedMatches.push(match);
    }
  }

  const mergedTrainings = [...existing.trainings];
  const existingTrainingIds = new Set(existing.trainings.map((t) => t.id));

  for (const training of imported.trainings) {
    if (!existingTrainingIds.has(training.id)) {
      mergedTrainings.push(training);
    }
  }

  logger.info('Data merged', {
    totalMatches: mergedMatches.length,
    totalTrainings: mergedTrainings.length,
    newMatches: mergedMatches.length - existing.matches.length,
    newTrainings: mergedTrainings.length - existing.trainings.length,
  });

  return {
    matches: mergedMatches,
    trainings: mergedTrainings,
  };
}
