/**
 * Avatar Picker Component
 *
 * Modern avatar selector with colors and emojis
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';

const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const AVATAR_EMOJIS = [
  '🎾',
  '🏆',
  '⚡',
  '🔥',
  '💪',
  '🌟',
  '🎯',
  '👑',
  '🚀',
  '💎',
  '🦅',
  '🐯',
  '🦁',
  '⚔️',
  '🛡️',
  '🎪',
];

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
  type?: 'color' | 'emoji';
}

export function AvatarPicker({ selected, onSelect, type = 'color' }: AvatarPickerProps) {
  const [activeType, setActiveType] = useState<'color' | 'emoji'>(type);

  const items = activeType === 'color' ? AVATAR_COLORS : AVATAR_EMOJIS;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeType === 'color' && styles.tabActive]}
          onPress={() => setActiveType('color')}
        >
          <Text style={[styles.tabText, activeType === 'color' && styles.tabTextActive]}>
            🎨 Colores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeType === 'emoji' && styles.tabActive]}
          onPress={() => setActiveType('emoji')}
        >
          <Text style={[styles.tabText, activeType === 'emoji' && styles.tabTextActive]}>
            😊 Emojis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onSelect(item)}
              style={[
                styles.avatarOption,
                isSelected && styles.avatarOptionSelected,
                activeType === 'color' && { backgroundColor: item },
              ]}
              activeOpacity={0.7}
            >
              {activeType === 'emoji' && <Text style={styles.emoji}>{item}</Text>}
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 28,
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
