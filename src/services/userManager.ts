/**
 * User Manager Service
 *
 * Manages user profiles, conflict detection, and data merge strategies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues()
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, DataConflict, MergeStrategy, ImportResult } from '@/types/user';
import { Match, Training } from '@/types';
import { userProfileSchema } from '@/schemas';
import { logger } from './logger';

const USERS_STORAGE_KEY = 'padelbrain-users';
const ACTIVE_USER_KEY = 'padelbrain-active-user';
const DEVICE_ID_KEY = 'padelbrain-device-id';

/**
 * Get or create device ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = uuidv4();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      logger.info('Device ID created', { deviceId });
    }
    return deviceId;
  } catch (error) {
    logger.error('Failed to get device ID', error as Error);
    return uuidv4(); // Fallback
  }
}

/**
 * Get all user profiles
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  try {
    const json = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!json) return [];

    const profiles = JSON.parse(json) as UserProfile[];
    // Validate each profile
    return profiles.filter((p) => {
      try {
        userProfileSchema.parse(p);
        return true;
      } catch {
        logger.warn('Invalid user profile found', { profileId: p.id });
        return false;
      }
    });
  } catch (error) {
    logger.error('Failed to get user profiles', error as Error);
    return [];
  }
}

/**
 * Save user profiles
 */
async function saveProfiles(profiles: UserProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(profiles));
    logger.debug('User profiles saved', { count: profiles.length });
  } catch (error) {
    logger.error('Failed to save user profiles', error as Error);
    throw error;
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(
  name: string,
  email?: string,
  avatar?: string
): Promise<UserProfile> {
  try {
    const profile: UserProfile = {
      id: uuidv4(),
      name: name.trim(),
      email: email?.trim(),
      avatar,
      createdAt: new Date().toISOString(),
      deviceId: await getDeviceId(),
    };

    // Validate
    userProfileSchema.parse(profile);

    // Save
    const profiles = await getAllProfiles();
    profiles.push(profile);
    await saveProfiles(profiles);

    logger.info('User profile created', { userId: profile.id, name: profile.name });
    return profile;
  } catch (error) {
    logger.error('Failed to create user profile', error as Error);
    throw new Error('No se pudo crear el perfil de usuario');
  }
}

/**
 * Get active user
 */
export async function getActiveUser(): Promise<UserProfile | null> {
  try {
    const userId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
    if (!userId) return null;

    const profiles = await getAllProfiles();
    return profiles.find((p) => p.id === userId) || null;
  } catch (error) {
    logger.error('Failed to get active user', error as Error);
    return null;
  }
}

/**
 * Set active user
 */
export async function setActiveUser(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_USER_KEY, userId);
    logger.info('Active user set', { userId });
  } catch (error) {
    logger.error('Failed to set active user', error as Error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const profiles = await getAllProfiles();
    const index = profiles.findIndex((p) => p.id === userId);

    if (index === -1) {
      throw new Error('User profile not found');
    }

    profiles[index] = { ...profiles[index], ...updates };
    await saveProfiles(profiles);

    logger.info('User profile updated', { userId });
    return profiles[index];
  } catch (error) {
    logger.error('Failed to update user profile', error as Error);
    throw error;
  }
}

/**
 * Delete user profile
 */
export async function deleteProfile(userId: string): Promise<void> {
  try {
    const profiles = await getAllProfiles();
    const filtered = profiles.filter((p) => p.id !== userId);

    if (filtered.length === profiles.length) {
      throw new Error('User profile not found');
    }

    await saveProfiles(filtered);

    // If was active user, clear it
    const activeUserId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
    if (activeUserId === userId) {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
    }

    logger.info('User profile deleted', { userId });
  } catch (error) {
    logger.error('Failed to delete user profile', error as Error);
    throw error;
  }
}

/**
 * Detect conflicts between local and remote data
 */
export function detectConflicts(
  localMatches: Match[],
  localTrainings: Training[],
  remoteMatches: Match[],
  remoteTrainings: Training[]
): DataConflict[] {
  const conflicts: DataConflict[] = [];

  // Check matches conflicts
  const localMatchIds = new Set(localMatches.map((m) => m.id));
  const remoteMatchIds = new Set(remoteMatches.map((m) => m.id));

  const onlyInLocal = localMatches.filter((m) => !remoteMatchIds.has(m.id)).map((m) => m.id);
  const onlyInRemote = remoteMatches.filter((m) => !localMatchIds.has(m.id)).map((m) => m.id);

  // Check modified items (same ID but different data)
  const modified: string[] = [];
  localMatches.forEach((localMatch) => {
    const remoteMatch = remoteMatches.find((m) => m.id === localMatch.id);
    if (remoteMatch) {
      // Simple comparison: check if dates are different
      if (localMatch.date !== remoteMatch.date) {
        modified.push(localMatch.id);
      }
    }
  });

  if (onlyInLocal.length > 0 || onlyInRemote.length > 0 || modified.length > 0) {
    conflicts.push({
      type: 'matches',
      local: {
        count: localMatches.length,
        lastModified:
          localMatches.length > 0
            ? localMatches.sort((a, b) => b.date.localeCompare(a.date))[0].date
            : new Date().toISOString(),
        items: localMatches.map((m) => ({ id: m.id, date: m.date })),
      },
      remote: {
        count: remoteMatches.length,
        lastModified:
          remoteMatches.length > 0
            ? remoteMatches.sort((a, b) => b.date.localeCompare(a.date))[0].date
            : new Date().toISOString(),
        items: remoteMatches.map((m) => ({ id: m.id, date: m.date })),
      },
      conflicts: {
        onlyInLocal,
        onlyInRemote,
        modified,
      },
    });
  }

  // Check trainings conflicts (same logic)
  const localTrainingIds = new Set(localTrainings.map((t) => t.id));
  const remoteTrainingIds = new Set(remoteTrainings.map((t) => t.id));

  const onlyInLocalTrainings = localTrainings
    .filter((t) => !remoteTrainingIds.has(t.id))
    .map((t) => t.id);
  const onlyInRemoteTrainings = remoteTrainings
    .filter((t) => !localTrainingIds.has(t.id))
    .map((t) => t.id);

  const modifiedTrainings: string[] = [];
  localTrainings.forEach((localTraining) => {
    const remoteTraining = remoteTrainings.find((t) => t.id === localTraining.id);
    if (remoteTraining) {
      if (localTraining.date !== remoteTraining.date) {
        modifiedTrainings.push(localTraining.id);
      }
    }
  });

  if (
    onlyInLocalTrainings.length > 0 ||
    onlyInRemoteTrainings.length > 0 ||
    modifiedTrainings.length > 0
  ) {
    conflicts.push({
      type: 'trainings',
      local: {
        count: localTrainings.length,
        lastModified:
          localTrainings.length > 0
            ? localTrainings.sort((a, b) => b.date.localeCompare(a.date))[0].date
            : new Date().toISOString(),
        items: localTrainings.map((t) => ({ id: t.id, date: t.date })),
      },
      remote: {
        count: remoteTrainings.length,
        lastModified:
          remoteTrainings.length > 0
            ? remoteTrainings.sort((a, b) => b.date.localeCompare(a.date))[0].date
            : new Date().toISOString(),
        items: remoteTrainings.map((t) => ({ id: t.id, date: t.date })),
      },
      conflicts: {
        onlyInLocal: onlyInLocalTrainings,
        onlyInRemote: onlyInRemoteTrainings,
        modified: modifiedTrainings,
      },
    });
  }

  return conflicts;
}

/**
 * Merge data according to strategy
 */
export function mergeData(
  localMatches: Match[],
  localTrainings: Training[],
  remoteMatches: Match[],
  remoteTrainings: Training[],
  strategy: MergeStrategy
): { matches: Match[]; trainings: Training[]; changes: ImportResult['changes'] } {
  const changes: ImportResult['changes'] = {
    matchesAdded: 0,
    matchesUpdated: 0,
    matchesSkipped: 0,
    trainingsAdded: 0,
    trainingsUpdated: 0,
    trainingsSkipped: 0,
  };

  let resultMatches: Match[] = [];
  let resultTrainings: Training[] = [];

  switch (strategy) {
    case 'use-local':
      // Keep local data, ignore remote
      resultMatches = localMatches;
      resultTrainings = localTrainings;
      changes.matchesSkipped = remoteMatches.length;
      changes.trainingsSkipped = remoteTrainings.length;
      break;

    case 'use-remote':
      // Replace all with remote data
      resultMatches = remoteMatches;
      resultTrainings = remoteTrainings;
      changes.matchesAdded = remoteMatches.length;
      changes.trainingsAdded = remoteTrainings.length;
      break;

    case 'merge-smart': {
      // Merge intelligently: use most recent version per item
      const matchesMap = new Map<string, Match>();

      // Add local matches
      localMatches.forEach((m) => matchesMap.set(m.id, m));

      // Update with remote if more recent
      remoteMatches.forEach((remote) => {
        const local = matchesMap.get(remote.id);
        if (!local) {
          matchesMap.set(remote.id, remote);
          changes.matchesAdded++;
        } else if (remote.date > local.date) {
          matchesMap.set(remote.id, remote);
          changes.matchesUpdated++;
        } else {
          changes.matchesSkipped++;
        }
      });

      resultMatches = Array.from(matchesMap.values());

      // Same for trainings
      const trainingsMap = new Map<string, Training>();
      localTrainings.forEach((t) => trainingsMap.set(t.id, t));

      remoteTrainings.forEach((remote) => {
        const local = trainingsMap.get(remote.id);
        if (!local) {
          trainingsMap.set(remote.id, remote);
          changes.trainingsAdded++;
        } else if (remote.date > local.date) {
          trainingsMap.set(remote.id, remote);
          changes.trainingsUpdated++;
        } else {
          changes.trainingsSkipped++;
        }
      });

      resultTrainings = Array.from(trainingsMap.values());
      break;
    }

    case 'keep-both':
      // Keep all data from both sources
      // For duplicates, keep both versions
      resultMatches = [...localMatches];
      resultTrainings = [...localTrainings];

      remoteMatches.forEach((remote) => {
        const exists = localMatches.find((m) => m.id === remote.id);
        if (!exists) {
          resultMatches.push(remote);
          changes.matchesAdded++;
        } else {
          // Keep both - remote data is already preserved in local
          changes.matchesSkipped++;
        }
      });

      remoteTrainings.forEach((remote) => {
        const exists = localTrainings.find((t) => t.id === remote.id);
        if (!exists) {
          resultTrainings.push(remote);
          changes.trainingsAdded++;
        } else {
          changes.trainingsSkipped++;
        }
      });
      break;

    default:
      // Default to keep-both
      resultMatches = [...localMatches, ...remoteMatches];
      resultTrainings = [...localTrainings, ...remoteTrainings];
  }

  return {
    matches: resultMatches,
    trainings: resultTrainings,
    changes,
  };
}
