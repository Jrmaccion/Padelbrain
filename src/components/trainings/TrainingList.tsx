import { FlatList, View, Text, Platform } from 'react-native';
import { Training } from '@/types';
import TrainingCard from './TrainingCard';

interface TrainingListProps {
  items: Training[];
  onItemPress?: (item: Training) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function TrainingList({ items, onItemPress, ListHeaderComponent }: TrainingListProps) {
  return (
    <FlatList
      style={{
        flex: 1,
        ...Platform.select({
          web: { overflowY: 'auto' as any, WebkitOverflowScrolling: 'touch' as any }
        })
      }}
      data={items}
      keyExtractor={(item: Training) => item.id}
      renderItem={({ item }: { item: Training }) => (
        <TrainingCard item={item} onPress={onItemPress} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#94A3B8' }}>No hay entrenamientos registrados</Text>
        </View>
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 20,
        flexGrow: 1
      }}
    />
  );
}
