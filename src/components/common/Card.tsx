import { View, ViewProps } from 'react-native'; import { colors } from '@/constants/colors';
export default function Card({ children, style, ...rest }: ViewProps){
  return (<View {...rest} style={[{ backgroundColor: colors.card, padding:14, borderRadius:16, borderWidth:1, borderColor: colors.border }, style]}>{children}</View>);
}
