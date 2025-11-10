/**
 * User Profile Types
 *
 * Defines user profile structure and sync metadata
 */

export interface UserProfile {
  id: string; // UUID único del usuario
  name: string;
  email?: string;
  avatar?: string; // Color hex o emoji
  createdAt: string; // ISO date
  lastSyncAt?: string; // Última vez que se exportó/importó
  deviceId?: string; // ID del último dispositivo usado
}

/**
 * Metadata de sincronización para detectar conflictos
 */
export interface SyncMetadata {
  version: string; // Versión del backup (ej: "2.0.0")
  exportDate: string; // Cuándo se exportó
  deviceId: string; // Desde qué dispositivo
  userId: string; // ID del usuario
  dataCount: {
    matches: number;
    trainings: number;
  };
  // Hash de los datos para detección rápida de cambios
  dataHash?: string;
}

/**
 * Conflicto detectado durante importación
 */
export interface DataConflict {
  type: 'matches' | 'trainings';
  local: {
    count: number;
    lastModified: string;
    items: Array<{ id: string; date: string }>;
  };
  remote: {
    count: number;
    lastModified: string;
    items: Array<{ id: string; date: string }>;
  };
  conflicts: {
    onlyInLocal: string[]; // IDs solo en dispositivo actual
    onlyInRemote: string[]; // IDs solo en backup
    modified: string[]; // IDs que existen en ambos pero son diferentes
  };
}

/**
 * Estrategias de resolución de conflictos
 */
export type MergeStrategy =
  | 'keep-both' // Mantener ambos (renombrar duplicados)
  | 'use-local' // Mantener datos locales, ignorar importación
  | 'use-remote' // Reemplazar todo con datos del backup
  | 'merge-smart' // Fusión inteligente (más reciente gana)
  | 'manual'; // Usuario decide caso por caso

/**
 * Resultado de importación
 */
export interface ImportResult {
  success: boolean;
  userId: string;
  userName: string;
  strategy: MergeStrategy;
  changes: {
    matchesAdded: number;
    matchesUpdated: number;
    matchesSkipped: number;
    trainingsAdded: number;
    trainingsUpdated: number;
    trainingsSkipped: number;
  };
  conflicts?: DataConflict[];
}
