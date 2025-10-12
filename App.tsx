import { SafeAreaView, StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </SafeAreaView>
  );
}