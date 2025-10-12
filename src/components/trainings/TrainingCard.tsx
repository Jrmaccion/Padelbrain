import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Card from '@/components/common/Card';
import { Training } from '@/types';
import { formatDate } from '@/utils/dateHelpers';

interface TrainingCardProps {
  item: Training;
  onPress?: (item: Training) => void;
}

function deriveStarsFromPostReview(item: Training): number | undefined {
  const pr = item.postReview;
  if (!pr) return undefined;

  // Usa las métricas disponibles para promediar (1..5)
  const values: number[] = [];
  if (typeof pr.technical === 'number') values.push(pr.technical);
  if (typeof pr.tactical === 'number') values.push(pr.tactical);
  if (typeof pr.mental === 'number') values.push(pr.mental);
  if (typeof pr.physical === 'number') values.push(pr.physical);

  if (values.length === 0) return undefined;

  const avg = values.reduce((a, b) => a + b, 0) / values.length; // 1..5
  // Redondeo al entero más cercano dentro de 1..5
  const stars = Math.min(5, Math.max(1, Math.round(avg)));
  return stars;
}

export default function TrainingCard({ item, onPress }: TrainingCardProps) {
  const stars = deriveStarsFromPostReview(item);

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>

        {typeof stars === 'number' && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{'⭐'.repeat(stars)}</Text>
          </View>
        )}
      </View>

      {item.coach && (
        <View style={styles.row}>
          <Text style={styles.icon}>👨‍🏫</Text>
          <Text style={styles.label}>Entrenador: </Text>
          <Text style={styles.value}>{item.coach}</Text>
        </View>
      )}

      {item.location && (
        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.label}>Lugar: </Text>
          <Text style={styles.value}>{item.location}</Text>
        </View>
      )}

    

      {/* Compañeros de entrenamiento (chips) */}
      {Array.isArray((item as any).trainingPartners) && (item as any).trainingPartners.length > 0 && (
        <View style={{ marginTop: 6, marginBottom: 2 }}>
          <Text style={styles.partnersLabel}>👥 Compañeros:</Text>
          <View style={styles.partnersChips}>
            {(item as any).trainingPartners.map((p: string) => (
              <View key={p} style={styles.partnerChip}>
                <Text style={styles.partnerChipText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      )}



      {item.goals && item.goals.length > 0 && (
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsLabel}>🎯 Objetivos:</Text>
          {item.goals.slice(0, 2).map((goal, index) => (
            <Text key={index} style={styles.goal}>• {goal}</Text>
          ))}
          {item.goals.length > 2 && (
            <Text style={styles.moreGoals}>+{item.goals.length - 2} más...</Text>
          )}
        </View>
      )}

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          💭 {item.notes}
        </Text>
      )}

      {/* Indicadores de ratings de bienestar (previos) */}
      {(item.sleep || item.energy) && (
        <View style={styles.indicators}>
          {item.sleep && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>😴</Text>
              <View style={styles.dots}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={i}
                    style={[styles.dot, i <= (item.sleep || 0) && styles.dotActive]}
                  />
                ))}
              </View>
            </View>
          )}
          {item.energy && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorLabel}>⚡</Text>
              <View style={styles.dots}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={i}
                    style={[styles.dot, i <= (item.energy || 0) && styles.dotActive]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {onPress && <Text style={styles.tapHint}>Toca para ver detalles →</Text>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7} style={styles.touchable}>
        <Card>{content}</Card>
      </TouchableOpacity>
    );
  }

  return <Card>{content}</Card>;
}

const styles = StyleSheet.create({
  touchable: { marginBottom: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8
  },
  date: { fontWeight: '700', fontSize: 16, color: '#1E293B' },
  ratingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 6, fontSize: 14 },
  label: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 14, color: '#1E293B', fontWeight: '600' },

  partnersLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  partnersChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  partnerChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  partnerChipText: { fontSize: 11, fontWeight: '600', color: '#1E293B' },

  goalsContainer: { marginTop: 8, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 8 },
  goalsLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4 },
  goal: { fontSize: 12, color: '#64748B', marginLeft: 8, marginBottom: 2 },
  moreGoals: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginLeft: 8, marginTop: 2 },

  notes: { fontSize: 13, color: '#64748B', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },

  indicators: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  indicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  indicatorLabel: { fontSize: 16 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  dotActive: { backgroundColor: '#3B82F6' },

  tapHint: { fontSize: 11, color: '#3B82F6', textAlign: 'right', marginTop: 8, fontWeight: '600' }
});
