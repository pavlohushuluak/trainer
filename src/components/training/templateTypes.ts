
export interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Anfänger' | 'Fortgeschritten' | 'Experte';
  duration: string;
  species: string[];
  ageGroups?: string[];
  breeds?: string[];
  exercises: Exercise[];
  tips: string[];
  expectedResults: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  repetitions?: string;
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  materials?: string[];
  steps: string[];
  // Neue modulare Felder
  goal?: string;
  shortDescription?: string;
  stepByStepGuide?: StepByStepGuide;
  repetitionSchedule?: RepetitionSchedule;
  requiredTools?: RequiredTools;
  learningTips?: string[];
  commonMistakes?: string[];
}

export interface StepByStepGuide {
  step1: string; // Was macht der Mensch?
  step2: string; // Was macht das Tier? Was wird erwartet?
  step3: string; // Wie belohne ich richtig?
  errorCorrection: string; // Was tun, wenn das Tier es nicht tut?
  speciesAdaptation?: string; // Anpassung nach Tierart
}

export interface RepetitionSchedule {
  dailyPractice: string; // z.B. "3-5 Minuten je Session"
  frequency: string; // z.B. "2-4× pro Tag"
  trainingDuration: string; // Wie viele Tage/Wochen für erste Fortschritte?
  note?: string; // Wichtige Hinweise wie "Nur bei Ruhe & Motivation üben"
}

export interface RequiredTools {
  equipment: string[]; // z.B. Leckerli, Clicker, Target-Stick, Decke
  location: string; // z.B. ruhiger Raum, gesicherter Garten
  timeframe: string; // Idealzeit (z.B. nach Spaziergang, vor Fütterung)
  speciesAdaptation?: string; // z.B. bei Kaninchen ohne Leine
}
