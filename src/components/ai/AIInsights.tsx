import Card from '@/components/common/Card'; import { Text } from 'react-native';
export default function AIInsights({ insights }: { insights?: string[] }){
  if(!insights?.length) return null;
  return (<Card><Text style={{ fontWeight:'700', marginBottom:8 }}>Insights de IA</Text>{insights.map((i,idx)=><Text key={idx}>• {i}</Text>)}</Card>);
}
