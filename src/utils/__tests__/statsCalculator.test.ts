/**
 * Test suite for statsCalculator utility
 *
 * Tests calculation of win rates and statistics
 */

import { calcBasicStats } from '../statsCalculator';
import { Match, Training } from '@/types';

describe('statsCalculator', () => {
  describe('calcBasicStats', () => {
    const baseMatch: Match = {
      id: 'match-1',
      date: '2025-01-10T10:00:00Z',
      location: 'Test Court',
    };

    const baseTraining: Training = {
      id: 'training-1',
      date: '2025-01-10T10:00:00Z',
      location: 'Test Court',
    };

    it('should return zero stats for empty arrays', () => {
      const stats = calcBasicStats([], []);

      expect(stats.totalMatches).toBe(0);
      expect(stats.winrate).toBe(0);
      expect(stats.totalTrainings).toBe(0);
    });

    it('should count total matches correctly', () => {
      const matches = [
        baseMatch,
        { ...baseMatch, id: 'match-2' },
        { ...baseMatch, id: 'match-3' },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.totalMatches).toBe(3);
    });

    it('should count total trainings correctly', () => {
      const trainings = [
        baseTraining,
        { ...baseTraining, id: 'training-2' },
        { ...baseTraining, id: 'training-3' },
        { ...baseTraining, id: 'training-4' },
      ];

      const stats = calcBasicStats([], trainings);

      expect(stats.totalTrainings).toBe(4);
    });

    it('should calculate 100% winrate when all matches won', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-3', result: { outcome: 'won' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(100);
    });

    it('should calculate 0% winrate when all matches lost', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'lost' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'lost' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(0);
    });

    it('should calculate 50% winrate when half won', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'lost' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(50);
    });

    it('should calculate 67% winrate for 2/3 wins', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-3', result: { outcome: 'lost' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(67); // 2/3 rounded
    });

    it('should calculate 33% winrate for 1/3 wins', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'lost' as const } },
        { ...baseMatch, id: 'match-3', result: { outcome: 'lost' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(33); // 1/3 rounded
    });

    it('should handle matches without result field', () => {
      const matches = [
        baseMatch, // No result field
        { ...baseMatch, id: 'match-2', result: { outcome: 'won' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.totalMatches).toBe(2);
      expect(stats.winrate).toBe(50); // Only 1 win out of 2 matches
    });

    it('should handle matches with undefined result', () => {
      const matches = [
        { ...baseMatch, result: undefined },
        { ...baseMatch, id: 'match-2', result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-3', result: { outcome: 'won' as const } },
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(67); // 2 wins out of 3 matches
    });

    it('should calculate all stats together', () => {
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-2', result: { outcome: 'lost' as const } },
        { ...baseMatch, id: 'match-3', result: { outcome: 'won' as const } },
        { ...baseMatch, id: 'match-4', result: { outcome: 'won' as const } },
      ];

      const trainings = [
        baseTraining,
        { ...baseTraining, id: 'training-2' },
      ];

      const stats = calcBasicStats(matches, trainings);

      expect(stats.totalMatches).toBe(4);
      expect(stats.winrate).toBe(75); // 3 wins out of 4
      expect(stats.totalTrainings).toBe(2);
    });

    it('should round winrate to nearest integer', () => {
      // 1 win out of 7 = 14.28... should round to 14
      const matches = [
        { ...baseMatch, result: { outcome: 'won' as const } },
        ...Array(6)
          .fill(null)
          .map((_, i) => ({
            ...baseMatch,
            id: `match-${i + 2}`,
            result: { outcome: 'lost' as const },
          })),
      ];

      const stats = calcBasicStats(matches, []);

      expect(stats.winrate).toBe(14);
    });

    it('should handle large numbers of matches', () => {
      const matches = Array(1000)
        .fill(null)
        .map((_, i) => ({
          ...baseMatch,
          id: `match-${i}`,
          result: { outcome: (i % 2 === 0 ? 'won' : 'lost') as const },
        }));

      const stats = calcBasicStats(matches, []);

      expect(stats.totalMatches).toBe(1000);
      expect(stats.winrate).toBe(50);
    });
  });
});
