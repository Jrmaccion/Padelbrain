import { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import Header from '@/components/common/Header';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useResponsive } from '@/constants/layout'; // ⬅️ NUEVO

export default function StatsScreen() {
  const { items: matches, load: loadMatches } = useMatches();
  const { items: trainings, load: loadTrainings } = useTrainings();
  const { deviceType, layout: responsiveLayout } = useResponsive(); // ⬅️ NUEVO

  useEffect(() => {
    loadMatches();
    loadTrainings();
  }, []);

  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result?.outcome === 'won').length;
  const losses = matches.filter(m => m.result?.outcome === 'lost').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentMatches = matches.filter(m => new Date(m.date) > last30Days);
  const recentWins = recentMatches.filter(m => m.result?.outcome === 'won').length;
  const recentWinRate = recentMatches.length > 0 ? Math.round((recentWins / recentMatches.length) * 100) : 0;

  const totalTrainings = trainings.length;
  const recentTrainings = trainings.filter(t => new Date(t.date) > last30Days).length;
  
  const ratingsCount = trainings.filter(t => t.postReview?.technical).length;
  const avgTechnical = ratingsCount > 0
    ? trainings.reduce((sum, t) => sum + (t.postReview?.technical || 0), 0) / ratingsCount
    : 0;
  const avgTactical = ratingsCount > 0
    ? trainings.reduce((sum, t) => sum + (t.postReview?.tactical || 0), 0) / ratingsCount
    : 0;
  const avgMental = ratingsCount > 0
    ? trainings.reduce((sum, t) => sum + (t.postReview?.mental || 0), 0) / ratingsCount
    : 0;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const matchesThisMonth = matches.filter(m => new Date(m.date) >= thisMonth).length;
  const trainingsThisMonth = trainings.filter(t => new Date(t.date) >= thisMonth).length;

  let currentStreak = 0;
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const match of sortedMatches) {
    if (match.result?.outcome === 'won') {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Estadísticas" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Wrapper con max-width en desktop */}
        <View style={[
          deviceType !== 'mobile' && {
            maxWidth: responsiveLayout.getMaxWidth(),
            alignSelf: 'center',
            width: '100%',
          }
        ]}>
          {/* Resumen general */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Resumen General</Text>
            <View style={[
              styles.statsGrid,
              deviceType !== 'mobile' && styles.statsGridWide
            ]}>
              <StatCard 
                icon="🎾"
                value={totalMatches}
                label="Total Partidos"
                color="#3B82F6"
              />
              <StatCard 
                icon="🏃"
                value={totalTrainings}
                label="Total Entrenamientos"
                color="#8B5CF6"
              />
            </View>
          </View>

          {/* Rendimiento en partidos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Rendimiento en Partidos</Text>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Win Rate Global</Text>
                <Text style={[styles.winRateValue, { color: winRate >= 50 ? '#10B981' : '#EF4444' }]}>
                  {winRate}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${winRate}%`, backgroundColor: winRate >= 50 ? '#10B981' : '#EF4444' }]} />
              </View>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Victorias: <Text style={styles.recordValueWin}>{wins}</Text></Text>
                <Text style={styles.recordLabel}>Derrotas: <Text style={styles.recordValueLoss}>{losses}</Text></Text>
              </View>
            </View>

            <View style={[
              styles.statsGrid,
              deviceType !== 'mobile' && styles.statsGridWide
            ]}>
              <StatCard 
                icon="📅"
                value={`${recentWinRate}%`}
                label="Win Rate (30 días)"
                color="#10B981"
                subtitle={`${recentWins}V - ${recentMatches.length - recentWins}D`}
              />
              <StatCard 
                icon="🔥"
                value={currentStreak}
                label="Racha Actual"
                color="#F59E0B"
                subtitle={currentStreak > 0 ? "victorias" : "sin racha"}
              />
            </View>
          </View>

          {/* Evaluación de entrenamientos */}
          {ratingsCount > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Evaluación de Entrenamientos</Text>
              <View style={styles.card}>
                <RatingBar label="🎾 Técnico" value={avgTechnical} color="#3B82F6" />
                <RatingBar label="🎯 Táctico" value={avgTactical} color="#8B5CF6" />
                <RatingBar label="🧠 Mental" value={avgMental} color="#EC4899" />
              </View>
            </View>
          )}

          {/* Actividad mensual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Actividad Este Mes</Text>
            <View style={[
              styles.statsGrid,
              deviceType !== 'mobile' && styles.statsGridWide
            ]}>
              <StatCard 
                icon="🎾"
                value={matchesThisMonth}
                label="Partidos"
                color="#3B82F6"
              />
              <StatCard 
                icon="🏃"
                value={trainingsThisMonth}
                label="Entrenamientos"
                color="#8B5CF6"
              />
              <StatCard 
                icon="📊"
                value={matchesThisMonth + trainingsThisMonth}
                label="Total Sesiones"
                color="#10B981"
              />
            </View>
          </View>

          {/* Últimos 30 días */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Últimos 30 Días</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Partidos jugados</Text>
                <Text style={styles.summaryValue}>{recentMatches.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Entrenamientos</Text>
                <Text style={styles.summaryValue}>{recentTrainings}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Actividad total</Text>
                <Text style={styles.summaryValue}>{recentMatches.length + recentTrainings} sesiones</Text>
              </View>
            </View>
          </View>

          {/* Mensajes motivacionales */}
          {winRate >= 60 && (
            <View style={[styles.card, styles.motivationCard]}>
              <Text style={styles.motivationIcon}>🎉</Text>
              <Text style={styles.motivationText}>
                ¡Excelente win rate! Sigues mejorando constantemente.
              </Text>
            </View>
          )}

          {currentStreak >= 3 && (
            <View style={[styles.card, styles.motivationCard]}>
              <Text style={styles.motivationIcon}>🔥</Text>
              <Text style={styles.motivationText}>
                ¡Racha de {currentStreak} victorias! Estás en tu mejor momento.
              </Text>
            </View>
          )}

          {trainingsThisMonth >= 8 && (
            <View style={[styles.card, styles.motivationCard]}>
              <Text style={styles.motivationIcon}>💪</Text>
              <Text style={styles.motivationText}>
                Gran constancia este mes con {trainingsThisMonth} entrenamientos.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  color,
  subtitle 
}: { 
  icon: string; 
  value: string | number; 
  label: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function RatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  const percentage = (value / 5) * 100;
  
  return (
    <View style={styles.ratingBarContainer}>
      <View style={styles.ratingBarHeader}>
        <Text style={styles.ratingBarLabel}>{label}</Text>
        <Text style={[styles.ratingBarValue, { color }]}>
          {value.toFixed(1)}/5
        </Text>
      </View>
      <View style={styles.ratingBarTrack}>
        <View 
          style={[
            styles.ratingBarFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <View style={styles.ratingDots}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={[
              styles.ratingDot,
              i <= Math.round(value) && { backgroundColor: color }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: { minHeight: '100vh' as any, overflowX: 'hidden' as any }
    })
  },
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: { overflowY: 'auto' as any, WebkitOverflowScrolling: 'touch' as any }
    })
  },
  content: { flexGrow: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  statsGrid: { gap: 12 },
  statsGridWide: { flexDirection: 'row', flexWrap: 'wrap' }, // ⬅️ NUEVO
  statCard: { flex: 1, minWidth: 150, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  statSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  winRateValue: { fontSize: 28, fontWeight: '700' },
  progressBar: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 6 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-around' },
  recordLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  recordValueWin: { color: '#10B981', fontWeight: '700' },
  recordValueLoss: { color: '#EF4444', fontWeight: '700' },
  ratingBarContainer: { marginBottom: 20 },
  ratingBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ratingBarLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  ratingBarValue: { fontSize: 16, fontWeight: '700' },
  ratingBarTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  ratingBarFill: { height: '100%', borderRadius: 4 },
  ratingDots: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  ratingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  summaryValue: { fontSize: 16, color: '#1E293B', fontWeight: '700' },
  motivationCard: { backgroundColor: '#FEF3C7', borderColor: '#FDE047', flexDirection: 'row', alignItems: 'center', gap: 12 },
  motivationIcon: { fontSize: 32 },
  motivationText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: '600', lineHeight: 20 }
});
