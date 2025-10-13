import React from 'react';
import { FlatList, View, Text, ListRenderItem } from 'react-native';
import { Match } from '@/types';
import MatchCard from './MatchCard';

interface MatchListProps {
  items: Match[];
  onItemPress?: (item: Match) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
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
    <View>
      {items.map((item) => (
        <MatchCard key={item.id} item={item} onPress={onItemPress} />
      ))}
    </View>
  );
}
