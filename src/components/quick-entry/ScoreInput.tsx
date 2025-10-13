import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';

interface ScoreInputProps {
  value: string;
  onChange: (value: string) => void;
  outcome: 'won' | 'lost';
  onOutcomeChange: (outcome: 'won' | 'lost') => void;
}

export default function ScoreInput({ value, onChange, outcome, onOutcomeChange }: ScoreInputProps) {
  const [useKeyboard, setUseKeyboard] = useState(false);

  // Store scores for each set as { my: string, opp: string }
  const [setScores, setSetScores] = useState<Array<{ my: string; opp: string }>>([
    { my: '', opp: '' },
    { my: '', opp: '' },
    { my: '', opp: '' }
  ]);

  const updateScore = (setIndex: number, field: 'my' | 'opp', value: string) => {
    const newSetScores = [...setScores];
    newSetScores[setIndex] = { ...newSetScores[setIndex], [field]: value };
    setSetScores(newSetScores);

    // Build final score string from all sets
    const finalScore = newSetScores
      .filter(set => set.my && set.opp)
      .map(set => `${set.my}-${set.opp}`)
      .join(' ');

    onChange(finalScore);
  };

  const SetInput = ({ setNumber }: { setNumber: number }) => {
    const setIndex = setNumber - 1;
    const myScore = setScores[setIndex].my;
    const oppScore = setScores[setIndex].opp;
    const hasScore = myScore || oppScore;

    const clearSet = () => {
      const newSetScores = [...setScores];
      newSetScores[setIndex] = { my: '', opp: '' };
      setSetScores(newSetScores);

      const finalScore = newSetScores
        .filter(set => set.my && set.opp)
        .map(set => `${set.my}-${set.opp}`)
        .join(' ');
      onChange(finalScore);
    };

    return (
      <View style={styles.setContainer}>
        <View style={styles.setHeader}>
          <Text style={styles.setLabel}>Set {setNumber}</Text>
          {hasScore && (
            <TouchableOpacity onPress={clearSet} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕ Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Large score display at top - always visible above your finger */}
        <View style={styles.scoreDisplay}>
          <View style={styles.scoreDisplaySide}>
            <Text style={styles.scoreDisplayLabel}>Yo</Text>
            <Text style={[styles.scoreDisplayNumber, myScore && styles.scoreDisplayNumberActive]}>
              {myScore || '-'}
            </Text>
          </View>
          <Text style={styles.scoreDisplayDash}>-</Text>
          <View style={styles.scoreDisplaySide}>
            <Text style={styles.scoreDisplayLabel}>Rival</Text>
            <Text style={[styles.scoreDisplayNumber, oppScore && styles.scoreDisplayNumberActive]}>
              {oppScore || '-'}
            </Text>
          </View>
        </View>

        {/* Vertical selector buttons - tap from bottom, see result above */}
        <View style={styles.selectorsRow}>
          <View style={styles.selectorColumn}>
            <Text style={styles.selectorColumnLabel}>Yo</Text>
            <View style={styles.verticalSelector}>
              {[7, 6, 5, 4, 3, 2, 1, 0].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.selectorButton,
                    myScore === num.toString() && styles.selectorButtonActive
                  ]}
                  onPress={() => updateScore(setIndex, 'my', num.toString())}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.selectorButtonText,
                    myScore === num.toString() && styles.selectorButtonTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectorDivider} />

          <View style={styles.selectorColumn}>
            <Text style={styles.selectorColumnLabel}>Rival</Text>
            <View style={styles.verticalSelector}>
              {[7, 6, 5, 4, 3, 2, 1, 0].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.selectorButton,
                    oppScore === num.toString() && styles.selectorButtonActive
                  ]}
                  onPress={() => updateScore(setIndex, 'opp', num.toString())}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.selectorButtonText,
                    oppScore === num.toString() && styles.selectorButtonTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  setLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FEE2E2'
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B'
  },
  // Large score display at top
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  scoreDisplaySide: {
    alignItems: 'center',
    minWidth: 80
  },
  scoreDisplayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  scoreDisplayNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'monospace'
  },
  scoreDisplayNumberActive: {
    color: '#FFFFFF'
  },
  scoreDisplayDash: {
    fontSize: 32,
    fontWeight: '700',
    color: '#64748B',
    marginHorizontal: 16
  },

  // Vertical selectors
  selectorsRow: {
    flexDirection: 'row',
    gap: 12
  },
  selectorColumn: {
    flex: 1
  },
  selectorColumnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8
  },
  verticalSelector: {
    gap: 6
  },
  selectorButton: {
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectorButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB'
  },
  selectorButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155'
  },
  selectorButtonTextActive: {
    color: '#FFFFFF'
  },
  selectorDivider: {
    width: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4
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