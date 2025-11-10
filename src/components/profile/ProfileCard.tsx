/**
 * Profile Card Component
 *
 * Beautiful card to display user profiles
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserProfile } from '@/types/user';
import { colors } from '@/constants/colors';

interface ProfileCardProps {
  profile: UserProfile;
  onPress: () => void;
  showStats?: boolean;
  matchCount?: number;
  trainingCount?: number;
}

export function ProfileCard({
  profile,
  onPress,
  showStats = false,
  matchCount = 0,
  trainingCount = 0,
}: ProfileCardProps) {
  const isEmoji = profile.avatar && profile.avatar.length <= 2;
  const isColor = profile.avatar && profile.avatar.startsWith('#');

  const lastSyncDate = profile.lastSyncAt
    ? new Date(profile.lastSyncAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          isColor && { backgroundColor: profile.avatar },
          !isColor && styles.avatarDefault,
        ]}
      >
        {isEmoji ? (
          <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
        ) : (
          <Text style={styles.avatarInitial}>{profile.name.charAt(0).toUpperCase()}</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.name}
        </Text>
        {profile.email && (
          <Text style={styles.email} numberOfLines={1}>
            {profile.email}
          </Text>
        )}
        {lastSyncDate && <Text style={styles.sync}>Última sincronización: {lastSyncDate}</Text>}
      </View>

      {/* Stats */}
      {showStats && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matchCount}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trainingCount}</Text>
            <Text style={styles.statLabel}>Entrenos</Text>
          </View>
        </View>
      )}

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarDefault: {
    backgroundColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sync: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  arrow: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: '300',
  },
});
