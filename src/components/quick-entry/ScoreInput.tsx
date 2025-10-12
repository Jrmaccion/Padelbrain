import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';

interface ScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  outcome: 'won' | 'lost';
  onOutcomeChange: (outcome: 'won' | 'lost') => void;
}

export default function ScoreInput({ value, onChange, outcome, onOutcomeChange }: ScoreInputProps) {
  const [sets, setSets] = useState<string[]>(['', '', '']);
  const [useKeyboard, setUseKeyboard] = useState(false);

  const handleSetScore = (setIndex: number, myScore: string, oppScore: string) => {
    const newSets = [...sets];
    if (myScore && oppScore) {
      newSets[setIndex] = `${myScore}-${oppScore}`;
    } else {
      newSets[setIndex] = '';
    }
    setSets(newSets);
    
    const finalScore = newSets.filter(s => s).join(' ');
    onChange(finalScore);
  };

  const ScoreButton = ({ number, onPress }: { number: number; onPress: () => void }) => (
    <TouchableOpacity style={styles.numberButton} onPress={onPress}>
      <Text style={styles.numberText}>{number}</Text>
    </TouchableOpacity>
  );

  const SetInput = ({ setNumber }: { setNumber: number }) => {
    const [myScore, setMyScore] = useState('');
    const [oppScore, setOppScore] = useState('');

    return (
      <View style={styles.setContainer}>
        <Text style={styles.setLabel}>Set {setNumber}</Text>
        <View style={styles.setScores}>
          <View style={styles.scoreColumn}>
            <Text style={styles.scoreLabel}>Yo</Text>
            <View style={styles.numberPad}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                <ScoreButton
                  key={num}
                  number={num}
                  onPress={() => {
                    setMyScore(num.toString());
                    handleSetScore(setNumber - 1, num.toString(), oppScore);
                  }}
                />
              ))}
            </View>
            <Text style={styles.currentScore}>{myScore || '-'}</Text>
          </View>
          
          <Text style={styles.vs}>VS</Text>
          
          <View style={styles.scoreColumn}>
            <Text style={styles.scoreLabel}>Rival</Text>
            <View style={styles.numberPad}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                <ScoreButton
                  key={num}
                  number={num}
                  onPress={() => {
                    setOppScore(num.toString());
                    handleSetScore(setNumber - 1, myScore, num.toString());
                  }}
                />
              ))}
            </View>
            <Text style={styles.currentScore}>{oppScore || '-'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎾 Marcador</Text>
      
      {/* Toggle resultado */}
      <View style={styles.outcomeToggle}>
        <TouchableOpacity
          style={[
            styles.outcomeButton,
            outcome === 'won' && styles.outcomeButtonWon
          ]}
          onPress={() => onOutcomeChange('won')}
        >
          <Text style={[
            styles.outcomeText,
            outcome === 'won' && styles.outcomeTextSelected
          ]}>
            ✅ Victoria
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.outcomeButton,
            outcome === 'lost' && styles.outcomeButtonLost
          ]}
          onPress={() => onOutcomeChange('lost')}
        >
          <Text style={[
            styles.outcomeText,
            outcome === 'lost' && styles.outcomeTextSelected
          ]}>
            ❌ Derrota
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle método entrada */}
      <View style={styles.methodToggle}>
        <TouchableOpacity
          style={[styles.methodButton, !useKeyboard && styles.methodButtonActive]}
          onPress={() => setUseKeyboard(false)}
        >
          <Text style={styles.methodText}>⌨️ Teclado Sets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.methodButton, useKeyboard && styles.methodButtonActive]}
          onPress={() => setUseKeyboard(true)}
        >
          <Text style={styles.methodText}>✏️ Escribir</Text>
        </TouchableOpacity>
      </View>

      {useKeyboard ? (
        <TextInput
          style={styles.textInput}
          placeholder="Ej: 6-4 3-6 7-5"
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <View style={styles.setsContainer}>
          <SetInput setNumber={1} />
          <SetInput setNumber={2} />
          <SetInput setNumber={3} />
        </View>
      )}

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Marcador final:</Text>
        <Text style={styles.previewScore}>{value || 'Sin introducir'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155'
  },
  outcomeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  outcomeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  outcomeButtonWon: {
    backgroundColor: '#10B981',
    borderColor: '#059669'
  },
  outcomeButtonLost: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626'
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B'
  },
  outcomeTextSelected: {
    color: '#FFFFFF'
  },
  methodToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  methodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  methodButtonActive: {
    backgroundColor: '#3B82F6'
  },
  methodText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF'
  },
  setsContainer: {
    gap: 16
  },
  setContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12
  },
  setLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8
  },
  setScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  scoreColumn: {
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    gap: 4
  },
  numberButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  numberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  currentScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8
  },
  vs: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8'
  },
  preview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
    marginBottom: 4
  },
  previewScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A'
  }
});