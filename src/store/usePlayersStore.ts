/**
 * Players Store
 *
 * Manages player profiles (rivals and partners) with persistent storage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Player, PlayerStats, Match } from '@/types';
import { playerSchema } from '@/schemas';
import { logger } from '@/services/logger';

interface PlayersState {
  // State
  players: Player[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPlayers: () => Promise<void>;
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  getPlayerById: (id: string) => Player | undefined;
  getPlayerByName: (name: string) => Player | undefined;
  getOrCreatePlayer: (name: string, type: Player['type']) => Promise<Player>;

  // Stats
  calculatePlayerStats: (playerId: string, matches: Match[]) => PlayerStats;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  players: [],
  isLoading: false,
  error: null,
};

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Load players (called on mount)
      loadPlayers: async () => {
        set({ isLoading: true, error: null });
        try {
          // Players are already loaded from persistence
          const { players } = get();
          logger.info('Players loaded', { count: players.length });
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load players';
          set({ error: message, isLoading: false });
          logger.error('Failed to load players', error as Error);
        }
      },

      // Add new player
      addPlayer: async (playerData) => {
        set({ error: null });
        try {
          const newPlayer: Player = {
            ...playerData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };

          // Validate
          playerSchema.parse(newPlayer);

          // Add to state
          set((state) => ({
            players: [...state.players, newPlayer],
          }));

          logger.action('Player added', { playerId: newPlayer.id, name: newPlayer.name });
          return newPlayer;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add player';
          set({ error: message });
          logger.error('Failed to add player', error as Error);
          throw error;
        }
      },

      // Update player
      updatePlayer: async (id, updates) => {
        set({ error: null });
        try {
          set((state) => ({
            players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));

          logger.action('Player updated', { playerId: id });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update player';
          set({ error: message });
          logger.error('Failed to update player', error as Error);
          throw error;
        }
      },

      // Delete player
      deletePlayer: async (id) => {
        set({ error: null });
        try {
          set((state) => ({
            players: state.players.filter((p) => p.id !== id),
          }));

          logger.action('Player deleted', { playerId: id });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete player';
          set({ error: message });
          logger.error('Failed to delete player', error as Error);
          throw error;
        }
      },

      // Get player by ID
      getPlayerById: (id) => {
        return get().players.find((p) => p.id === id);
      },

      // Get player by name (case-insensitive)
      getPlayerByName: (name) => {
        const normalized = name.trim().toLowerCase();
        return get().players.find((p) => p.name.toLowerCase() === normalized);
      },

      // Get or create player (for auto-creating from match data)
      getOrCreatePlayer: async (name, type) => {
        const existing = get().getPlayerByName(name);
        if (existing) {
          // Update type if needed (e.g., was rival, now also partner)
          if (existing.type !== type && existing.type !== 'both') {
            await get().updatePlayer(existing.id, { type: 'both' });
            return { ...existing, type: 'both' };
          }
          return existing;
        }

        // Create new player
        return get().addPlayer({
          name: name.trim(),
          type,
        });
      },

      // Calculate stats for a player based on matches
      calculatePlayerStats: (playerId, matches) => {
        const player = get().getPlayerById(playerId);
        if (!player) {
          return {
            playerId,
            totalMatches: 0,
            matchesAgainst: 0,
            winsAgainst: 0,
            lossesAgainst: 0,
            winRateAgainst: 0,
            matchesWith: 0,
            winsWith: 0,
            lossesWith: 0,
            winRateWith: 0,
          };
        }

        // Find matches against this player (as rival)
        const matchesAgainst = matches.filter((m) => {
          const opponentRight = m.opponents?.right?.toLowerCase();
          const opponentLeft = m.opponents?.left?.toLowerCase();
          const playerName = player.name.toLowerCase();
          return opponentRight === playerName || opponentLeft === playerName;
        });

        const winsAgainst = matchesAgainst.filter((m) => m.result?.outcome === 'won').length;
        const lossesAgainst = matchesAgainst.length - winsAgainst;
        const winRateAgainst =
          matchesAgainst.length > 0 ? Math.round((winsAgainst / matchesAgainst.length) * 100) : 0;

        // Find matches with this player (as partner)
        const matchesWith = matches.filter((m) => {
          const partner = m.partner?.toLowerCase();
          const playerName = player.name.toLowerCase();
          return partner === playerName;
        });

        const winsWith = matchesWith.filter((m) => m.result?.outcome === 'won').length;
        const lossesWith = matchesWith.length - winsWith;
        const winRateWith =
          matchesWith.length > 0 ? Math.round((winsWith / matchesWith.length) * 100) : 0;

        // Calculate recent form (last 5 matches combined)
        const allMatches = [...matchesAgainst, ...matchesWith]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        const lastFiveResults = allMatches.map((m) => m.result?.outcome || 'lost') as (
          | 'won'
          | 'lost'
        )[];
        const recentWins = lastFiveResults.filter((r) => r === 'won').length;
        const recentForm = recentWins >= 4 ? 'hot' : recentWins <= 1 ? 'cold' : 'neutral';

        return {
          playerId,
          totalMatches: matchesAgainst.length + matchesWith.length,
          matchesAgainst: matchesAgainst.length,
          winsAgainst,
          lossesAgainst,
          winRateAgainst,
          matchesWith: matchesWith.length,
          winsWith,
          lossesWith,
          winRateWith,
          lastFiveResults: lastFiveResults.length > 0 ? lastFiveResults : undefined,
          recentForm: lastFiveResults.length >= 3 ? recentForm : undefined,
        };
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset store
      reset: () => {
        set(INITIAL_STATE);
        logger.info('Players store reset');
      },
    }),
    {
      name: 'padelbrain-players',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist players data, not loading/error states
      partialize: (state) => ({ players: state.players }),
    }
  )
);
