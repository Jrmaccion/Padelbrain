import { FlatList, View, Text } from 'react-native';
import { Training } from '@/types';
import TrainingCard from './TrainingCard';

interface TrainingListProps {
  items: Training[];
  onItemPress?: (item: Training) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function TrainingList({ items, onItemPress, ListHeaderComponent }: TrainingListProps) {
  if (items.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: '#94A3B8' }}>No hay entrenamientos registrados</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item: Training) => item.id}
      renderItem={({ item }: { item: Training }) => (
        <TrainingCard item={item} onPress={onItemPress} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ gap: 0, paddingHorizontal: 16 }}
    />
  );
}