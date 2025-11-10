import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, Training } from '@/types';
import { logger } from '@/services/logger';

interface DataState {
  // Active user context
  activeUserId: string | null;

  // Data
  matches: Match[];
  trainings: Training[];

  // Loading states
  isLoadingMatches: boolean;
  isLoadingTrainings: boolean;

  // Error states
  matchesError: string | null;
  trainingsError: string | null;

  // User context actions
  setActiveUser: (_userId: string | null) => Promise<void>;

  // Match actions
  loadMatches: () => Promise<void>;
  addMatch: (_match: Match) => Promise<void>;
  updateMatch: (_id: string, _partial: Partial<Match>) => Promise<void>;
  removeMatch: (_id: string) => Promise<void>;

  // Training actions
  loadTrainings: () => Promise<void>;
  addTraining: (_training: Training) => Promise<void>;
  updateTraining: (_id: string, _partial: Partial<Training>) => Promise<void>;
  removeTraining: (_id: string) => Promise<void>;

  // Utility
  clearErrors: () => void;
  reset: () => void;
}

/**
 * Get storage key for user-specific data
 */
const getStorageKey = (userId: string): string => {
  return `padelbrain-data-${userId}`;
};

/**
 * Load data for a specific user from AsyncStorage
 */
const loadUserData = async (
  userId: string
): Promise<{ matches: Match[]; trainings: Training[] }> => {
  try {
    const key = getStorageKey(userId);
    const json = await AsyncStorage.getItem(key);

    if (json) {
      const data = JSON.parse(json);
      return {
        matches: data.matches || [],
        trainings: data.trainings || [],
      };
    }

    // Try legacy migration for first-time users
    const legacyMatches = await AsyncStorage.getItem('matches');
    const legacyTrainings = await AsyncStorage.getItem('trainings');

    if (legacyMatches || legacyTrainings) {
      const matches = legacyMatches ? JSON.parse(legacyMatches) : [];
      const trainings = legacyTrainings ? JSON.parse(legacyTrainings) : [];

      // Save to new format
      await AsyncStorage.setItem(key, JSON.stringify({ matches, trainings }));

      // Clean up legacy keys
      await AsyncStorage.removeItem('matches');
      await AsyncStorage.removeItem('trainings');
      await AsyncStorage.removeItem('padelbrain-storage');

      logger.info('Migrated legacy data to user-specific storage', { userId });

      return { matches, trainings };
    }

    return { matches: [], trainings: [] };
  } catch (error) {
    logger.error('Failed to load user data', error as Error, { userId });
    return { matches: [], trainings: [] };
  }
};

/**
 * Save data for a specific user to AsyncStorage
 */
const saveUserData = async (
  userId: string,
  matches: Match[],
  trainings: Training[]
): Promise<void> => {
  try {
    const key = getStorageKey(userId);
    const data = { matches, trainings };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.error('Failed to save user data', error as Error, { userId });
    throw error;
  }
};

// Helper to handle async operations with error handling
const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  setError: (_error: string | null) => void
): Promise<T | null> => {
  try {
    setError(null);
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError(message);
    logger.error('Store error', error as Error);
    return null;
  }
};

export const useDataStore = create<DataState>()((set, get) => ({
  // Initial state
  activeUserId: null,
  matches: [],
  trainings: [],
  isLoadingMatches: false,
  isLoadingTrainings: false,
  matchesError: null,
  trainingsError: null,

  // User context actions
  setActiveUser: async (userId: string | null) => {
    if (!userId) {
      // Clear data when no user is active
      set({
        activeUserId: null,
        matches: [],
        trainings: [],
        matchesError: null,
        trainingsError: null,
      });
      return;
    }

    try {
      // Load data for the new user
      const { matches, trainings } = await loadUserData(userId);
      set({
        activeUserId: userId,
        matches,
        trainings,
        matchesError: null,
        trainingsError: null,
      });

      logger.info('Switched to user data', {
        userId,
        matchCount: matches.length,
        trainingCount: trainings.length,
      });
    } catch (error) {
      logger.error('Failed to switch user', error as Error, { userId });
      throw error;
    }
  },

  // Match actions
  loadMatches: async () => {
    const { activeUserId } = get();
    if (!activeUserId) {
      logger.warn('Cannot load matches: no active user');
      return;
    }

    set({ isLoadingMatches: true });
    await withErrorHandling(
      async () => {
        const { matches } = await loadUserData(activeUserId);
        set({ matches, isLoadingMatches: false });
      },
      (error) => set({ matchesError: error, isLoadingMatches: false })
    );
  },

  addMatch: async (match: Match) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot add match: no active user');
    }

    await withErrorHandling(
      async () => {
        // Basic validation
        if (!match.id || !match.date) {
          throw new Error('Match must have id and date');
        }

        const newMatches = [...get().matches, match];
        set({ matches: newMatches });

        // Auto-save
        await saveUserData(activeUserId, newMatches, get().trainings);
      },
      (error) => set({ matchesError: error })
    );
  },

  updateMatch: async (id: string, partial: Partial<Match>) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot update match: no active user');
    }

    await withErrorHandling(
      async () => {
        const matches = get().matches;
        const index = matches.findIndex((m) => m.id === id);

        if (index === -1) {
          throw new Error(`Match with ID ${id} not found`);
        }

        const updated = [...matches];
        updated[index] = { ...updated[index], ...partial };
        set({ matches: updated });

        // Auto-save
        await saveUserData(activeUserId, updated, get().trainings);
      },
      (error) => set({ matchesError: error })
    );
  },

  removeMatch: async (id: string) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot remove match: no active user');
    }

    await withErrorHandling(
      async () => {
        const newMatches = get().matches.filter((m) => m.id !== id);
        set({ matches: newMatches });

        // Auto-save
        await saveUserData(activeUserId, newMatches, get().trainings);
      },
      (error) => set({ matchesError: error })
    );
  },

  // Training actions
  loadTrainings: async () => {
    const { activeUserId } = get();
    if (!activeUserId) {
      logger.warn('Cannot load trainings: no active user');
      return;
    }

    set({ isLoadingTrainings: true });
    await withErrorHandling(
      async () => {
        const { trainings } = await loadUserData(activeUserId);
        set({ trainings, isLoadingTrainings: false });
      },
      (error) => set({ trainingsError: error, isLoadingTrainings: false })
    );
  },

  addTraining: async (training: Training) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot add training: no active user');
    }

    await withErrorHandling(
      async () => {
        // Basic validation
        if (!training.id || !training.date) {
          throw new Error('Training must have id and date');
        }

        const newTrainings = [...get().trainings, training];
        set({ trainings: newTrainings });

        // Auto-save
        await saveUserData(activeUserId, get().matches, newTrainings);
      },
      (error) => set({ trainingsError: error })
    );
  },

  updateTraining: async (id: string, partial: Partial<Training>) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot update training: no active user');
    }

    await withErrorHandling(
      async () => {
        const trainings = get().trainings;
        const index = trainings.findIndex((t) => t.id === id);

        if (index === -1) {
          throw new Error(`Training with ID ${id} not found`);
        }

        const updated = [...trainings];
        updated[index] = { ...updated[index], ...partial };
        set({ trainings: updated });

        // Auto-save
        await saveUserData(activeUserId, get().matches, updated);
      },
      (error) => set({ trainingsError: error })
    );
  },

  removeTraining: async (id: string) => {
    const { activeUserId } = get();
    if (!activeUserId) {
      throw new Error('Cannot remove training: no active user');
    }

    await withErrorHandling(
      async () => {
        const newTrainings = get().trainings.filter((t) => t.id !== id);
        set({ trainings: newTrainings });

        // Auto-save
        await saveUserData(activeUserId, get().matches, newTrainings);
      },
      (error) => set({ trainingsError: error })
    );
  },

  // Utility
  clearErrors: () => {
    set({ matchesError: null, trainingsError: null });
  },

  reset: () => {
    set({
      activeUserId: null,
      matches: [],
      trainings: [],
      isLoadingMatches: false,
      isLoadingTrainings: false,
      matchesError: null,
      trainingsError: null,
    });
  },
}));
