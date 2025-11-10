import { useEffect, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import Header from '@/components/common/Header';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useResponsive } from '@/constants/layout';
import {
  generateInsights,
  calculateLocationStats,
  calculatePartnerStats,
  calculateMonthlyTrends,
  analyzeStrengthsWeaknesses,
  calculatePerformanceSummary,
  type AutoInsight,
  type LocationStats,
  type PartnerStats,
} from '@/services/advancedStats';

export default function StatsScreen() {
  const { items: matches, load: loadMatches } = useMatches();
  const { items: trainings, load: loadTrainings } = useTrainings();
  const { deviceType, layout: responsiveLayout } = useResponsive();

  useEffect(() => {
    loadMatches();
    loadTrainings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate all stats
  const summary = useMemo(
    () => calculatePerformanceSummary(matches, trainings),
    [matches, trainings]
  );
  const insights = useMemo(() => generateInsights(matches, trainings), [matches, trainings]);
  const locationStats = useMemo(() => calculateLocationStats(matches), [matches]);
  const partnerStats = useMemo(() => calculatePartnerStats(matches), [matches]);
  const monthlyTrends = useMemo(() => calculateMonthlyTrends(matches), [matches]);
  const { topStrengths, topWeaknesses } = useMemo(
    () => analyzeStrengthsWeaknesses(matches),
    [matches]
  );

  // Current streak
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [matches]
  );
  let currentStreak = 0;
  for (const match of sortedMatches) {
    if (match.result?.outcome === 'won') {
      currentStreak++;
    } else {
      break;
    }
  }

  const getTrendIcon = () => {
    if (summary.trend === 'improving') return '📈';
    if (summary.trend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendColor = () => {
    if (summary.trend === 'improving') return '#10B981';
    if (summary.trend === 'declining') return '#EF4444';
    return '#64748B';
  };

  return (
    <View style={styles.container}>
      <Header title="Estadísticas" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View
          style={[
            deviceType !== 'mobile' && {
              maxWidth: responsiveLayout.getMaxWidth(),
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          {/* Auto Insights */}
          {insights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Insights Automáticos</Text>
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </View>
          )}

          {/* Performance Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Resumen General</Text>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Win Rate Global</Text>
                <View style={styles.trendBadge}>
                  <Text style={[styles.trendText, { color: getTrendColor() }]}>
                    {getTrendIcon()}{' '}
                    {summary.trend === 'improving'
                      ? 'Mejorando'
                      : summary.trend === 'declining'
                        ? 'Bajando'
                        : 'Estable'}
                  </Text>
                </View>
              </View>
              <View style={styles.winRateDisplay}>
                <Text
                  style={[
                    styles.winRateValue,
                    { color: summary.winRate >= 50 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {summary.winRate}%
                </Text>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>
                    Victorias: <Text style={styles.recordValueWin}>{summary.wins}</Text>
                  </Text>
                  <Text style={styles.recordLabel}>
                    Derrotas: <Text style={styles.recordValueLoss}>{summary.losses}</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${summary.winRate}%`,
                      backgroundColor: summary.winRate >= 50 ? '#10B981' : '#EF4444',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={[styles.statsGrid, deviceType !== 'mobile' && styles.statsGridWide]}>
              <StatCard
                icon="🎾"
                value={summary.totalMatches}
                label="Total Partidos"
                color="#3B82F6"
              />
              <StatCard
                icon="🏃"
                value={summary.totalTrainings}
                label="Total Entrenamientos"
                color="#8B5CF6"
              />
              {currentStreak > 0 && (
                <StatCard icon="🔥" value={currentStreak} label="Racha Actual" color="#F59E0B" />
              )}
            </View>
          </View>

          {/* Recent Performance (Last 30 days) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Últimos 30 Días</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Partidos jugados</Text>
                <Text style={styles.summaryValue}>{summary.recentMatches}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Entrenamientos</Text>
                <Text style={styles.summaryValue}>{summary.recentTrainings}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Win Rate reciente</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: summary.recentWinRate >= 50 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {summary.recentWinRate}%
                </Text>
              </View>
            </View>
          </View>

          {/* Location Performance */}
          {locationStats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Rendimiento por Ubicación</Text>
              {locationStats.slice(0, 5).map((stat, index) => (
                <LocationStatCard key={index} stat={stat} />
              ))}
            </View>
          )}

          {/* Partner Stats */}
          {partnerStats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 Rendimiento con Compañeros</Text>
              {partnerStats.slice(0, 5).map((stat, index) => (
                <PartnerStatCard key={index} stat={stat} rank={index + 1} />
              ))}
            </View>
          )}

          {/* Monthly Trends */}
          {monthlyTrends.some((t) => t.matches > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Evolución Mensual</Text>
              <View style={styles.card}>
                <View style={styles.trendChart}>
                  {monthlyTrends
                    .filter((t) => t.matches > 0)
                    .map((trend, index) => (
                      <View key={index} style={styles.trendBar}>
                        <View style={styles.trendBarHeader}>
                          <Text style={styles.trendPeriod}>{trend.period}</Text>
                          <Text style={styles.trendWinRate}>{trend.winRate}%</Text>
                        </View>
                        <View style={styles.trendBarTrack}>
                          <View
                            style={[
                              styles.trendBarFill,
                              {
                                width: `${trend.winRate}%`,
                                backgroundColor: trend.winRate >= 50 ? '#10B981' : '#EF4444',
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.trendMatches}>
                          {trend.wins}V - {trend.matches - trend.wins}D
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          )}

          {/* Strengths Analysis */}
          {topStrengths.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Fortalezas Más Frecuentes</Text>
              <View style={styles.card}>
                {topStrengths.map((strength, index) => (
                  <View key={index} style={styles.strengthWeaknessRow}>
                    <View style={styles.strengthWeaknessInfo}>
                      <Text style={styles.strengthWeaknessName}>{strength.strength}</Text>
                      <Text style={styles.strengthWeaknessCount}>{strength.count} veces</Text>
                    </View>
                    <Text style={[styles.strengthWeaknessWinRate, { color: '#10B981' }]}>
                      {strength.winRate}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Weaknesses Analysis */}
          {topWeaknesses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Áreas de Mejora Frecuentes</Text>
              <View style={styles.card}>
                {topWeaknesses.map((weakness, index) => (
                  <View key={index} style={styles.strengthWeaknessRow}>
                    <View style={styles.strengthWeaknessInfo}>
                      <Text style={styles.strengthWeaknessName}>{weakness.strength}</Text>
                      <Text style={styles.strengthWeaknessCount}>{weakness.count} veces</Text>
                    </View>
                    <Text style={[styles.strengthWeaknessWinRate, { color: '#EF4444' }]}>
                      {weakness.winRate}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: AutoInsight }) {
  const bgColor =
    insight.type === 'positive' ? '#D1FAE5' : insight.type === 'negative' ? '#FEE2E2' : '#FEF3C7';
  const borderColor =
    insight.type === 'positive' ? '#10B981' : insight.type === 'negative' ? '#EF4444' : '#F59E0B';
  const textColor =
    insight.type === 'positive' ? '#065F46' : insight.type === 'negative' ? '#991B1B' : '#92400E';

  return (
    <View style={[styles.insightCard, { backgroundColor: bgColor, borderColor }]}>
      <Text style={styles.insightIcon}>{insight.icon}</Text>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: textColor }]}>{insight.title}</Text>
        <Text style={[styles.insightMessage, { color: textColor }]}>{insight.message}</Text>
      </View>
    </View>
  );
}

// Location Stat Card
function LocationStatCard({ stat }: { stat: LocationStats }) {
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationName}>📍 {stat.location}</Text>
        <Text
          style={[styles.locationWinRate, { color: stat.winRate >= 50 ? '#10B981' : '#EF4444' }]}
        >
          {stat.winRate}%
        </Text>
      </View>
      <View style={styles.locationStats}>
        <Text style={styles.locationDetail}>
          {stat.matches} partidos • {stat.wins}V - {stat.losses}D
        </Text>
      </View>
      <View style={styles.locationProgressBar}>
        <View
          style={[
            styles.locationProgressFill,
            {
              width: `${stat.winRate}%`,
              backgroundColor: stat.winRate >= 50 ? '#10B981' : '#EF4444',
            },
          ]}
        />
      </View>
    </View>
  );
}

// Partner Stat Card
function PartnerStatCard({ stat, rank }: { stat: PartnerStats; rank: number }) {
  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '👤';

  return (
    <View style={styles.partnerCard}>
      <View style={styles.partnerHeader}>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerRank}>{medalEmoji}</Text>
          <View>
            <Text style={styles.partnerName}>{stat.name}</Text>
            <Text style={styles.partnerDetail}>
              {stat.matches} partidos • {stat.wins}V - {stat.losses}D
            </Text>
          </View>
        </View>
        <Text
          style={[styles.partnerWinRate, { color: stat.winRate >= 50 ? '#10B981' : '#EF4444' }]}
        >
          {stat.winRate}%
        </Text>
      </View>
    </View>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  content: { flexGrow: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 12 },

  // Insights
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    gap: 12,
  },
  insightIcon: { fontSize: 28 },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  insightMessage: { fontSize: 13, lineHeight: 18 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },

  // Win Rate Display
  winRateDisplay: { alignItems: 'center', marginBottom: 16 },
  winRateValue: { fontSize: 48, fontWeight: '700', marginBottom: 8 },
  recordRow: { flexDirection: 'row', gap: 20 },
  recordLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  recordValueWin: { color: '#10B981', fontWeight: '700' },
  recordValueLoss: { color: '#EF4444', fontWeight: '700' },

  // Progress Bar
  progressBar: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },

  // Trend Badge
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  trendText: { fontSize: 13, fontWeight: '600' },

  // Stats Grid
  statsGrid: { gap: 12 },
  statsGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', textAlign: 'center' },

  // Summary Rows
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  summaryValue: { fontSize: 16, color: '#1E293B', fontWeight: '700' },

  // Location Cards
  locationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  locationWinRate: { fontSize: 18, fontWeight: '700' },
  locationStats: { marginBottom: 8 },
  locationDetail: { fontSize: 13, color: '#64748B' },
  locationProgressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  locationProgressFill: { height: '100%', borderRadius: 3 },

  // Partner Cards
  partnerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  partnerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  partnerRank: { fontSize: 24 },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  partnerDetail: { fontSize: 12, color: '#64748B' },
  partnerWinRate: { fontSize: 20, fontWeight: '700' },

  // Trend Chart
  trendChart: { gap: 12 },
  trendBar: { gap: 4 },
  trendBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendPeriod: { fontSize: 13, color: '#64748B', fontWeight: '600', textTransform: 'capitalize' },
  trendWinRate: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  trendBarTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  trendBarFill: { height: '100%', borderRadius: 4 },
  trendMatches: { fontSize: 11, color: '#94A3B8' },

  // Strength/Weakness Rows
  strengthWeaknessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  strengthWeaknessInfo: { flex: 1 },
  strengthWeaknessName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  strengthWeaknessCount: { fontSize: 12, color: '#64748B' },
  strengthWeaknessWinRate: { fontSize: 18, fontWeight: '700' },
});
