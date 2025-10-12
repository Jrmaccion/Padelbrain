// src/components/common/Tooltip.tsx
import { useState } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface TooltipProps extends Omit<PressableProps, 'style'> {
  text: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  containerStyle?: StyleProp<ViewStyle>;
  /** Permite pasar style como objeto/array o función como en Pressable */
  style?: PressableProps['style'];
}

export default function Tooltip({
  text,
  children,
  side = 'top',
  style,
  containerStyle,
  ...rest
}: TooltipProps) {
  const [hover, setHover] = useState(false);
  const isWeb = Platform.OS === 'web';

  // Componer estilo de Pressable sin romper la firma (función o StyleProp)
  const composedStyle: PressableProps['style'] =
    typeof style === 'function'
      ? (state) => [
          { position: 'relative' } as ViewStyle,
          style(state), // respetamos el callback del usuario
        ]
      : [{ position: 'relative' } as ViewStyle, style as StyleProp<ViewStyle>];

  return (
    <View style={containerStyle}>
      <Pressable
        {...rest}
        style={composedStyle}
        onHoverIn={(e) => {
          rest.onHoverIn?.(e);
          if (isWeb) setHover(true);
        }}
        onHoverOut={(e) => {
          rest.onHoverOut?.(e);
          if (isWeb) setHover(false);
        }}
        onLongPress={(e) => {
          rest.onLongPress?.(e);
          if (!isWeb) setHover((v) => !v); // opción móvil
        }}
        accessibilityRole="text"
        accessibilityLabel={text}
      >
        {children}

        {hover ? (
          <View style={[styles.bubble, styles[`side_${side}` as const]]}>
            <Text style={styles.bubbleText}>{text}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1000,
    maxWidth: 220,
  },
  bubbleText: {
    color: '#F9FAFB',
    fontSize: 12,
  },
  side_top: { bottom: '100%', left: 0, marginBottom: 8 },
  side_bottom: { top: '100%', left: 0, marginTop: 8 },
  side_left: { right: '100%', top: 0, marginRight: 8 },
  side_right: { left: '100%', top: 0, marginLeft: 8 },
});
