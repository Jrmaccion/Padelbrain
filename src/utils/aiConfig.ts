/**
 * Configuración y utilidades para el análisis IA de sesiones
 */

export interface AIExtraction {
  score?: string;
  outcome?: 'won' | 'lost';
  strengths: string[];
  weaknesses: string[];
  learned?: string;
  diffNextTime?: string;
  keywords: string[];
  suggestions: string[];
}

export async function extractFromVoice(text: string): Promise<AIExtraction> {
  const lowerText = text.toLowerCase();
  
  const score = extractScore(text);
  const outcome = detectOutcome(lowerText);
  const strengths = extractStrengths(lowerText);
  const weaknesses = extractWeaknesses(lowerText);
  const learned = extractLearning(lowerText);
  const diffNextTime = extractDifferent(lowerText);
  const keywords = generateKeywords(lowerText, strengths, weaknesses);
  const suggestions = generateSuggestions(strengths, weaknesses, lowerText);
  
  return {
    score,
    outcome,
    strengths,
    weaknesses,
    learned,
    diffNextTime,
    keywords,
    suggestions
  };
}

function extractScore(text: string): string | undefined {
  const patterns = [
    /(\d+[-–]\d+(?:\s+\d+[-–]\d+)*)/g,
    /(\d+\s*a\s*\d+)/gi
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].replace(/\s*a\s*/gi, '-');
  }
  
  return undefined;
}

function detectOutcome(text: string): 'won' | 'lost' | undefined {
  const winWords = ['gané', 'ganar', 'victoria', 'ganamos', 'vencimos'];
  const loseWords = ['perdí', 'perder', 'derrota', 'perdimos'];
  
  const hasWin = winWords.some(w => text.includes(w));
  const hasLose = loseWords.some(w => text.includes(w));
  
  if (hasWin && !hasLose) return 'won';
  if (hasLose && !hasWin) return 'lost';
  
  return undefined;
}

function extractStrengths(text: string): string[] {
  const strengths: string[] = [];
  
  const patterns = {
    'Saque': ['saque', 'servicio'],
    'Derecha': ['derecha', 'drive'],
    'Revés': ['revés', 'backhand'],
    'Volea': ['volea', 'red'],
    'Smash': ['smash', 'remate'],
    'Defensa': ['defensa'],
    'Táctica': ['táctica', 'estrategia'],
    'Físico': ['físico', 'resistencia'],
    'Mental': ['mental', 'concentración']
  };
  
  const positiveContext = ['bien', 'bueno', 'excelente', 'fuerte', 'efectivo'];
  
  for (const [skill, keywords] of Object.entries(patterns)) {
    const mentioned = keywords.some(k => text.includes(k));
    const positive = positiveContext.some(c => text.includes(c));
    
    if (mentioned && positive) {
      strengths.push(skill);
    }
  }
  
  return strengths;
}

function extractWeaknesses(text: string): string[] {
  const weaknesses: string[] = [];
  
  const patterns = {
    'Saque inconsistente': ['saque', 'servicio'],
    'Derecha errática': ['derecha', 'drive'],
    'Revés débil': ['revés', 'backhand'],
    'Errores en red': ['volea', 'red']
  };
  
  const negativeContext = ['mal', 'débil', 'fallar', 'error', 'mejorar'];
  
  for (const [issue, keywords] of Object.entries(patterns)) {
    const mentioned = keywords.some(k => text.includes(k));
    const negative = negativeContext.some(c => text.includes(c));
    
    if (mentioned && negative) {
      weaknesses.push(issue);
    }
  }
  
  return weaknesses;
}

function extractLearning(text: string): string | undefined {
  const patterns = [
    /aprendí\s+(?:que\s+)?([^.!?]+)/i,
    /me\s+di\s+cuenta\s+(?:de\s+)?(?:que\s+)?([^.!?]+)/i,
    /descubrí\s+(?:que\s+)?([^.!?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  
  return undefined;
}

function extractDifferent(text: string): string | undefined {
  const patterns = [
    /(?:próxima\s+vez|siguiente)\s+(?:haría|voy\s+a)\s+([^.!?]+)/i,
    /(?:debería|debo)\s+([^.!?]+)/i,
    /(?:mejorar|cambiar)\s+([^.!?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  
  return undefined;
}

function generateKeywords(text: string, strengths: string[], weaknesses: string[]): string[] {
  const allKeywords = new Set<string>();
  
  strengths.forEach(s => allKeywords.add(s.split(' ')[0]));
  weaknesses.forEach(w => allKeywords.add(w.split(' ')[0]));
  
  const keywords = {
    'Saque': ['saque', 'servicio'],
    'Derecha': ['derecha', 'drive'],
    'Revés': ['revés', 'backhand'],
    'Volea': ['volea', 'red'],
    'Smash': ['smash', 'remate'],
    'Defensa': ['defensa'],
    'Ataque': ['ataque', 'agresivo'],
    'Táctica': ['táctica', 'estrategia'],
    'Físico': ['físico', 'resistencia'],
    'Mental': ['mental', 'concentración']
  };
  
  for (const [keyword, terms] of Object.entries(keywords)) {
    if (terms.some(t => text.includes(t))) {
      allKeywords.add(keyword);
    }
  }
  
  return Array.from(allKeywords).slice(0, 5);
}

function generateSuggestions(strengths: string[], weaknesses: string[], text: string): string[] {
  const suggestions: string[] = [];
  
  const suggestionMap: Record<string, string> = {
    'Saque': 'Dedicar 20 minutos al inicio de cada entrenamiento a practicar saques',
    'Derecha': 'Ejercicios de consistencia: 50 pelotas consecutivas cruzadas',
    'Revés': 'Trabajar revés cortado y liftado alternando en series de 10',
    'Volea': 'Simulaciones de subidas a red: approach + volea + definición',
    'Defensa': 'Drills de recuperación desde posiciones defensivas',
    'Táctica': 'Analizar videos de partidos para identificar patrones',
    'Físico': 'Incluir intervalos de alta intensidad 2 veces por semana',
    'Mental': 'Práctica de visualización antes de partidos'
  };
  
  weaknesses.forEach(weakness => {
    const key = weakness.split(' ')[0];
    if (suggestionMap[key]) {
      suggestions.push(suggestionMap[key]);
    }
  });
  
  if (strengths.length > 0) {
    suggestions.push(`Aprovechar ${strengths[0]} para construir patrones ganadores`);
  }
  
  if (suggestions.length < 3) {
    suggestions.push('Variar ritmo y efectos en peloteos');
    suggestions.push('Practicar situaciones de partido: tie-breaks');
  }
  
  return suggestions.slice(0, 3);
}