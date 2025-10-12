import { View, Text } from 'react-native'; import { colors } from '@/constants/colors';
export default function Header({ title }: { title: string }){
  return (<View style={{ paddingVertical:12 }}><Text style={{ fontSize:22, fontWeight:'700', color:colors.text }}>{title}</Text></View>);
}
