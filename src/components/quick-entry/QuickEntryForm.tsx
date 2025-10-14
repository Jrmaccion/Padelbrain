import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import { Training, Match, Rating1to5 } from '@/types';
import { getItem, setItem } from '@/services/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import RatingChips from './RatingChips';
import PerformanceSliders from './PerformanceSliders';
import VoiceInput from './VoiceInput';
import ScoreInput from './ScoreInput';
import QuickPeopleSelector from './QuickPeopleSelector';

interface QuickEntryFormProps {
  type: 'training' | 'match';
  onSubmit: (item: Training | Match) => void;
  onSaveDraft?: (item: Partial<Training | Match>) => void;
  draftData?: Partial<Training | Match>;
}

interface LastSelections {
  coach?: string;
  location?: string;
  opponents?: { right?: string; left?: string };
  tournament?: string;
  partner?: string;
  position?: 'right' | 'left';
  trainingPartners?: string[];
}

interface QuickTemplate {
  id: string;
  name: string;
  goals?: string[];
  analysis?: { attack?: string; defense?: string; transitions?: string };
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'mejora-saque',
    name: 'Mejora Saque',
    goals: ['Mejorar precisión saque', 'Aumentar velocidad primer servicio'],
  },
  {
    id: 'juego-red',
    name: 'Juego en Red',
    goals: ['Volea más agresiva', 'Mejor anticipación'],
  },
  {
    id: 'partido-completo',
    name: 'Análisis Partido',
    analysis: { attack: 'Agresividad desde fondo', defense: 'Devoluciones profundas', transitions: 'Subidas a la red' },
  },
];

export default function QuickEntryForm({ type, onSubmit, onSaveDraft, draftData }: QuickEntryFormProps) {
  // Básicos
  const [date, setDate] = useState(new Date().toISOString());
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('');

  // Bienestar (1-5)
  const [sleep, setSleep] = useState<Rating1to5 | undefined>();
  const [energy, setEnergy] = useState<Rating1to5 | undefined>();
  const [nutrition, setNutrition] = useState<Rating1to5 | undefined>();
  const [health, setHealth] = useState<Rating1to5 | undefined>();
  const [stress, setStress] = useState<Rating1to5 | undefined>();

  // Rendimiento (0-100)
  const [technical, setTechnical] = useState<number>(50);
  const [tactical, setTactical] = useState<number>(50);
  const [mental, setMental] = useState<number>(50);
  const [physical, setPhysical] = useState<number>(50);

  // Entrenamiento
  const [coach, setCoach] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [trainingPartners, setTrainingPartners] = useState<string[]>([]);

  // Partido
  const [score, setScore] = useState('');
  const [outcome, setOutcome] = useState<'won' | 'lost'>('won');
  const [opponents, setOpponents] = useState<{ right?: string; left?: string }>({ right: '', left: '' });
  const [tournament, setTournament] = useState('');
  const [partner, setPartner] = useState('');
  const [position, setPosition] = useState<'right' | 'left'>('right');

  // Análisis y resumen
  const [voiceSummary, setVoiceSummary] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [learned, setLearned] = useState('');
  const [diffNextTime, setDiffNextTime] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cargar últimas selecciones
  useEffect(() => {
    loadLastSelections();
  }, []);

  // Load draft data if provided
  useEffect(() => {
    if (draftData) {
      loadDraftIntoForm(draftData);
    }
  }, [draftData]);

  const loadLastSelections = async () => {
    const last = await getItem<LastSelections>('lastSelections');
    if (!last) return;
    setLocation(last.location || '');
    if (type === 'training') {
      setCoach(last.coach || '');
      setTrainingPartners(last.trainingPartners || []);
    } else {
      setOpponents(last.opponents || { right: '', left: '' });
      setTournament(last.tournament || '');
      setPartner(last.partner || '');
      if (last.position) setPosition(last.position);
    }
  };

  const loadDraftIntoForm = (draft: Partial<Training | Match>) => {
    // Load base fields
    if (draft.date) setDate(draft.date);
    if (draft.location) setLocation(draft.location);
    if (draft.sleep) setSleep(draft.sleep);
    if (draft.energy) setEnergy(draft.energy);
    if (draft.nutrition) setNutrition(draft.nutrition);
    if (draft.health) setHealth(draft.health);
    if (draft.stress) setStress(draft.stress);
    if (draft.notes) setVoiceSummary(draft.notes);

    if (type === 'training') {
      const trainingDraft = draft as Partial<Training>;
      if (trainingDraft.coach) setCoach(trainingDraft.coach);
      if (trainingDraft.goals) setGoals(trainingDraft.goals);
      if (trainingDraft.trainingPartners) setTrainingPartners(trainingDraft.trainingPartners);
      if (trainingDraft.postReview) {
        if (trainingDraft.postReview.technical) setTechnical(trainingDraft.postReview.technical * 20);
        if (trainingDraft.postReview.tactical) setTactical(trainingDraft.postReview.tactical * 20);
        if (trainingDraft.postReview.mental) setMental(trainingDraft.postReview.mental * 20);
        if (trainingDraft.postReview.physical) setPhysical(trainingDraft.postReview.physical * 20);
        if (trainingDraft.postReview.learned) setLearned(trainingDraft.postReview.learned);
        if (trainingDraft.postReview.improveNext) setDiffNextTime(trainingDraft.postReview.improveNext);
      }
    } else {
      const matchDraft = draft as Partial<Match>;
      if (matchDraft.tournament) setTournament(matchDraft.tournament);
      if (matchDraft.opponents) setOpponents(matchDraft.opponents);
      if (matchDraft.partner) setPartner(matchDraft.partner);
      if (matchDraft.position) setPosition(matchDraft.position);
      if (matchDraft.result) {
        if (matchDraft.result.outcome) setOutcome(matchDraft.result.outcome);
        if (matchDraft.result.score) setScore(matchDraft.result.score);
      }
      if (matchDraft.strengths) setStrengths(matchDraft.strengths);
      if (matchDraft.weaknesses) setWeaknesses(matchDraft.weaknesses);
      if (matchDraft.keywords) setKeywords(matchDraft.keywords);
      if (matchDraft.ratings) {
        if (matchDraft.ratings.technical) setTechnical(matchDraft.ratings.technical * 20);
        if (matchDraft.ratings.tactical) setTactical(matchDraft.ratings.tactical * 20);
        if (matchDraft.ratings.mental) setMental(matchDraft.ratings.mental * 20);
        if (matchDraft.ratings.physical) setPhysical(matchDraft.ratings.physical * 20);
      }
      if (matchDraft.reflections) {
        if (matchDraft.reflections.learned) setLearned(matchDraft.reflections.learned);
        if (matchDraft.reflections.diffNextTime) setDiffNextTime(matchDraft.reflections.diffNextTime);
      }
    }
  };

  const saveLastSelections = async () => {
    const selections: LastSelections = {
      location,
      coach: type === 'training' ? coach : undefined,
      trainingPartners: type === 'training' ? trainingPartners : undefined,
      opponents: type === 'match' ? opponents : undefined,
      tournament: type === 'match' ? tournament : undefined,
      partner: type === 'match' ? partner : undefined,
      position: type === 'match' ? position : undefined,
    };
    await setItem('lastSelections', selections);
  };

  const applyTemplate = (templateId: string) => {
    const template = QUICK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    if (template.goals) setGoals(template.goals);
  };

  const handleVoiceResult = (text: string) => {
    setVoiceSummary(text);
    processVoiceInput(text);
  };

  // Simple pattern matching to extract useful info from voice input
  const processVoiceInput = (text: string) => {
    const lower = text.toLowerCase();

    // Extract score for matches
    const scoreMatch = text.match(/(\d+[-–]\d+(?:\s+\d+[-–]\d+)*)/);
    if (scoreMatch && type === 'match') setScore(scoreMatch[1]);

    // Extract outcome keywords
    if (lower.includes('gané') || lower.includes('victoria')) setOutcome('won');
    else if (lower.includes('perdí') || lower.includes('derrota')) setOutcome('lost');

    // Extract strengths from common keywords
    const s: string[] = [];
    if (lower.includes('saque')) s.push('Saque');
    if (lower.includes('revés') || lower.includes('backhand')) s.push('Revés');
    if (lower.includes('volea')) s.push('Volea');
    if (s.length > 0) setStrengths(s);

    // Extract weaknesses from negative context
    const weakKeys = ['mal', 'débil', 'fallar', 'mejorar'];
    const w: string[] = [];
    if (lower.includes('derecha') && weakKeys.some((k) => lower.includes(k))) w.push('Derecha inconsistente');
    if (w.length > 0) setWeaknesses(w);

    // Extract general keywords
    const kw: string[] = [];
    if (lower.includes('saque')) kw.push('Saque');
    if (lower.includes('fondo')) kw.push('Fondo de pista');
    if (lower.includes('resistencia')) kw.push('Resistencia');
    if (kw.length > 0) setKeywords(kw);
  };

  const saveDraft = () => {
    if (!onSaveDraft) return;
    const draft: Partial<Training | Match> = {
      date,
      location: location || undefined,
      sleep,
      energy,
      nutrition,
      health,
      stress,
      notes: voiceSummary || undefined,
    };

    if (type === 'training') {
      Object.assign(draft, {
        coach: coach || undefined,
        goals: goals.length ? goals : undefined,
      });
      (draft as any).trainingPartners = trainingPartners.length ? trainingPartners : undefined;
    } else {
      Object.assign(draft, {
        tournament: tournament || undefined,
        opponents: opponents.right || opponents.left ? opponents : undefined,
        result: score ? { outcome, score } : undefined,
      });
      (draft as any).partner = partner || undefined;
      (draft as any).position = position || undefined;
    }

    onSaveDraft(draft);
  };

  const handleSubmit = async () => {
    await saveLastSelections();

    const base = {
      id: uuidv4(),
      date,
      location: location || undefined,
      sleep,
      energy,
      nutrition,
      health,
      stress,
      notes: voiceSummary || undefined,
      time, // por si lo necesitas más adelante
    };

    if (type === 'training') {
      const training: Training = {
        ...base,
        coach: coach || undefined,
        goals: goals.length ? goals : undefined,
        postReview: {
          technical: Math.round(technical / 20) as Rating1to5,
          tactical: Math.round(tactical / 20) as Rating1to5,
          mental: Math.round(mental / 20) as Rating1to5,
          physical: Math.round(physical / 20) as Rating1to5,
          learned: learned || undefined,
          improveNext: diffNextTime || undefined,
        },
      };
      (training as any).trainingPartners = trainingPartners.length ? trainingPartners : undefined;

      onSubmit(training);
    } else {
      const match: Match = {
        ...base,
        tournament: tournament || undefined,
        opponents: opponents.right || opponents.left ? opponents : undefined,
        result: { outcome, score: score || undefined },
        strengths: strengths.length ? strengths : undefined,
        weaknesses: weaknesses.length ? weaknesses : undefined,
        reflections: (learned || diffNextTime) ? {
          diffNextTime: diffNextTime || undefined,
          learned: learned || undefined,
        } : undefined,
        ratings: {
          technical: Math.round(technical / 20) as Rating1to5,
          tactical: Math.round(tactical / 20) as Rating1to5,
          mental: Math.round(mental / 20) as Rating1to5,
          physical: Math.round(physical / 20) as Rating1to5,
        },
        keywords: keywords.length ? keywords : undefined,
      };
      (match as any).partner = partner || undefined;
      (match as any).position = position || undefined;

      onSubmit(match);
    }

    resetForm();
  };

  const resetForm = () => {
    setDate(new Date().toISOString());
    setTime(new Date().toTimeString().slice(0, 5));
    setSleep(undefined);
    setEnergy(undefined);
    setNutrition(undefined);
    setHealth(undefined);
    setStress(undefined);
    setTechnical(50);
    setTactical(50);
    setMental(50);
    setPhysical(50);
    setVoiceSummary('');
    setScore('');
    setGoals([]);
    setStrengths([]);
    setWeaknesses([]);
    setLearned('');
    setDiffNextTime('');
    setKeywords([]);
    setSelectedTemplate(null);
    setPartner('');
    setPosition('right');
    setTrainingPartners([]);
  };

  // helpers compañeros entrenamiento
  const addTrainingPartner = (name: string) => {
    if (!name) return;
    setTrainingPartners((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };
  const removeTrainingPartner = (name: string) => setTrainingPartners((prev) => prev.filter((p) => p !== name));

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Registro Rápido - {type === 'training' ? 'Entrenamiento' : 'Partido'}</Text>

        {/* Info básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Información Básica</Text>
          <Text style={styles.hint}>Pre-rellenado automáticamente</Text>
          <Input placeholder="Fecha" value={new Date(date).toLocaleDateString()} editable={false} style={styles.input} />
          <Input placeholder="Hora" value={time} onChangeText={setTime} style={styles.input} />
          <Input placeholder="Lugar (recordado)" value={location} onChangeText={setLocation} style={styles.input} />
        </View>

        {/* Plantillas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Plantillas Rápidas</Text>
          <View style={styles.templateContainer}>
            {QUICK_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateChip, selectedTemplate === template.id && styles.templateChipSelected]}
                onPress={() => applyTemplate(template.id)}
              >
                <Text style={styles.templateText}>{template.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campos específicos */}
        {type === 'training' ? (
          <>
            <View style={styles.section}>
              <QuickPeopleSelector
                label="Entrenador"
                type="coach"
                value={coach}
                onChange={(v) => setCoach((v as string) || '')}
                placeholder="Buscar o añadir entrenador…"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Compañeros de entrenamiento</Text>
              <QuickPeopleSelector
                label="Añadir compañero"
                type="partner"
                value=""
                onChange={(v) => addTrainingPartner((v as string) || '')}
                placeholder="Escribe o selecciona y se añadirá a la lista…"
              />
              {trainingPartners.length > 0 && (
                <View style={styles.partnersChips}>
                  {trainingPartners.map((p) => (
                    <TouchableOpacity key={p} style={styles.partnerChip} onPress={() => removeTrainingPartner(p)} activeOpacity={0.7}>
                      <Text style={styles.partnerChipText}>👤 {p}  ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Input placeholder="Torneo (recordado)" value={tournament} onChangeText={setTournament} style={styles.input} />
              <ScoreInput value={score} onChange={setScore} outcome={outcome} onOutcomeChange={setOutcome} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧑‍🤝‍🧑 Pareja y posición</Text>
              <QuickPeopleSelector
                label="Compañero/a"
                type="partner"
                value={partner}
                onChange={(v) => setPartner((v as string) || '')}
                placeholder="Buscar o añadir compañero/a…"
              />
              <View style={styles.positionRow}>
                <TouchableOpacity style={[styles.posButton, position === 'right' && styles.posButtonActive]} onPress={() => setPosition('right')}>
                  <Text style={[styles.posButtonText, position === 'right' && styles.posButtonTextActive]}>Derecha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.posButton, position === 'left' && styles.posButtonActive]} onPress={() => setPosition('left')}>
                  <Text style={[styles.posButtonText, position === 'left' && styles.posButtonTextActive]}>Izquierda</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 Rivales</Text>
              <QuickPeopleSelector
                label="Rival (derecha)"
                type="opponent"
                value={opponents.right || ''}
                onChange={(v) => setOpponents((prev) => ({ ...prev, right: (v as string) || '' }))}
                placeholder="Nombre del rival de derecha…"
              />
              <QuickPeopleSelector
                label="Rival (izquierda)"
                type="opponent"
                value={opponents.left || ''}
                onChange={(v) => setOpponents((prev) => ({ ...prev, left: (v as string) || '' }))}
                placeholder="Nombre del rival de izquierda…"
              />
            </View>
          </>
        )}

        {/* Bienestar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Estado Físico y Mental</Text>
          <RatingChips label="Sueño" value={sleep} onChange={setSleep} />
          <RatingChips label="Energía" value={energy} onChange={setEnergy} />
          <RatingChips label="Nutrición" value={nutrition} onChange={setNutrition} />
          <RatingChips label="Salud" value={health} onChange={setHealth} />
          <RatingChips label="Estrés" value={stress} onChange={setStress} />
        </View>

        {/* Rendimiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Rendimiento</Text>
          <PerformanceSliders
            technical={technical}
            tactical={tactical}
            mental={mental}
            physical={physical}
            onTechnicalChange={setTechnical}
            onTacticalChange={setTactical}
            onMentalChange={setMental}
            onPhysicalChange={setPhysical}
          />
        </View>

        {/* Voz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Resumen por Voz</Text>
          <VoiceInput onResult={handleVoiceResult} value={voiceSummary} placeholder="Toca el micrófono y cuenta qué tal fue..." />
        </View>

        {/* Avanzadas */}
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)} style={styles.advancedToggle}>
          <Text style={styles.advancedToggleText}>{showAdvanced ? '▼' : '▶'} Opciones avanzadas</Text>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.section}>
            <Input placeholder="¿Qué aprendí?" value={learned} onChangeText={setLearned} multiline numberOfLines={2} style={styles.input} />
            <Input placeholder="¿Qué haría diferente?" value={diffNextTime} onChangeText={setDiffNextTime} multiline numberOfLines={2} style={styles.input} />
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={saveDraft} activeOpacity={0.7}>
            <Text style={styles.buttonText}>💾 Guardar Borrador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit} activeOpacity={0.7}>
            <Text style={styles.buttonText}>✅ Guardar</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1E293B' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#334155' },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  input: { marginBottom: 10 },
  templateContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  templateChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  templateChipSelected: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },
  templateText: { fontSize: 14, fontWeight: '500', color: '#1E293B' },
  advancedToggle: { paddingVertical: 12, marginBottom: 12 },
  advancedToggleText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  button: { flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  draftButton: { backgroundColor: '#64748B' },
  submitButton: { backgroundColor: '#10B981' },

  // posición y chips
  positionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  posButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', backgroundColor: '#F8FAFC' },
  posButtonActive: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
  posButtonText: { color: '#334155', fontWeight: '600' },
  posButtonTextActive: { color: '#1D4ED8' },

  partnersChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  partnerChip: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  partnerChipText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
});
