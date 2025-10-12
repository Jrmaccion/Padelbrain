import { View } from 'react-native'; import Header from '@/components/common/Header'; import ChatInterface from '@/components/ai/ChatInterface';
export default function AIAssistantScreen(){ return (<View style={{ flex:1, padding:16, gap:12 }}>
  <Header title='Asistente IA' /><ChatInterface />
</View>); }
