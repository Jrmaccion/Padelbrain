import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useResponsive } from '@/constants/layout';

export default function Card({ children, style, ...rest }: ViewProps) {
  const { deviceType } = useResponsive();

  return (
    <View 
      {...rest} 
      style={[
        styles.card,
        deviceType === 'desktop' && styles.cardDesktop,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDesktop: {
    padding: 20,
    borderRadius: 20,
  },
});