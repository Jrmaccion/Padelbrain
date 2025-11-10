import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, Training } from '@/types';
import { logger } from '@/services/logger';

interface DataState {
  // Data
  matches: Match[];
  trainings: Training[];

  // Loading states
  isLoadingMatches: boolean;
  isLoadingTrainings: boolean;

  // Error states
  matchesError: string | null;
  trainingsError: string | null;

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

// Helper to handle async operations with error handling
const withErrorHandling = async <T,>(
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

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial state
      matches: [],
      trainings: [],
      isLoadingMatches: false,
      isLoadingTrainings: false,
      matchesError: null,
      trainingsError: null,

      // Match actions
      loadMatches: async () => {
        set({ isLoadingMatches: true });
        await withErrorHandling(
          async () => {
            // Rehydrate legacy storage if present and store is empty
            if (get().matches.length === 0) {
              const legacyJson = await AsyncStorage.getItem('matches');
              if (legacyJson) {
                try {
                  const legacyMatches = JSON.parse(legacyJson) as Match[];
                  set({ matches: legacyMatches });
                  await AsyncStorage.removeItem('matches');
                } catch (parseError) {
                  logger.error('Failed to migrate legacy matches', parseError as Error);
                }
              }
            }
            set({ isLoadingMatches: false });
          },
          (error) => set({ matchesError: error, isLoadingMatches: false })
        );
      },

      addMatch: async (match: Match) => {
        await withErrorHandling(
          async () => {
            // Basic validation
            if (!match.id || !match.date) {
              throw new Error('Match must have id and date');
            }

            const newMatches = [...get().matches, match];
            set({ matches: newMatches });
          },
          (error) => set({ matchesError: error })
        );
      },

      updateMatch: async (id: string, partial: Partial<Match>) => {
        await withErrorHandling(
          async () => {
            const matches = get().matches;
            const index = matches.findIndex(m => m.id === id);

            if (index === -1) {
              throw new Error(`Match with ID ${id} not found`);
            }

            const updated = [...matches];
            updated[index] = { ...updated[index], ...partial };
            set({ matches: updated });
          },
          (error) => set({ matchesError: error })
        );
      },

      removeMatch: async (id: string) => {
        await withErrorHandling(
          async () => {
            const newMatches = get().matches.filter(m => m.id !== id);
            set({ matches: newMatches });
          },
          (error) => set({ matchesError: error })
        );
      },

      // Training actions
      loadTrainings: async () => {
        set({ isLoadingTrainings: true });
        await withErrorHandling(
          async () => {
            // Rehydrate legacy storage if present and store is empty
            if (get().trainings.length === 0) {
              const legacyJson = await AsyncStorage.getItem('trainings');
              if (legacyJson) {
                try {
                  const legacyTrainings = JSON.parse(legacyJson) as Training[];
                  set({ trainings: legacyTrainings });
                  await AsyncStorage.removeItem('trainings');
                } catch (parseError) {
                  logger.error('Failed to migrate legacy trainings', parseError as Error);
                }
              }
            }
            set({ isLoadingTrainings: false });
          },
          (error) => set({ trainingsError: error, isLoadingTrainings: false })
        );
      },

      addTraining: async (training: Training) => {
        await withErrorHandling(
          async () => {
            // Basic validation
            if (!training.id || !training.date) {
              throw new Error('Training must have id and date');
            }

            const newTrainings = [...get().trainings, training];
            set({ trainings: newTrainings });
          },
          (error) => set({ trainingsError: error })
        );
      },

      updateTraining: async (id: string, partial: Partial<Training>) => {
        await withErrorHandling(
          async () => {
            const trainings = get().trainings;
            const index = trainings.findIndex(t => t.id === id);

            if (index === -1) {
              throw new Error(`Training with ID ${id} not found`);
            }

            const updated = [...trainings];
            updated[index] = { ...updated[index], ...partial };
            set({ trainings: updated });
          },
          (error) => set({ trainingsError: error })
        );
      },

      removeTraining: async (id: string) => {
        await withErrorHandling(
          async () => {
            const newTrainings = get().trainings.filter(t => t.id !== id);
            set({ trainings: newTrainings });
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
          matches: [],
          trainings: [],
          isLoadingMatches: false,
          isLoadingTrainings: false,
          matchesError: null,
          trainingsError: null,
        });
      },
    }),
    {
      name: 'padelbrain-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist data, not loading/error states
      partialize: (state) => ({
        matches: state.matches,
        trainings: state.trainings,
      }),
    }
  )
);
