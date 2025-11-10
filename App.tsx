import { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ProfileSelectionScreen } from './src/screens/ProfileSelectionScreen';
import { colors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import PWAInstallPrompt from './src/components/common/PWAInstallPrompt';
import { useUserStore } from './src/store/useUserStore';
import { useDataStore } from './src/store/useDataStore';
import { initSentry } from './src/services/sentry';
import { logger } from './src/services/logger';

// Initialize Sentry as early as possible
initSentry();

export default function App() {
  const { activeUser, loadActiveUser } = useUserStore();
  const { setActiveUser: setDataUser } = useDataStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load active user from storage
        await loadActiveUser();

        // If there's an active user, load their data
        if (activeUser) {
          await setDataUser(activeUser.id);
          logger.info('App initialized with active user', { userId: activeUser.id });
        } else {
          logger.info('App initialized without active user');
        }
      } catch (error) {
        logger.error('Failed to initialize app', error as Error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Re-initialize data store when active user changes
  useEffect(() => {
    if (!isInitializing && activeUser) {
      setDataUser(activeUser.id).catch((error) => {
        logger.error('Failed to load user data', error as Error);
      });
    }
  }, [activeUser?.id]);

  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Inicializando PadelBrain...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar barStyle="dark-content" />
          <View style={{ flex: 1 }}>
            {activeUser ? (
              <>
                <AppNavigator />
                <PWAInstallPrompt />
              </>
            ) : (
              <ProfileSelectionScreen />
            )}
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
