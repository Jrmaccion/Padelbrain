/**
 * User Store
 *
 * Global state management for user profiles and authentication
 */

import { create } from 'zustand';
import { UserProfile, DataConflict, MergeStrategy } from '@/types/user';
import {
  getAllProfiles,
  getActiveUser,
  setActiveUser,
  createProfile,
  updateProfile,
  deleteProfile,
  detectConflicts,
  mergeData,
} from '@/services/userManager';
import { useDataStore } from './useDataStore';
import { BackupData } from '@/services/dataBackup';
import { logger } from '@/services/logger';

interface UserState {
  // State
  activeUser: UserProfile | null;
  allProfiles: UserProfile[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadActiveUser: () => Promise<void>;
  loadProfiles: () => Promise<void>;
  loadAllProfiles: () => Promise<void>;
  createNewProfile: (name: string, email?: string, avatar?: string) => Promise<UserProfile>;
  switchUser: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUserProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  importProfile: (
    backupData: BackupData,
    strategy: MergeStrategy | 'detect-only'
  ) => Promise<DataConflict[] | null>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  // Initial state
  activeUser: null,
  allProfiles: [],
  isLoading: false,
  error: null,

  // Load active user
  loadActiveUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getActiveUser();
      set({ activeUser: user, isLoading: false });
      logger.info('Active user loaded', { userId: user?.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error loading user';
      set({ error: message, isLoading: false });
      logger.error('Failed to load active user', error as Error);
    }
  },

  // Load all profiles
  loadAllProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await getAllProfiles();
      set({ allProfiles: profiles, isLoading: false });
      logger.info('User profiles loaded', { count: profiles.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error loading profiles';
      set({ error: message, isLoading: false });
      logger.error('Failed to load user profiles', error as Error);
    }
  },

  // Alias for compatibility
  loadProfiles: async () => {
    await get().loadAllProfiles();
  },

  // Create new profile
  createNewProfile: async (name: string, email?: string, avatar?: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await createProfile(name, email, avatar);

      // Add to profiles list
      const profiles = get().allProfiles;
      set({
        allProfiles: [...profiles, profile],
      });

      // Automatically switch to new profile and load data
      await setActiveUser(profile.id);
      await useDataStore.getState().setActiveUser(profile.id);

      set({
        activeUser: profile,
        isLoading: false,
      });

      logger.action('User profile created and activated', {
        userId: profile.id,
        name: profile.name,
      });
      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creating profile';
      set({ error: message, isLoading: false });
      logger.error('Failed to create user profile', error as Error);
      throw error;
    }
  },

  // Switch active user
  switchUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await setActiveUser(userId);

      // Load user's data into data store
      await useDataStore.getState().setActiveUser(userId);

      const profiles = get().allProfiles;
      const user = profiles.find((p) => p.id === userId) || null;

      set({ activeUser: user, isLoading: false });
      logger.action('User switched and data loaded', { userId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error switching user';
      set({ error: message, isLoading: false });
      logger.error('Failed to switch user', error as Error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateProfile(userId, updates);

      // Update in profiles list
      const profiles = get().allProfiles.map((p) => (p.id === userId ? updated : p));

      // Update active user if it's the one being updated
      const activeUser = get().activeUser;
      const newActiveUser = activeUser?.id === userId ? updated : activeUser;

      set({
        allProfiles: profiles,
        activeUser: newActiveUser,
        isLoading: false,
      });

      logger.action('User profile updated', { userId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error updating profile';
      set({ error: message, isLoading: false });
      logger.error('Failed to update user profile', error as Error);
      throw error;
    }
  },

  // Delete user profile
  deleteUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProfile(userId);

      // Remove from profiles list
      const profiles = get().allProfiles.filter((p) => p.id !== userId);

      // Clear active user if it's the one being deleted
      const activeUser = get().activeUser;
      const newActiveUser = activeUser?.id === userId ? null : activeUser;

      set({
        allProfiles: profiles,
        activeUser: newActiveUser,
        isLoading: false,
      });

      logger.action('User profile deleted', { userId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting profile';
      set({ error: message, isLoading: false });
      logger.error('Failed to delete user profile', error as Error);
      throw error;
    }
  },

  // Logout (clear active user)
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await setActiveUser('');

      // Clear data store
      await useDataStore.getState().setActiveUser(null);

      set({ activeUser: null, isLoading: false });
      logger.action('User logged out and data cleared');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error logging out';
      set({ error: message, isLoading: false });
      logger.error('Failed to logout', error as Error);
    }
  },

  // Alias for compatibility
  signOut: async () => {
    await get().logout();
  },

  // Import profile from backup
  importProfile: async (backupData: BackupData, strategy: MergeStrategy | 'detect-only') => {
    try {
      const { activeUser } = get();
      const dataStore = useDataStore.getState();

      // Get current data
      const localMatches = dataStore.matches;
      const localTrainings = dataStore.trainings;

      // Detect conflicts
      const conflicts = detectConflicts(
        localMatches,
        localTrainings,
        backupData.matches,
        backupData.trainings
      );

      // If only detecting, return conflicts
      if (strategy === 'detect-only') {
        return conflicts.length > 0 ? conflicts : null;
      }

      // Apply merge strategy
      const { matches, trainings } = mergeData(
        localMatches,
        localTrainings,
        backupData.matches,
        backupData.trainings,
        strategy
      );

      // Check if this is a new profile or updating existing
      const existingProfile = get().allProfiles.find((p) => p.id === backupData.user.id);

      if (!existingProfile) {
        // Create new profile
        const profiles = get().allProfiles;
        set({
          allProfiles: [...profiles, backupData.user],
        });
        await getAllProfiles(); // Persist
        logger.info('New profile imported', { userId: backupData.user.id });
      } else {
        // Update existing profile's lastSyncAt
        await updateProfile(backupData.user.id, {
          lastSyncAt: new Date().toISOString(),
        });
        logger.info('Existing profile synced', { userId: backupData.user.id });
      }

      // Switch to this user and save merged data
      if (activeUser?.id !== backupData.user.id) {
        await get().switchUser(backupData.user.id);
      }

      // Save merged data (manually update storage since we're bypassing the store actions)
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = `padelbrain-data-${backupData.user.id}`;
      await AsyncStorage.setItem(key, JSON.stringify({ matches, trainings }));

      // Update store state
      dataStore.matches = matches;
      dataStore.trainings = trainings;

      logger.action('Profile imported successfully', {
        userId: backupData.user.id,
        strategy,
        matchCount: matches.length,
        trainingCount: trainings.length,
      });

      return null; // No conflicts after resolution
    } catch (error) {
      logger.error('Failed to import profile', error as Error);
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
