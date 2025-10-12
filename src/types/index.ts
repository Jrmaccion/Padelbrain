// Ajusta el path/nombre si tu archivo de tipos es otro.
// Estos tipos son “supersets” suaves para no romper nada existente.

export type Rating1to5 = 1 | 2 | 3 | 4 | 5;

export interface BaseItem {
  id: string;
  date: string;           // ISO
  location?: string;
  notes?: string;
  // Bienestar previo (opcionales)
  sleep?: Rating1to5;
  energy?: Rating1to5;
  nutrition?: Rating1to5;
  health?: Rating1to5;
  stress?: Rating1to5;
  // Hora/clima (opcionales, por si los usas)
  time?: string;
  weather?: string;
}

export interface Match extends BaseItem {
  // Partido
  tournament?: string;
  category?: string;
  round?: string;
  courtType?: 'interior' | 'exterior';
  opponents?: { right?: string; left?: string };
  result?: { outcome: 'won' | 'lost'; score?: string; durationMin?: number };

  // NUEVO: pareja y posición
  partner?: string;
  position?: 'right' | 'left';

  // Análisis
  plan?: string;
  strengths?: string[];
  weaknesses?: string[];
  analysis?: { attack?: string; defense?: string; transitions?: string };
  ratings?: { technical?: Rating1to5; tactical?: Rating1to5; mental?: Rating1to5; physical?: Rating1to5 };
  reflections?: { learned?: string; diffNextTime?: string };
  keywords?: string[];
}

export interface Training extends BaseItem {
  coach?: string;
  goals?: string[];
  postReview?: {
    technical?: Rating1to5;
    tactical?: Rating1to5;
    mental?: Rating1to5;
    physical?: Rating1to5;
    learned?: string;
    improveNext?: string;
  };

  // NUEVO: compañeros de entrenamiento (múltiples)
  trainingPartners?: string[];
}
