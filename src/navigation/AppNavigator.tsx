import { useEffect, useState } from 'react';
import { Platform, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
import TrainingsScreen from '@/screens/TrainingsScreen';
import MatchesScreen from '@/screens/MatchesScreen';
import StatsScreen from '@/screens/StatsScreen';
import { useResponsive } from '@/constants/layout';
import Tooltip from '@/components/common/Tooltip';
import Badge from '@/components/common/Badge';
import ReportsScreen from '@/screens/ReportsScreen';

type Route = 'Home' | 'Trainings' | 'Matches' | 'Stats' | 'Reports';

interface TabConfig {
  id: Route;
  label: string;
  icon: string;
  tooltip?: string;
  badgeKey?: 'aiUnread' | 'statsAlerts'; // extensible
}

const tabs: TabConfig[] = [
  { id: 'Home',      label: 'Inicio',     icon: '🏠', tooltip: 'Inicio' },
  { id: 'Trainings', label: 'Entrenar',   icon: '🏃', tooltip: 'Entrenamientos' },
  { id: 'Matches',   label: 'Partidos',   icon: '🎾', tooltip: 'Partidos' },
  { id: 'Stats',     label: 'Stats',      icon: '📊', tooltip: 'Estadísticas', badgeKey: 'statsAlerts' },
  { id: 'AI',        label: 'IA',         icon: '🤖', tooltip: 'Asistente IA', badgeKey: 'aiUnread' },
  { id: 'Reports',   label: 'Informes',   icon: '🧾', tooltip: 'Exportar/Informes' },
];

export default function AppNavigator() {
  const [route, setRoute] = useState<Route>('Home');
  const { deviceType, layout: responsiveLayout } = useResponsive();
  const isMobile = deviceType === 'mobile';

  // Estado de ejemplo para badges (conéctalo a tu store si lo tienes)
  const [aiUnread, setAiUnread] = useState(3);
  const [statsAlerts, setStatsAlerts] = useState(0);

  // Atajos de teclado (web): 1..5 seleccionan la pestaña
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Route> = {
        '1': 'Home', '2': 'Trainings', '3': 'Matches', '4': 'Stats', '5': 'AI', '6': 'Reports'
      };
      if (map[e.key]) setRoute(map[e.key]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getBadgeValue = (key?: TabConfig['badgeKey']) => {
    if (!key) return undefined;
    if (key === 'aiUnread') return aiUnread;
    if (key === 'statsAlerts') return statsAlerts;
    return undefined;
  };

  const renderScreen = () => {
    const nav = { navigate: (r: Route) => setRoute(r) } as any;
    switch (route) {
      case 'Home':      return <HomeScreen navigation={nav} />;
      case 'Trainings': return <TrainingsScreen />;
      case 'Matches':   return <MatchesScreen />;
      case 'Stats':     return <StatsScreen />;
      case 'AI':        return <AIAssistantScreen />;
      case 'Reports':   return <ReportsScreen />;
      default:          return <HomeScreen navigation={nav} />;
    }
  };

  const NavItem = ({
    tab,
    active,
    variant,
    onPress
  }: {
    tab: TabConfig;
    active: boolean;
    variant: 'bottom' | 'side' | 'top';
    onPress: () => void;
  }) => {
    const iconStyle =
      variant === 'bottom' ? styles.tabIcon :
      variant === 'side'   ? styles.sideTabIcon : styles.topTabIcon;

    const baseStyle =
      variant === 'bottom' ? styles.tab :
      variant === 'side'   ? styles.sideTab : styles.topTab;

    const activeStyle =
      variant === 'bottom' ? styles.tabActive :
      variant === 'side'   ? styles.sideTabActive : styles.topTabActive;

    const labelStyle =
      variant === 'bottom' ? styles.tabLabel :
      variant === 'side'   ? styles.sideTabLabel : styles.topTabLabel;

    const labelActiveStyle =
      variant === 'bottom' ? styles.tabLabelActive :
      variant === 'side'   ? styles.sideTabLabelActive : styles.topTabLabelActive;

    const badgeValue = getBadgeValue(tab.badgeKey);

    const Inner = (
      <TouchableOpacity
        key={tab.id}
        style={[baseStyle, active && activeStyle]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
      >
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={iconStyle}>{tab.icon}</Text>
          {/* Badge en esquina superior derecha del icono */}
          {!!badgeValue && badgeValue > 0 && (
            <Badge value={badgeValue} style={styles.iconBadge} />
          )}
        </View>
        <Text style={[labelStyle, active && labelActiveStyle]}>{tab.label}</Text>
      </TouchableOpacity>
    );

    // Tooltip sólo en web y para side/top
    if (Platform.OS === 'web' && (variant === 'side' || variant === 'top')) {
      return (
        <Tooltip key={tab.id} text={tab.tooltip || tab.label} side={variant === 'side' ? 'right' : 'bottom'}>
          {Inner}
        </Tooltip>
      );
    }
    return Inner;
  };

  // Preferencia: top bar en pantallas muy anchas; rail por defecto en tablet/desktop
  const preferTopBar = responsiveLayout.getMaxWidth() >= 1100;

  if (isMobile) {
    // --- MÓVIL: barra inferior
    return (
      <View style={styles.container}>
        <View style={styles.content}>{renderScreen()}</View>
        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <NavItem
              key={tab.id}
              tab={tab}
              active={route === tab.id}
              variant="bottom"
              onPress={() => setRoute(tab.id)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (preferTopBar) {
    // --- ESCRITORIO ancho: top bar
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>PadelBrain</Text>
          <View style={styles.topTabs}>
            {tabs.map(tab => (
              <NavItem
                key={tab.id}
                tab={tab}
                active={route === tab.id}
                variant="top"
                onPress={() => setRoute(tab.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.topContent}>
          <View
            style={{
              maxWidth: responsiveLayout.getMaxWidth(),
              alignSelf: 'center',
              width: '100%',
              flex: 1
            }}
          >
            {renderScreen()}
          </View>
        </View>
      </View>
    );
  }

  // --- TABLET/ESCRITORIO: rail lateral
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.sideBar}>
          <Text style={styles.brandSide}>PadelBrain</Text>
          {tabs.map(tab => (
            <NavItem
              key={tab.id}
              tab={tab}
              active={route === tab.id}
              variant="side"
              onPress={() => setRoute(tab.id)}
            />
          ))}
        </View>
        <View style={styles.sideContent}>
          <View
            style={{
              maxWidth: responsiveLayout.getMaxWidth(),
              alignSelf: 'center',
              width: '100%',
              flex: 1
            }}
          >
            {renderScreen()}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // base
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // móvil
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    paddingBottom: 8, paddingTop: 8,
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabActive: { backgroundColor: '#EFF6FF', borderRadius: 8, marginHorizontal: 4 },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tabLabelActive: { color: '#3B82F6', fontWeight: '700' },

  // rail lateral
  row: { flex: 1, flexDirection: 'row' },
  sideBar: {
    width: 232,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1, borderRightColor: '#E2E8F0',
    paddingVertical: 12, paddingHorizontal: 10, gap: 6,
  },
  brandSide: {
    fontSize: 16, fontWeight: '800', color: '#0F172A',
    marginBottom: 10, paddingHorizontal: 6,
  },
  sideTab: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
  },
  sideTabActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  sideTabIcon: { fontSize: 20 },
  sideTabLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  sideTabLabelActive: { color: '#1D4ED8', fontWeight: '700' },
  sideContent: { flex: 1, padding: 16 },

  iconBadge: {
    position: 'absolute',
    right: -6, top: -4,
  },

  // top bar
  topBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  topTabs: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  topTab: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
  },
  topTabActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  topTabIcon: { fontSize: 18 },
  topTabLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  topTabLabelActive: { color: '#1D4ED8', fontWeight: '700' },

  // top content wrapper
  topContent: { flex: 1, padding: 16 },
});
