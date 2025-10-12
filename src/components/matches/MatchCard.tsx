import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Card from '@/components/common/Card';
import { Match } from '@/types';
import { formatDate } from '@/utils/dateHelpers';

interface MatchCardProps {
  item: Match;
  onPress?: (item: Match) => void;
}

export default function MatchCard({ item, onPress }: MatchCardProps) {
  const isWin = item.result?.outcome === 'won';
  const partner = (item as any).partner as string | undefined;
  const position = (item as any).position as ('right' | 'left') | undefined;

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        {item.result?.outcome && (
          <View style={[styles.resultBadge, isWin ? styles.winBadge : styles.lossBadge]}>
            <Text style={[styles.resultText, isWin ? styles.winText : styles.lossText]}>
              {isWin ? '✅ Victoria' : '❌ Derrota'}
            </Text>
          </View>
        )}
      </View>

      {item.result?.score && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Marcador:</Text>
          <Text style={styles.scoreValue}>{item.result.score}</Text>
          {!!item.result?.durationMin && (
            <Text style={styles.scoreDuration}> · {item.result.durationMin} min</Text>
          )}
        </View>
      )}

      {item.tournament && (
        <View style={styles.row}>
          <Text style={styles.icon}>🏆</Text>
          <Text style={styles.label}>Torneo: </Text>
          <Text style={styles.value}>{item.tournament}</Text>
        </View>
      )}

      {/* Badges compañero + posición */}
      {(partner || position) && (
        <View style={styles.badgesRow}>
          {!!partner && (
            <View style={[styles.badge, styles.partnerBadge]}>
              <Text style={styles.badgeText}>👥 {partner}</Text>
            </View>
          )}
          {!!position && (
            <View style={[styles.badge, styles.positionBadge]}>
              <Text style={styles.badgeText}>
                🧭 {position === 'right' ? 'Derecha' : 'Izquierda'}
              </Text>
            </View>
          )}
        </View>
      )}

      {item.opponents && (item.opponents.right || item.opponents.left) && (
        <View style={styles.row}>
          <Text style={styles.icon}>🤝</Text>
          <Text style={styles.label}>Rivales: </Text>
          <Text style={styles.value}>
            {[item.opponents.right, item.opponents.left].filter(Boolean).join(' y ')}
          </Text>
        </View>
      )}

      {/* Fortalezas y Debilidades */}
      {item.strengths && item.strengths.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>💪 Fortalezas:</Text>
          <View style={styles.tags}>
            {item.strengths.slice(0, 3).map((strength, index) => (
              <View key={index} style={[styles.tag, styles.strengthTag]}>
                <Text style={styles.tagText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.weaknesses && item.weaknesses.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>⚠️ A mejorar:</Text>
          <View style={styles.tags}>
            {item.weaknesses.slice(0, 2).map((weakness, index) => (
              <View key={index} style={[styles.tag, styles.weaknessTag]}>
                <Text style={styles.tagText}>{weakness}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.keywords && item.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          {item.keywords.slice(0, 4).map((keyword, index) => (
            <Text key={index} style={styles.keyword}>#{keyword}</Text>
          ))}
        </View>
      )}

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          💭 {item.notes}
        </Text>
      )}

      {onPress && <Text style={styles.tapHint}>Toca para ver análisis completo →</Text>}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  date: { fontWeight: '700', fontSize: 16, color: '#1E293B' },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  winBadge: { backgroundColor: '#D1FAE5' },
  lossBadge: { backgroundColor: '#FEE2E2' },
  resultText: { fontSize: 12, fontWeight: '700' },
  winText: { color: '#065F46' },
  lossText: { color: '#991B1B' },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  scoreLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', marginRight: 8 },
  scoreValue: { fontSize: 18, color: '#1E293B', fontWeight: '700', fontFamily: 'monospace' },
  scoreDuration: { fontSize: 12, color: '#64748B', marginLeft: 6 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 6, fontSize: 14 },
  label: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 14, color: '#1E293B', fontWeight: '600' },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  partnerBadge: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  positionBadge: { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },

  tagsContainer: { marginTop: 12 },
  tagsLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  strengthTag: { backgroundColor: '#D1FAE5' },
  weaknessTag: { backgroundColor: '#FEE2E2' },
  tagText: { fontSize: 11, fontWeight: '600', color: '#1E293B' },

  keywordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  keyword: { fontSize: 11, color: '#3B82F6', fontWeight: '600' },

  notes: { fontSize: 13, color: '#64748B', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
  tapHint: { fontSize: 11, color: '#3B82F6', textAlign: 'right', marginTop: 8, fontWeight: '600' }
});
