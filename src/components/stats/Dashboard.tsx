import { View } from 'react-native'; import StatsCard from './StatsCard'; import ProgressChart from './ProgressChart';
export default function Dashboard({ stats }: { stats:{ totalMatches:number; winrate:number; totalTrainings:number } }){
  return (<View style={{ gap:12 }}>
    <StatsCard title='Partidos' value={stats.totalMatches} />
    <StatsCard title='Winrate (%)' value={stats.winrate} />
    <StatsCard title='Entrenamientos' value={stats.totalTrainings} />
    <ProgressChart />
  </View>);
}
