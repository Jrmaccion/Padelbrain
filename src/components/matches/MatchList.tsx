import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { Match } from '@/types';
import MatchCard from './MatchCard';

interface MatchListProps {
  items: Match[];
  onItemPress?: (item: Match) => void;
}

export default function MatchList({ items, onItemPress }: MatchListProps) {
  if (!items || items.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#94A3B8' }}>No hay partidos registrados</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item: Match) => item.id}
      renderItem={({ item }) => <MatchCard item={item} onPress={onItemPress} />}
      contentContainerStyle={{ gap: 0 }}
      initialNumToRender={10}
      windowSize={5}
      removeClippedSubviews
    />
  );
}
