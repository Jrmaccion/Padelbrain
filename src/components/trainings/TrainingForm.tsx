import { useState } from 'react';
import { View } from 'react-native';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Training } from '@/types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function TrainingForm({ onSubmit }: { onSubmit: (t: Training) => void }) {
  const [coach, setCoach] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      id: uuidv4(),
      date: new Date().toISOString(),
      coach: coach || undefined,
      notes: notes || undefined,
    });
    setCoach('');
    setNotes('');
  };

  return (
    <Card>
      <Input
        placeholder="Entrenador"
        value={coach}
        onChangeText={setCoach}
        style={{ marginBottom: 10 }}
      />
      <Input
        placeholder="Notas"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={{ marginBottom: 10 }}
      />
      <Button title="Guardar entrenamiento" onPress={handleSubmit} />
    </Card>
  );
}