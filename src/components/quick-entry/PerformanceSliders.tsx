import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface PerformanceSlidersProps {
  technical: number;
  tactical: number;
  mental: number;
  physical: number;
  onTechnicalChange: (value: number) => void;
  onTacticalChange: (value: number) => void;
  onMentalChange: (value: number) => void;
  onPhysicalChange: (value: number) => void;
}

interface SliderItemProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function SliderItem({ label, emoji, value, onChange, color }: SliderItemProps) {
  const getQualifier = (val: number) => {
    if (val < 20) return 'Muy bajo';
    if (val < 40) return 'Bajo';
    if (val < 60) return 'Regular';
    if (val < 80) return 'Bueno';
    return 'Excelente';
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>
          {emoji} {label}
        </Text>
        <Text style={[styles.sliderValue, { color }]}>
          {Math.round(value)}% - {getQualifier(value)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#E2E8F0"
        thumbTintColor={color}
      />
    </View>
  );
}

export default function PerformanceSliders({
  technical,
  tactical,
  mental,
  physical,
  onTechnicalChange,
  onTacticalChange,
  onMentalChange,
  onPhysicalChange
}: PerformanceSlidersProps) {
  return (
    <View style={styles.container}>
      <SliderItem
        label="Técnico"
        emoji="🎾"
        value={technical}
        onChange={onTechnicalChange}
        color="#3B82F6"
      />
      <SliderItem
        label="Táctico"
        emoji="🎯"
        value={tactical}
        onChange={onTacticalChange}
        color="#8B5CF6"
      />
      <SliderItem
        label="Mental"
        emoji="🧠"
        value={mental}
        onChange={onMentalChange}
        color="#EC4899"
      />
      <SliderItem
        label="Físico"
        emoji="💪"
        value={physical}
        onChange={onPhysicalChange}
        color="#10B981"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  sliderContainer: {
    marginBottom: 8
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155'
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '500'
  },
  slider: {
    width: '100%',
    height: 40
  }
});