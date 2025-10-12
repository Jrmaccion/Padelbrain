import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';

interface AIAnalysisProps {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  learned: string;
  onLearnedChange: (text: string) => void;
  diffNextTime: string;
  onDiffNextTimeChange: (text: string) => void;
}

export default function AIAnalysis({
  strengths,
  weaknesses,
  suggestions,
  keywords,
  onKeywordsChange,
  learned,
  onLearnedChange,
  diffNextTime,
  onDiffNextTimeChange
}: AIAnalysisProps) {
  const toggleKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      onKeywordsChange(keywords.filter(k => k !== keyword));
    } else {
      onKeywordsChange([...keywords, keyword]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Análisis IA</Text>
      <Text style={styles.subtitle}>Información extraída automáticamente de tu resumen</Text>

      {/* Fortalezas */}
      {strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Fortalezas Detectadas</Text>
          <View style={styles.chipContainer}>
            {strengths.map((strength, index) => (
              <View key={index} style={[styles.chip, styles.strengthChip]}>
                <Text style={styles.chipText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Debilidades */}
      {weaknesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Áreas de Mejora</Text>
          <View style={styles.chipContainer}>
            {weaknesses.map((weakness, index) => (
              <View key={index} style={[styles.chip, styles.weaknessChip]}>
                <Text style={styles.chipText}>{weakness}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sugerencias IA */}
      {suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Sugerencias de Entrenamiento</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Text style={styles.suggestionNumber}>{index + 1}</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Palabras clave propuestas */}
      {keywords.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Palabras Clave (toca para seleccionar)</Text>
          <View style={styles.chipContainer}>
            {['Saque', 'Derecha', 'Revés', 'Volea', 'Smash', 'Defensa', 'Ataque', 'Resistencia', 'Táctica', 'Mental'].map((keyword) => (
              <TouchableOpacity
                key={keyword}
                style={[
                  styles.chip,
                  styles.keywordChip,
                  keywords.includes(keyword) && styles.keywordChipSelected
                ]}
                onPress={() => toggleKeyword(keyword)}
              >
                <Text style={[
                  styles.chipText,
                  keywords.includes(keyword) && styles.keywordTextSelected
                ]}>
                  {keyword}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Reflexiones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Reflexiones</Text>
        
        <Text style={styles.inputLabel}>¿Qué aprendí?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="La IA puede sugerir basándose en tu resumen..."
          value={learned}
          onChangeText={onLearnedChange}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.inputLabel}>¿Qué haría diferente la próxima vez?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe o deja que la IA sugiera..."
          value={diffNextTime}
          onChangeText={onDiffNextTimeChange}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.aiInfo}>
        <Text style={styles.aiInfoText}>
          ℹ️ Esta información se ha extraído automáticamente. Puedes editarla o confirmarla.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C4A6E',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 16
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  strengthChip: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7'
  },
  weaknessChip: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5'
  },
  keywordChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1'
  },
  keywordChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB'
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155'
  },
  keywordTextSelected: {
    color: '#FFFFFF'
  },
  suggestionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE'
  },
  suggestionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1E293B',
    textAlignVertical: 'top'
  },
  aiInfo: {
    backgroundColor: '#E0F2FE',
    padding: 10,
    borderRadius: 6,
    marginTop: 8
  },
  aiInfoText: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 18
  }
});