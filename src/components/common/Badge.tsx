import { View, Text, StyleSheet, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  value?: number;
  dot?: boolean;
}

export default function Badge({ value, dot, style, ...rest }: BadgeProps) {
  if (dot) {
    return <View {...rest} style={[styles.dot, style]} />;
  }
  if (value == null || value <= 0) return null;
  return (
    <View {...rest} style={[styles.badge, style]}>
      <Text style={styles.text}>{value > 99 ? '99+' : value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
});
