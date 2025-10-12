import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
import TrainingsScreen from '@/screens/TrainingsScreen';
import MatchesScreen from '@/screens/MatchesScreen';
import StatsScreen from '@/screens/StatsScreen';
import AIAssistantScreen from '@/screens/AIAssistantScreen';

type Route = 'Home' | 'Trainings' | 'Matches' | 'Stats' | 'AI';

interface TabConfig {
  id: Route;
  label: string;
  icon: string;
}

const tabs: TabConfig[] = [
  { id: 'Home', label: 'Inicio', icon: '🏠' },
  { id: 'Trainings', label: 'Entrenar', icon: '🏃' },
  { id: 'Matches', label: 'Partidos', icon: '🎾' },
  { id: 'Stats', label: 'Stats', icon: '📊' },
  { id: 'AI', label: 'IA', icon: '🤖' }
];

export default function AppNavigator() {
  const [route, setRoute] = useState<Route>('Home');

  const renderScreen = () => {
    const nav = { navigate: (r: Route) => setRoute(r) } as any;
    
    switch (route) {
      case 'Home':
        return <HomeScreen navigation={nav} />;
      case 'Trainings':
        return <TrainingsScreen />;
      case 'Matches':
        return <MatchesScreen />;
      case 'Stats':
        return <StatsScreen />;
      case 'AI':
        return <AIAssistantScreen />;
      default:
        return <HomeScreen navigation={nav} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenido de la pantalla */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Barra de navegación inferior */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              route === tab.id && styles.tabActive
            ]}
            onPress={() => setRoute(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              route === tab.id && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginHorizontal: 4
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '700'
  }
});