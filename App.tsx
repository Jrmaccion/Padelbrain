import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar barStyle="dark-content" />
          <View style={{ flex: 1 }}>
            <AppNavigator />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}