import { View } from 'react-native';
import Header from '@/components/common/Header';
import ChatInterface from '@/components/ai/ChatInterface';
import { useResponsive } from '@/constants/layout'; // ⬅️ NUEVO

export default function AIAssistantScreen() {
  const { deviceType, layout: responsiveLayout } = useResponsive(); // ⬅️ NUEVO

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View
        style={
          deviceType !== 'mobile'
            ? { maxWidth: responsiveLayout.getMaxWidth(), alignSelf: 'center', width: '100%' }
            : undefined
        }
      >
        <Header title="Asistente IA" />
        <ChatInterface />
      </View>
    </View>
  );
}
