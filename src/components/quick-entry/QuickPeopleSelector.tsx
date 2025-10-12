import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getItem, setItem } from '@/services/storage';

interface QuickPeopleSelectorProps {
  label: string;
  type: 'coach' | 'partner' | 'opponent';
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

const STORAGE_KEYS = {
  coach: 'recent_coaches',
  partner: 'recent_partners',
  opponent: 'recent_opponents'
};

export default function QuickPeopleSelector({
  label,
  type,
  value,
  onChange,
  multiple = false,
  placeholder
}: QuickPeopleSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentPeople, setRecentPeople] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadRecentPeople();
  }, [type]);

  const loadRecentPeople = async () => {
    const recent = await getItem<string[]>(STORAGE_KEYS[type]);
    if (recent) {
      setRecentPeople(recent);
    }
  };

  const saveRecentPerson = async (person: string) => {
    if (!person.trim()) return;
    
    const updated = [person, ...recentPeople.filter(p => p !== person)].slice(0, 10);
    setRecentPeople(updated);
    await setItem(STORAGE_KEYS[type], updated);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    if (text.length > 0) {
      const filtered = recentPeople.filter(p =>
        p.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(recentPeople);
      setShowSuggestions(true);
    }
  };

  const handleSelectPerson = (person: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (!currentValues.includes(person)) {
        onChange([...currentValues, person]);
        saveRecentPerson(person);
      }
    } else {
      onChange(person);
      saveRecentPerson(person);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleAddNew = () => {
    if (inputValue.trim()) {
      handleSelectPerson(inputValue.trim());
    }
  };

  const handleRemovePerson = (person: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(p => p !== person));
    } else {
      onChange('');
    }
  };

  const currentValues = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Personas seleccionadas */}
      {currentValues.length > 0 && (
        <View style={styles.selectedContainer}>
          {currentValues.map((person, index) => (
            <View key={index} style={styles.selectedChip}>
              <Text style={styles.selectedText}>{person}</Text>
              <TouchableOpacity
                onPress={() => handleRemovePerson(person)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Input y sugerencias */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder || `Buscar o añadir ${label.toLowerCase()}...`}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={() => {
            setSuggestions(recentPeople);
            setShowSuggestions(true);
          }}
        />
        
        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNew}
          >
            <Text style={styles.addButtonText}>+ Añadir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sugerencias */}
      {showSuggestions && (suggestions.length > 0 || recentPeople.length > 0) && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>
              {inputValue ? 'Coincidencias' : 'Recientes'}
            </Text>
            <TouchableOpacity onPress={() => setShowSuggestions(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
            {(suggestions.length > 0 ? suggestions : recentPeople.slice(0, 5)).map((person, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectPerson(person)}
              >
                <Text style={styles.suggestionIcon}>👤</Text>
                <Text style={styles.suggestionText}>{person}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sugerencias rápidas comunes */}
      {!showSuggestions && currentValues.length === 0 && recentPeople.length > 0 && (
        <View style={styles.quickChipsContainer}>
          <Text style={styles.quickChipsLabel}>Recientes:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentPeople.slice(0, 5).map((person, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickChip}
                onPress={() => handleSelectPerson(person)}
              >
                <Text style={styles.quickChipText}>{person}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF'
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 200,
    overflow: 'hidden'
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase'
  },
  closeText: {
    fontSize: 16,
    color: '#94A3B8'
  },
  suggestionsList: {
    maxHeight: 150
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10
  },
  suggestionIcon: {
    fontSize: 16
  },
  suggestionText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500'
  },
  quickChipsContainer: {
    marginTop: 8
  },
  quickChipsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6
  },
  quickChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  quickChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500'
  }
});