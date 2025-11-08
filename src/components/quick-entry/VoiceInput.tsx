import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

interface VoiceInputProps {
  onResult: (text: string) => void;
  value: string;
  placeholder?: string;
}

// Tipos para Web Speech API
interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceInput({ onResult, value, placeholder }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Native Voice Setup (Android/iOS)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Setup react-native-voice for Android/iOS
      setIsSupported(true);

      Voice.onSpeechStart = () => {
        setIsRecording(true);
        setError(null);
      };

      Voice.onSpeechEnd = () => {
        setIsRecording(false);
      };

      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          const newText = e.value[0];
          setTranscription(prev => {
            const updated = prev ? prev + ' ' + newText : newText;
            onResult(updated);
            return updated;
          });
        }
      };

      Voice.onSpeechPartialResults = (e) => {
        if (e.value && e.value.length > 0) {
          const partialText = e.value[0];
          setTranscription(prev => {
            const updated = prev ? prev + ' ' + partialText : partialText;
            return updated;
          });
        }
      };

      Voice.onSpeechError = (e) => {
        console.error('Voice error:', e);
        setError('Error en reconocimiento de voz');
        setIsRecording(false);
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, []);

  // Web Speech API Setup
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        setIsSupported(false);
        setError('El reconocimiento de voz solo está disponible en la versión web.');
        return;
      }

      // Verificar si el navegador soporta Web Speech API
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionCtor) {
        setIsSupported(false);
        setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.');
        return;
      }

      let recognition: SpeechRecognition;
      try {
        recognition = new SpeechRecognitionCtor();
      } catch (e) {
        console.error('No se pudo inicializar SpeechRecognition:', e);
        setIsSupported(false);
        setError('El reconocimiento de voz no está disponible en este contexto.');
        return;
      }

      setIsSupported(true);
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript = result[0].transcript;
          } else {
            interimTranscript = result[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          setTranscription(prevText => {
            const newText = prevText ? prevText + ' ' + text : text;
            onResult(newText);
            return newText;
          });
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Error de reconocimiento:', event.error);
        setError(`Error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }
  }, []);

  useEffect(() => {
    setTranscription(value);
  }, [value]);

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      // Web Speech API
      if (!recognitionRef.current) return;

      try {
        setError(null);
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setError('Error al iniciar grabación');
        console.error(e);
      }
    } else {
      // Native Voice (Android/iOS)
      try {
        setError(null);
        await Voice.start('es-ES');
        setIsRecording(true);
      } catch (e) {
        setError('Error al iniciar grabación');
        console.error(e);
      }
    }
  };

  const stopRecording = async () => {
    if (Platform.OS === 'web') {
      // Web Speech API
      if (!recognitionRef.current) return;

      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (e) {
        setError('Error al detener grabación');
        console.error(e);
      }
    } else {
      // Native Voice (Android/iOS)
      try {
        await Voice.stop();
        setIsRecording(false);
      } catch (e) {
        setError('Error al detener grabación');
        console.error(e);
      }
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder || 'Toca el micrófono o escribe...'}
          value={transcription}
          onChangeText={(text) => {
            setTranscription(text);
            onResult(text);
          }}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording && styles.micButtonRecording,
            !isSupported && styles.micButtonDisabled
          ]}
          onPress={handleMicPress}
          activeOpacity={0.7}
          disabled={!isSupported}
        >
          <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.pulsingDot} />
          <Text style={styles.recordingText}>Escuchando...</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {isSupported && (
        <Text style={styles.hint}>
          💡 Dicta libremente. El sistema reconocerá palabras clave como marcador, fortalezas y debilidades.
        </Text>
      )}

      {!isSupported && Platform.OS === 'web' && (
        <Text style={styles.hint}>
          ℹ️ Usa Chrome, Edge o Safari para activar el reconocimiento de voz.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 100
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  micButtonRecording: {
    backgroundColor: '#EF4444'
  },
  micButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.5
  },
  micIcon: {
    fontSize: 28
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444'
  },
  recordingText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600'
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic'
  }
});
