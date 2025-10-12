import { useState } from 'react';
import { View } from 'react-native';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Match } from '@/types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function MatchForm({ onSubmit }: { onSubmit: (m: Match) => void }) {
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      id: uuidv4(),
      date: new Date().toISOString(),
      result: { outcome: 'won', score },
      notes: notes || undefined,
    });
    setScore('');
    setNotes('');
  };

  return (
    <Card>
      <Input
        placeholder="Marcador (p.ej. 6-4 3-6 6-3)"
        value={score}
        onChangeText={setScore}
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
      <Button title="Guardar partido" onPress={handleSubmit} />
    </Card>
  );
}