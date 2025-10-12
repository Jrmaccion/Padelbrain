import { TextInput, TextInputProps } from 'react-native'; import { colors } from '@/constants/colors';
export default function Input(props: TextInputProps){
  return (<TextInput {...props} placeholderTextColor='#94A3B8'
    style={[{ borderWidth:1, borderColor:colors.border, borderRadius:12, padding:10, color:colors.text }, props.style]} />);
}
