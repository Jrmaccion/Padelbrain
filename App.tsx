import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import PWAInstallPrompt from './src/components/common/PWAInstallPrompt';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar barStyle="dark-content" />
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <PWAInstallPrompt />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}