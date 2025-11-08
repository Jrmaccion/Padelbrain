import { TextInput, TextInputProps } from 'react-native';
import { colors } from '@/constants/colors';

export default function Input(props: TextInputProps) {
  const {
    accessibilityLabel,
    accessibilityHint,
    placeholder,
    editable = true,
    ...restProps
  } = props;

  return (
    <TextInput
      {...restProps}
      editable={editable}
      placeholderTextColor='#94A3B8'
      accessibilityLabel={accessibilityLabel || placeholder}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !editable }}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 10,
          color: colors.text
        },
        props.style
      ]}
    />
  );
}
