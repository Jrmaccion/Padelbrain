import Card from '@/components/common/Card'; import { Text } from 'react-native';
export default function StatsCard({ title, value }: { title:string; value:string|number }){
  return (<Card><Text style={{ fontWeight:'700', marginBottom:6 }}>{title}</Text><Text>{value}</Text></Card>);
}
