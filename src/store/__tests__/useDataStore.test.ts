/**
 * Test suite for useDataStore Zustand store
 *
 * Tests all CRUD operations, error handling, and persistence logic
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataStore } from '../useDataStore';
import { Match, Training } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('useDataStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useDataStore());
    act(() => {
      result.current.reset();
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Match Operations', () => {
    const mockMatch: Match = {
      id: 'test-match-1',
      date: '2025-01-10T10:00:00Z',
      location: 'Test Court',
      opponents: ['John Doe'],
      result: 'won',
      notes: 'Great match',
      wellness: {
        energy: 4,
        stress: 2,
        sleep: 3,
        motivation: 5,
      },
    };

    it('should add a match successfully', async () => {
      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.addMatch(mockMatch);
      });

      expect(result.current.matches).toHaveLength(1);
      expect(result.current.matches[0]).toEqual(mockMatch);
      expect(result.current.matchesError).toBeNull();
    });

    it('should reject invalid match without id', async () => {
      const { result } = renderHook(() => useDataStore());
      const invalidMatch = { ...mockMatch, id: '' };

      await act(async () => {
        await result.current.addMatch(invalidMatch as Match);
      });

      expect(result.current.matches).toHaveLength(0);
      expect(result.current.matchesError).toBeTruthy();
    });

    it('should reject invalid match without date', async () => {
      const { result } = renderHook(() => useDataStore());
      const invalidMatch = { ...mockMatch, date: '' };

      await act(async () => {
        await result.current.addMatch(invalidMatch as Match);
      });

      expect(result.current.matches).toHaveLength(0);
      expect(result.current.matchesError).toBeTruthy();
    });

    it('should update an existing match', async () => {
      const { result } = renderHook(() => useDataStore());

      // Add initial match
      await act(async () => {
        await result.current.addMatch(mockMatch);
      });

      // Update match
      await act(async () => {
        await result.current.updateMatch(mockMatch.id, {
          location: 'Updated Court',
          result: 'lost',
        });
      });

      expect(result.current.matches[0].location).toBe('Updated Court');
      expect(result.current.matches[0].result).toBe('lost');
      expect(result.current.matchesError).toBeNull();
    });

    it('should error when updating non-existent match', async () => {
      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.updateMatch('non-existent-id', {
          location: 'Updated Court',
        });
      });

      expect(result.current.matchesError).toContain('not found');
    });

    it('should remove a match successfully', async () => {
      const { result } = renderHook(() => useDataStore());

      // Add match
      await act(async () => {
        await result.current.addMatch(mockMatch);
      });

      expect(result.current.matches).toHaveLength(1);

      // Remove match
      await act(async () => {
        await result.current.removeMatch(mockMatch.id);
      });

      expect(result.current.matches).toHaveLength(0);
      expect(result.current.matchesError).toBeNull();
    });

    it('should handle multiple matches', async () => {
      const { result } = renderHook(() => useDataStore());

      const match2: Match = { ...mockMatch, id: 'test-match-2' };
      const match3: Match = { ...mockMatch, id: 'test-match-3' };

      await act(async () => {
        await result.current.addMatch(mockMatch);
        await result.current.addMatch(match2);
        await result.current.addMatch(match3);
      });

      expect(result.current.matches).toHaveLength(3);

      // Remove middle match
      await act(async () => {
        await result.current.removeMatch(match2.id);
      });

      expect(result.current.matches).toHaveLength(2);
      expect(result.current.matches.find((m) => m.id === match2.id)).toBeUndefined();
    });
  });

  describe('Training Operations', () => {
    const mockTraining: Training = {
      id: 'test-training-1',
      date: '2025-01-10T10:00:00Z',
      location: 'Test Court',
      coach: 'Coach Smith',
      goals: 'Improve backhand',
      wellness: {
        energy: 4,
        stress: 2,
        sleep: 3,
        motivation: 5,
      },
    };

    it('should add a training successfully', async () => {
      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.addTraining(mockTraining);
      });

      expect(result.current.trainings).toHaveLength(1);
      expect(result.current.trainings[0]).toEqual(mockTraining);
      expect(result.current.trainingsError).toBeNull();
    });

    it('should reject invalid training without id', async () => {
      const { result } = renderHook(() => useDataStore());
      const invalidTraining = { ...mockTraining, id: '' };

      await act(async () => {
        await result.current.addTraining(invalidTraining as Training);
      });

      expect(result.current.trainings).toHaveLength(0);
      expect(result.current.trainingsError).toBeTruthy();
    });

    it('should update an existing training', async () => {
      const { result } = renderHook(() => useDataStore());

      // Add initial training
      await act(async () => {
        await result.current.addTraining(mockTraining);
      });

      // Update training
      await act(async () => {
        await result.current.updateTraining(mockTraining.id, {
          coach: 'Coach Johnson',
          goals: 'Work on volleys',
        });
      });

      expect(result.current.trainings[0].coach).toBe('Coach Johnson');
      expect(result.current.trainings[0].goals).toBe('Work on volleys');
      expect(result.current.trainingsError).toBeNull();
    });

    it('should error when updating non-existent training', async () => {
      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.updateTraining('non-existent-id', {
          coach: 'New Coach',
        });
      });

      expect(result.current.trainingsError).toContain('not found');
    });

    it('should remove a training successfully', async () => {
      const { result } = renderHook(() => useDataStore());

      // Add training
      await act(async () => {
        await result.current.addTraining(mockTraining);
      });

      expect(result.current.trainings).toHaveLength(1);

      // Remove training
      await act(async () => {
        await result.current.removeTraining(mockTraining.id);
      });

      expect(result.current.trainings).toHaveLength(0);
      expect(result.current.trainingsError).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear errors', async () => {
      const { result } = renderHook(() => useDataStore());

      // Create an error by trying to update non-existent match
      await act(async () => {
        await result.current.updateMatch('non-existent', { location: 'test' });
      });

      expect(result.current.matchesError).toBeTruthy();

      // Clear errors
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.matchesError).toBeNull();
      expect(result.current.trainingsError).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset store to initial state', async () => {
      const { result } = renderHook(() => useDataStore());

      // Add data
      const mockMatch: Match = {
        id: 'test-match-1',
        date: '2025-01-10T10:00:00Z',
        location: 'Test Court',
        opponents: ['John Doe'],
        result: 'won',
        wellness: { energy: 4, stress: 2, sleep: 3, motivation: 5 },
      };

      await act(async () => {
        await result.current.addMatch(mockMatch);
      });

      expect(result.current.matches).toHaveLength(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.matches).toHaveLength(0);
      expect(result.current.trainings).toHaveLength(0);
      expect(result.current.matchesError).toBeNull();
      expect(result.current.trainingsError).toBeNull();
      expect(result.current.isLoadingMatches).toBe(false);
      expect(result.current.isLoadingTrainings).toBe(false);
    });
  });

  describe('Legacy Migration', () => {
    it('should migrate legacy matches from AsyncStorage', async () => {
      const legacyMatches: Match[] = [
        {
          id: 'legacy-1',
          date: '2025-01-01T10:00:00Z',
          location: 'Legacy Court',
          opponents: ['Player 1'],
          result: 'won',
          wellness: { energy: 3, stress: 2, sleep: 4, motivation: 3 },
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(legacyMatches));

      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.loadMatches();
      });

      await waitFor(() => {
        expect(result.current.matches).toHaveLength(1);
        expect(result.current.matches[0].id).toBe('legacy-1');
      });

      // Verify legacy key was removed
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('matches');
    });

    it('should migrate legacy trainings from AsyncStorage', async () => {
      const legacyTrainings: Training[] = [
        {
          id: 'legacy-training-1',
          date: '2025-01-01T10:00:00Z',
          location: 'Legacy Court',
          coach: 'Legacy Coach',
          wellness: { energy: 3, stress: 2, sleep: 4, motivation: 3 },
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(legacyTrainings));

      const { result } = renderHook(() => useDataStore());

      await act(async () => {
        await result.current.loadTrainings();
      });

      await waitFor(() => {
        expect(result.current.trainings).toHaveLength(1);
        expect(result.current.trainings[0].id).toBe('legacy-training-1');
      });

      // Verify legacy key was removed
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('trainings');
    });
  });
});
