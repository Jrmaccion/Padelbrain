import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Rating1to5 } from '@/types';

interface RatingChipsProps {
  label: string;
  value?: Rating1to5;
  onChange: (value: Rating1to5) => void;
}

const RATING_COLORS = {
  1: '#EF4444', // Rojo
  2: '#F97316', // Naranja
  3: '#EAB308', // Amarillo
  4: '#84CC16', // Verde lima
  5: '#10B981'  // Verde
};

const RATING_LABELS = {
  1: 'Muy mal',
  2: 'Mal',
  3: 'Regular',
  4: 'Bien',
  5: 'Excelente'
};

export default function RatingChips({ label, value, onChange }: RatingChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipsContainer}>
        {([1, 2, 3, 4, 5] as Rating1to5[]).map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.chip,
              value === rating && {
                backgroundColor: RATING_COLORS[rating],
                borderColor: RATING_COLORS[rating]
              }
            ]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[
                styles.chipText,
                value === rating && styles.chipTextSelected
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!value && (
        <Text style={styles.ratingLabel}>{RATING_LABELS[value]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  chip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chipText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B'
  },
  chipTextSelected: {
    color: '#FFFFFF'
  },
  ratingLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic'
  }
});