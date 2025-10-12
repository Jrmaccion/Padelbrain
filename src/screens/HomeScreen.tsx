import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Header from '@/components/common/Header';
import { useTrainings } from '@/hooks/useTrainings';
import { useMatches } from '@/hooks/useMatches';
import { useResponsive } from '@/constants/layout'; // ⬅️ NUEVO

interface HomeScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { items: trainings, load: loadTrainings } = useTrainings();
  const { items: matches, load: loadMatches } = useMatches();
  const { deviceType, layout: responsiveLayout } = useResponsive(); // ⬅️ NUEVO
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadTrainings();
    loadMatches();
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  };

  const totalTrainings = trainings.length;
  const totalMatches = matches.length;
  const wins = matches.filter(m => m.result?.outcome === 'won').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentTrainings = trainings.filter(t => new Date(t.date) > weekAgo).length;
  const recentMatches = matches.filter(m => new Date(m.date) > weekAgo).length;

  const lastTraining = trainings[0];
  const lastMatch = matches[0];

  const quickActions = [
    { id: 'training', title: '🏃 Nuevo Entrenamiento', subtitle: 'Registra tu sesión', color: '#3B82F6', route: 'Trainings' },
    { id: 'match', title: '🎾 Nuevo Partido', subtitle: 'Guarda el resultado', color: '#8B5CF6', route: 'Matches' },
    { id: 'stats', title: '📊 Ver Estadísticas', subtitle: 'Analiza tu progreso', color: '#10B981', route: 'Stats' },
    { id: 'ai', title: '🤖 Asistente IA', subtitle: 'Obtén recomendaciones', color: '#F59E0B', route: 'AI' }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Wrapper con max-width en desktop */}
      <View style={[
        styles.wrapper,
        deviceType !== 'mobile' && {
          maxWidth: responsiveLayout.getMaxWidth(),
          alignSelf: 'center',
          width: '100%',
        }
      ]}>
        <Header title="PadelBrain" />

        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.subGreeting}>
            {recentTrainings + recentMatches > 0 
              ? `Has sido muy activo esta semana`
              : 'Registra tu primera sesión'
            }
          </Text>
        </View>

        {/* Estadísticas - Grid responsive */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📈 Resumen</Text>
          <View style={[
            styles.statsGrid,
            deviceType !== 'mobile' && styles.statsGridWide
          ]}>
            <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{totalTrainings}</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
              {recentTrainings > 0 && (
                <Text style={styles.statBadge}>+{recentTrainings} esta semana</Text>
              )}
            </View>

            <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{totalMatches}</Text>
              <Text style={styles.statLabel}>Partidos</Text>
              {recentMatches > 0 && (
                <Text style={styles.statBadge}>+{recentMatches} esta semana</Text>
              )}
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={styles.statBadge}>{wins}V - {totalMatches - wins}D</Text>
            </View>
          </View>
        </View>

        {/* Actividad reciente - Grid en desktop/tablet */}
        {(lastTraining || lastMatch) && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>🕐 Actividad Reciente</Text>
            
            <View style={[
              styles.recentGrid,
              deviceType !== 'mobile' && styles.recentGridWide
            ]}>
              {lastTraining && (
                <View style={[
                  styles.recentCard,
                  deviceType !== 'mobile' && styles.recentCardWide
                ]}>
                  <View style={styles.recentIconContainer}>
                    <Text style={styles.recentIcon}>🏃</Text>
                  </View>
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>Último Entrenamiento</Text>
                    <Text style={styles.recentDate}>
                      {new Date(lastTraining.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </Text>
                    {lastTraining.coach && (
                      <Text style={styles.recentDetail}>Con {lastTraining.coach}</Text>
                    )}
                  </View>
                </View>
              )}

              {lastMatch && (
                <View style={[
                  styles.recentCard,
                  deviceType !== 'mobile' && styles.recentCardWide
                ]}>
                  <View style={styles.recentIconContainer}>
                    <Text style={styles.recentIcon}>
                      {lastMatch.result?.outcome === 'won' ? '🏆' : '🎾'}
                    </Text>
                  </View>
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>Último Partido</Text>
                    <Text style={styles.recentDate}>
                      {new Date(lastMatch.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </Text>
                    {lastMatch.result?.score && (
                      <Text style={styles.recentDetail}>
                        {lastMatch.result.outcome === 'won' ? 'Victoria' : 'Derrota'} - {lastMatch.result.score}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Acciones rápidas - Grid en desktop/tablet */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <View style={[
            styles.actionsGrid,
            deviceType !== 'mobile' && styles.actionsGridWide
          ]}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionCard,
                  { borderLeftColor: action.color },
                  deviceType !== 'mobile' && styles.actionCardWide
                ]}
                onPress={() => navigation.navigate(action.route)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {totalTrainings + totalMatches === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎾</Text>
            <Text style={styles.emptyTitle}>¡Bienvenido a PadelBrain!</Text>
            <Text style={styles.emptyText}>
              Comienza registrando tu primer entrenamiento o partido para empezar a analizar tu progreso.
            </Text>
          </View>
        )}

        {recentTrainings + recentMatches >= 5 && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationIcon}>🔥</Text>
            <Text style={styles.motivationText}>
              ¡Increíble! Has sido muy constante esta semana. Sigue así!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  wrapper: {
    // Max-width aplicado dinámicamente
  },
  greetingSection: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  greeting: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subGreeting: { fontSize: 15, color: '#64748B' },
  statsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  statsGrid: { gap: 12 },
  statsGridWide: { flexDirection: 'row', flexWrap: 'wrap' }, // ⬅️ NUEVO
  statCard: { flex: 1, minWidth: 200, padding: 16, borderRadius: 12, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  statValue: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  statBadge: { fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: '500' },
  recentSection: { padding: 20, paddingTop: 0 },
  recentGrid: { gap: 12 },
  recentGridWide: { flexDirection: 'row', flexWrap: 'wrap' }, // ⬅️ NUEVO
  recentCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  recentCardWide: { flex: 1, minWidth: 400 }, // ⬅️ NUEVO
  recentIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recentIcon: { fontSize: 24 },
  recentContent: { flex: 1, justifyContent: 'center' },
  recentTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  recentDate: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  recentDetail: { fontSize: 12, color: '#94A3B8' },
  actionsSection: { padding: 20, paddingTop: 0 },
  actionsGrid: { gap: 12 },
  actionsGridWide: { flexDirection: 'row', flexWrap: 'wrap' }, // ⬅️ NUEVO
  actionCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  actionCardWide: { flex: 1, minWidth: 250 }, // ⬅️ NUEVO
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  actionSubtitle: { fontSize: 13, color: '#64748B' },
  emptyState: { alignItems: 'center', padding: 40, marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  motivationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 16, marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#FDE047', gap: 12 },
  motivationIcon: { fontSize: 32 },
  motivationText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: '600', lineHeight: 20 }
});