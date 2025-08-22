// trainer.ts
// All-in-one professional pet training assistant utilities.
// - Senior-trainer system prompt (warm, supportive, memory-aware, Create Plan flow)
// - Fallback plan creation with OpenAI (robust JSON extraction, validation, normalization)
// - Translation (inline, uses OpenAI if key provided)
// - Persistence helpers (Supabase-agnostic function signatures)
// - Response post-processing for [PLAN_CREATION] blocks

/* =========================
 *  Configuration
 * ========================= */
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_DEFAULT = "gpt-5";
const MAX_COMPLETION_TOKENS = 5000;
const DEFAULT_STEP_POINTS = 15;

/* =========================
 *  Types
 * ========================= */
export type LanguageCode = "en" | "de";

export interface TrainingStep {
  title: string;
  description: string;
  points?: number;
}

export interface TrainingPlan {
  title: string;
  description?: string;
  steps: TrainingStep[];
}

export interface PetProfile {
  id?: string;
  name?: string;
  species?: string; // dog | cat | horse | small | ...
  breed?: string;
  age?: number; // years
  birth_date?: string; // ISO
  behavior_focus?: string; // e.g., "leash pulling", "reactivity"
}

export interface PetMemory {
  id?: string;
  name?: string;
  species?: string;   // dog | cat | horse | small | ...
  breed?: string;
  ageYears?: number;  // convenience
  focus?: string;     // e.g., "leash pulling", "reactivity"
}

export interface UserPreferences {
  tone?: "warm" | "direct" | "funny" | "strict";
  style?: "concise" | "detailed";
  goals?: string[]; // e.g., ["better recall", "less barking at door"]
  language?: LanguageCode;
}

export interface UserMemory {
  goals?: string[];
  preferences?: UserPreferences;
}

export interface MemoryContext {
  // For system prompt (legacy shape)
  petProfiles?: PetProfile[];
  historySummaries?: string[];
  userPreferences?: UserPreferences;
  notes?: string[];
  // For plan creation flow (new shape)
  pets?: PetMemory[];
  lastActivePetId?: string;
  history?: string[];
  user?: UserMemory;
}

/* =========================
 *  Logging helpers
 * ========================= */
const log = {
  info: (...a: any[]) => console.log("ℹ️", ...a),
  warn: (...a: any[]) => console.warn("⚠️", ...a),
  error: (...a: any[]) => console.error("❌", ...a),
};

/* =========================
 *  Translation dictionary for system prompt
 * ========================= */
const i18n: Record<LanguageCode, any> = {
  en: {
    respondOnly: "Respond in ENGLISH only.",
    pet: "Pet",
    species: "Species",
    breed: "Breed",
    focus: "Focus",
    goals: "Goals",
    recent: "Recent progress",
    activePetId: "ActivePetId",
    notes: "Notes",
    memoryHeader: "MEMORY SNAPSHOT:",
    planCta:
      "I’d be happy to help you with a structured training program! Please use the 'Create Plan' button above the chat to get a personalized plan.",
    noMarkdown:
      "Always use plain text only. Do not use markdown, bold, asterisks, or special symbols.",
    styleHeader: `You are a highly experienced, world-class animal trainer with a warm, approachable personality.
You combine professional expertise with the friendliness of a supportive coach.
Explain behavior clearly, with empathy and light humor when helpful.
Use reward-based, positive reinforcement only.
Your tone is calm, confident, and encouraging — users should feel supported, never judged.`,
    memoryRules: `MEMORY & CONTEXT RULES:
- Remember and reuse pet names, species, breeds, behavioral issues, progress, and user preferences.
- Naturally reference relevant past context when helpful (e.g., “Last time you mentioned Bella barked at the door. Did the same trigger happen today?”).
- Keep continuity across messages; never treat a message as isolated.`,
    convoStyle: `CONVERSATION STYLE:
- Be warm, clear, and supportive — like a trusted coach and friend.
- Provide practical, step-by-step guidance.
- Ask 1 gentle follow-up question to keep the conversation flowing.
- Adapt advice to the pet’s age, breed, species, and the user’s goals/preference.`,
    planRules: `TRAINING PLANS:
- Do NOT create formal training plans automatically.
- If the user asks for a structured plan, direct them to the "Create Plan" button in the chat header.
Say: `,
    safety: `SAFETY:
- If you suspect medical pain, injury, or urgent welfare issues, recommend consulting a veterinarian or certified behavior professional.
- Avoid punishment-based methods. Prioritize management, enrichment, consistency, and positive reinforcement.`,
    speciesPersona: (species: string | undefined) => {
      const s = species?.toLowerCase() || "";
      if (s.includes("dog")) {
        return `Persona note: Communicate like a seasoned dog coach — clear, kind, practical, and confident. Normalize common struggles (barking, pulling, recall, alone-time) and explain the “why” behind behavior.`;
      }
      if (s.includes("cat")) {
        return `Persona note: Speak like a thoughtful feline behavior consultant — short sessions, predictable routines, respect territory/scent, and leverage clicker/target training.`;
      }
      if (s.includes("horse")) {
        return `Persona note: Speak like an empathetic horsemanship coach — prioritize timing, pressure-and-release, body language, calm focus, and safety-first groundwork.`;
      }
      if (s.includes("small")) {
        return `Persona note: For small animals, be gentle and precise — short training moments, species-specific enrichment, careful handling, and trust-building.`;
      }
      return `Persona note: Use species-appropriate, humane, positive training methods.`;
    },
    age: {
      puppy:
        "PUPPY: Short sessions (5–10 min), socialization critical, house training every 2–3h",
      young: "YOUNG DOG: Build focus (10–15 min), impulse control, recall training",
      adult: "ADULT: Longer sessions (15–20 min), complex cues, mental enrichment",
      senior: "SENIOR: Gentle training, shorter sessions, joint-friendly exercises",
    },
    breedNotes: {
      shepherd:
        "SHEPHERD-TYPE: High work drive; daily mental work and impulse control are essential.",
      retriever:
        "RETRIEVER: Use retrieving instinct; water play and food motivation help a lot.",
      terrier:
        "TERRIER: Channel energy with nosework, tug, and short, upbeat sessions.",
      sighthound:
        "SIGHTHOUND: Sensitive, independent; keep sessions short, build recall with high-value rewards.",
      brachy:
        "BRACHYCEPHALIC: Keep sessions short, avoid overheating; choose low-impact activities.",
      working:
        "WORKING/UTILITY: Give clear jobs, structured tasks, and brain games to satisfy work drive.",
      cat: "CAT: Short sessions (≤5 min), clicker/target training, predictable routines, respect territory.",
    },
    behaviors: {
      housetraining:
        "HOUSE TRAINING: Regular feeding times, outside after eating/sleeping, reward success immediately.",
      leash:
        "LEASH TRAINING: Stop when there’s tension, reward slack line, practice “follow me” and hand-targets.",
      aggression:
        "AGGRESSION/REACTIVITY: Identify triggers, increase distance, teach alternative behaviors, work under threshold; consider a certified professional for safety.",
    },
    petHeader: "PET:",
  },
  de: {
    respondOnly: "Antworte nur auf DEUTSCH.",
    pet: "Tier",
    species: "Art",
    breed: "Rasse",
    focus: "Fokus",
    goals: "Ziele",
    recent: "Aktueller Fortschritt",
    activePetId: "AktivesTierId",
    notes: "Notizen",
    memoryHeader: "GEDÄCHTNIS-AUSZUG:",
    planCta:
      "Ich helfe dir gerne mit einem strukturierten Trainingsprogramm! Bitte nutze die 'Plan erstellen' Schaltfläche oben im Chat, um einen personalisierten Plan zu erhalten.",
    noMarkdown:
      "Verwende ausschließlich Klartext. Kein Markdown, keine Fettschrift, keine Sternchen, keine Sonderzeichen.",
    styleHeader: `Du bist ein hoch erfahrener Tiertrainer mit einer warmen, zugänglichen Art.
Du verbindest professionelle Expertise mit der Freundlichkeit eines unterstützenden Coaches.
Erkläre Verhalten klar, mit Empathie und, wenn passend, einem Schuss Humor.
Verwende ausschließlich belohnungsbasierte, positive Verstärkung.
Dein Ton ist ruhig, sicher und ermutigend — Nutzer sollen sich unterstützt, niemals beurteilt fühlen.`,
    memoryRules: `GEDÄCHTNIS & KONTEXT:
- Merke dir Tiernamen, Art, Rasse, Probleme, Fortschritte und Nutzer-Präferenzen.
- Nutze relevante Historie natürlich in Antworten (z.B.: “Zuletzt hast du gesagt, Bella bellt an der Tür. War der Auslöser heute derselbe?”).
- Sorge für Gesprächskontinuität; nie isolierte Antworten.`,
    convoStyle: `GESPRÄCHSSTIL:
- Warm, klar, unterstützend — wie ein vertrauter Coach und Freund.
- Praktische Schritt-für-Schritt-Anleitungen.
- Stelle eine sanfte Rückfrage für Gesprächsfluss.
- Passe Tipps an Alter, Rasse, Art und Nutzerziele an.`,
    planRules: `TRAININGSPLÄNE:
- Erstelle KEINE formellen Trainingspläne automatisch.
- Wenn der Nutzer einen strukturierten Plan wünscht, verweise auf die "Plan erstellen" Schaltfläche im Kopfbereich des Chats.
Sage: `,
    safety: `SICHERHEIT:
- Bei Verdacht auf Schmerzen, Verletzungen oder dringende Wohlbefindens-Themen: Tierarzt oder zertifizierte Fachperson empfehlen.
- Vermeide Strafmethoden. Priorisiere Management, Enrichment, Konsistenz und positive Verstärkung.`,
    speciesPersona: (species: string | undefined) => {
      const s = species?.toLowerCase() || "";
      if (s.includes("hund") || s.includes("dog")) {
        return `Persona-Hinweis: Kommuniziere wie ein routinierter Hundecoach — klar, freundlich, praxisnah und souverän. Normalisiere typische Themen (Bellen, Ziehen, Rückruf, Alleinbleiben) und erkläre das “Warum” hinter dem Verhalten.`;
      }
      if (s.includes("katze") || s === "cat") {
        return `Persona-Hinweis: Sprich wie ein feinfühliger Katzenberater — kurze Sessions, verlässliche Routinen, Territorium respektieren; Clicker/Target-Training gezielt nutzen.`;
      }
      if (s.includes("pferd") || s.includes("horse")) {
        return `Persona-Hinweis: Sprich wie ein empathischer Horsemanship-Coach — Timing, Druck-und-Nachlassen, Körpersprache, ruhiger Fokus und Sicherheit am Boden.`;
      }
      if (s.includes("klein") || s.includes("small")) {
        return `Persona-Hinweis: Bei Kleintieren behutsam und präzise — sehr kurze Trainingsmomente, artspezifische Beschäftigung, sanftes Handling und Vertrauensaufbau.`;
      }
      return `Persona-Hinweis: Nutze artspezifische, tierfreundliche, positive Trainingsmethoden.`;
    },
    age: {
      puppy:
        "WELPE: Kurze Sessions (5–10 Min), Sozialisation wichtig, Stubenreinheit alle 2–3h",
      young:
        "JUNGHUND: Fokus aufbauen (10–15 Min), Impulskontrolle, Rückruftraining",
      adult:
        "ERWACHSEN: Längere Sessions (15–20 Min), komplexe Signale, mentale Auslastung",
      senior:
        "SENIOR: Sanftes Training, kürzere Sessions, gelenkschonende Übungen",
    },
    breedNotes: {
      shepherd:
        "SCHÄFER-TYP: Hoher Arbeitstrieb; tägliche Kopfarbeit und Impulskontrolle sind essenziell.",
      retriever:
        "RETRIEVER: Apportierfreude nutzen; Wasserarbeit und Futter-Motivation wirken stark.",
      terrier:
        "TERRIER: Energie in Nasenarbeit, Zerrspiele und kurze, fröhliche Sessions kanalisieren.",
      sighthound:
        "WINDHUND: Sensibel, eigenständig; Sessions kurz halten, Rückruf mit sehr hoher Belohnung aufbauen.",
      brachy:
        "BRACHYCEPHAL: Kurze Sessions, Überhitzung vermeiden; gelenkschonende Aktivitäten wählen.",
      working:
        "ARBEITS/DIENSTHUND: Klare Aufgaben, strukturierte Aufgabenpakete und Denksport für Arbeitstrieb.",
      cat: "KATZE: Kurze Einheiten (≤5 Min), Clicker/Target-Training, verlässliche Routinen, Territorium respektieren.",
    },
    behaviors: {
      housetraining:
        "STUBENREINHEIT: Feste Fütterungszeiten, nach Fressen/Schlafen raus, Erfolg sofort belohnen.",
      leash:
        "LEINENTRAINING: Bei Zug stehenbleiben, lockere Leine belohnen, “Folge mir” und Handtargets üben.",
      aggression:
        "AGGRESSION/REAKTIVITÄT: Auslöser identifizieren, Distanz vergrößern, Alternativverhalten unter Schwelle trainieren; für Sicherheit ggf. zertifizierte Fachperson hinzuziehen.",
    },
    petHeader: "TIER:",
  },
};

/* =========================
 *  System Prompt Generator
 * ========================= */
function summarizeMemory(memory?: MemoryContext, language: LanguageCode = "de"): string {
  if (!memory) return "";
  const t = i18n[language];
  const petBits: string[] = [];

  const pets = memory.petProfiles ?? [];
  if (pets.length) {
    for (const p of pets.slice(0, 3)) {
      const pieces: string[] = [];
      if (p.name) pieces.push(`${t.pet} ${p.name}`);
      if (p.species) pieces.push(`${t.species}: ${p.species}`);
      if (p.breed) pieces.push(`${t.breed}: ${p.breed}`);
      if (p.behavior_focus) pieces.push(`${t.focus}: ${p.behavior_focus}`);
      petBits.push(pieces.join(", "));
    }
  }

  const goals = memory.userPreferences?.goals?.length
    ? `${t.goals}: ${memory.userPreferences.goals.join(", ")}`
    : "";

  const history = memory.historySummaries?.length
    ? `${t.recent}: ${memory.historySummaries.slice(-2).join(" | ")}`
    : "";

  const active = memory.lastActivePetId ? `${t.activePetId}: ${memory.lastActivePetId}` : "";
  const notes = memory.notes?.length ? `${t.notes}: ${memory.notes.slice(-2).join(" | ")}` : "";

  const parts = [petBits.join(" • "), goals, history, active, notes].filter(Boolean);
  return parts.length ? `${t.memoryHeader}\n${parts.join("\n")}\n\n` : "";
}

function getAgeGuidance(pet: PetProfile | undefined, lang: LanguageCode): string {
  if (!pet) return "";
  let ageMonths = 0;
  if (typeof pet.age === "number") {
    ageMonths = pet.age * 12;
  } else if (pet.birth_date) {
    const birth = new Date(pet.birth_date);
    const now = new Date();
    ageMonths = Math.floor((now.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  }
  const t = i18n[lang].age;
  if (ageMonths <= 0) return "";
  if (ageMonths <= 6) return t.puppy;
  if (ageMonths <= 18) return t.young;
  if (ageMonths <= 84) return t.adult;
  return t.senior;
}

function getBreedGuidance(pet: PetProfile | undefined, lang: LanguageCode): string {
  if (!pet) return "";
  const t = i18n[lang].breedNotes;
  const breed = (pet.breed || "").toLowerCase();
  const species = (pet.species || "").toLowerCase();

  if (breed.includes("schäfer") || breed.includes("shepherd")) return t.shepherd;
  if (breed.includes("labrador") || breed.includes("retriever")) return t.retriever;
  if (breed.includes("terrier")) return t.terrier;
  if (breed.includes("greyhound") || breed.includes("whippet") || breed.includes("saluki") || breed.includes("galgo") || breed.includes("windhund")) return t.sighthound;
  if (breed.includes("mops") || breed.includes("pug") || breed.includes("bulldog") || breed.includes("französisch") || breed.includes("french")) return t.brachy;

  if (species === "cat" || species.includes("katze")) return t.cat;
  if (breed.includes("malinois") || breed.includes("rottweiler") || breed.includes("dobermann") || breed.includes("doberman") || breed.includes("gsd")) return t.working;

  return "";
}

function getBehaviorGuidance(pet: PetProfile | undefined, lang: LanguageCode): string {
  if (!pet?.behavior_focus) return "";
  const t = i18n[lang].behaviors;
  const f = pet.behavior_focus.toLowerCase();
  if (f.includes("stubenrein") || f.includes("house") || f.includes("toilet")) return t.housetraining;
  if (f.includes("leine") || f.includes("leash") || f.includes("ziehen") || f.includes("pull")) return t.leash;
  if (f.includes("aggress") || f.includes("reactiv") || f.includes("beißen") || f.includes("biss")) return t.aggression;
  return "";
}

function getTrainerGreeting(
  trainerName: string | null,
  isNewPet: boolean,
  pet: PetProfile | undefined,
  lang: LanguageCode
): { isFirstMeeting: boolean; greeting: string | null } {
  if (!isNewPet) return { isFirstMeeting: false, greeting: null };

  const petName = pet?.name || (lang === "en" ? "your pet" : "dein Tier");
  const name = trainerName || (lang === "en" ? "your trainer" : "dein Trainer");

  if (lang === "en") {
    return {
      isFirstMeeting: true,
      greeting: `Hello! I’m ${name}. Great to meet ${petName}! 🐾
You’re in a safe space here — we’ll take it step by step, focus on wins, and build confidence for both of you.`,
    };
  }

  return {
    isFirstMeeting: true,
    greeting: `Hallo! Ich bin ${name}. Schön, ${petName} kennenzulernen! 🐾
Hier bist du in einem sicheren Rahmen — wir gehen Schritt für Schritt vor, feiern Erfolge und stärken euer Vertrauen.`,
  };
}

function getSpeciesPersonaLine(pet: PetProfile | undefined, lang: LanguageCode): string {
  return i18n[lang].speciesPersona(pet?.species);
}

function buildPetHeader(petContext: string, lang: LanguageCode): string {
  if (!petContext) return "";
  const label = i18n[lang].petHeader;
  return `${label} ${petContext}\n\n`;
}

export function generateSystemPrompt(
  trainerName: string | null,
  petContext: string,
  isNewPet: boolean,
  petData: PetProfile | undefined,
  language: LanguageCode = "de",
  memory?: MemoryContext
) {
  const lang = language === "en" ? "en" : "de";
  const t = i18n[lang];

  const ageGuidance = getAgeGuidance(petData, lang);
  const breedGuidance = getBreedGuidance(petData, lang);
  const behaviorGuidance = getBehaviorGuidance(petData, lang);
  const greeting = getTrainerGreeting(trainerName, isNewPet, petData, lang);
  const personaLine = getSpeciesPersonaLine(petData, lang);
  const memoryBlock = summarizeMemory(memory, lang);
  const petHeader = buildPetHeader(petContext, lang);

  const headerBlock = [
    t.respondOnly,
    t.styleHeader,
    t.noMarkdown,
    "",
    memoryBlock,
  ].filter(Boolean).join("\n");

  const contextualLines = [
    greeting.isFirstMeeting ? `${greeting.greeting}\n` : "",
    petHeader,
    personaLine ? `${personaLine}\n` : "",
    ageGuidance ? `${ageGuidance}\n` : "",
    breedGuidance ? `${breedGuidance}\n` : "",
    behaviorGuidance ? `${behaviorGuidance}\n` : "",
  ].filter(Boolean).join("\n");

  const rulesBlock = [
    t.memoryRules,
    "",
    t.convoStyle,
    "",
    t.planRules + `"${t.planCta}"`,
    "",
    t.safety,
  ].join("\n");

  const closingLine =
    lang === "en"
      ? `IMPORTANT OPERATIONAL RULES:
- Provide normal conversational responses.
- Do NOT create formal training plans automatically.
- If the user asks for a plan, guide them to the 'Create Plan' button.
- End with one gentle follow-up question when appropriate.`
      : `WICHTIGE BETRIEBSREGELN:
- Antworte in normalem Gesprächsstil.
- Erstelle KEINE formellen Trainingspläne automatisch.
- Wenn der Nutzer einen Plan möchte, verweise auf die 'Plan erstellen' Schaltfläche.
- Beende mit einer sanften Rückfrage, wenn passend.`;

  const basePrompt = [
    headerBlock,
    contextualLines,
    rulesBlock,
    "",
    closingLine,
  ].filter(Boolean).join("\n\n");

  return basePrompt;
}

/* =========================
 *  JSON handling helpers
 * ========================= */
function gentleCleanJsonString(jsonString: string): string {
  let cleaned = jsonString.trim();
  // Remove null bytes and non-whitespace control chars
  cleaned = cleaned.replace(/\0/g, "");
  cleaned = cleaned.replace(/[\u0001-\u0008\u000B-\u001F\u007F-\u009F]/g, "");
  return cleaned;
}

// Extract first top-level JSON object. Handles code fences and text around it.
function extractJson(text: string): string | null {
  if (!text) return null;

  // code fence
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) return fenced[1].trim();

  // balanced braces scan
  let start = -1;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1);
      }
    }
  }

  // naive fallback
  const naive = text.match(/\{[\s\S]*\}/);
  return naive ? naive[0] : null;
}

function isValidPlan(o: any): o is TrainingPlan {
  return (
    o &&
    typeof o === "object" &&
    typeof o.title === "string" &&
    Array.isArray(o.steps) &&
    o.steps.length > 0 &&
    o.steps.every(
      (s: any) =>
        s &&
        typeof s === "object" &&
        typeof s.title === "string" &&
        typeof s.description === "string"
    )
  );
}

function normalizePlan(plan: TrainingPlan): TrainingPlan {
  return {
    title: plan.title.trim(),
    description: plan.description ? plan.description.trim() : "",
    steps: plan.steps.map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
      points:
        typeof s.points === "number" && s.points > 0
          ? s.points
          : DEFAULT_STEP_POINTS,
    })),
  };
}

/* =========================
 *  Language detection & CTA
 * ========================= */
function detectLanguageFromContent(text: string): LanguageCode {
  const content = text.toLowerCase();
  const deHints = ["übung", "kommando", "leckerli", "stubenrein", "leine", "junghund", "welpe", "bleib", "warte", "nein", "rasse"];
  const enHints = ["exercise", "command", "treat", "house", "leash", "puppy", "stay", "wait", "no", "breed"];
  const deScore = deHints.reduce((acc, w) => acc + (content.includes(w) ? 1 : 0), 0);
  const enScore = enHints.reduce((acc, w) => acc + (content.includes(w) ? 1 : 0), 0);
  return deScore > enScore ? "de" : "en";
}

function buildPlanCTA(language: LanguageCode, translated = false) {
  if (language === "en") {
    return translated
      ? "\n\nTraining Plan Successfully Created and Translated!\n\nI've set up your plan in the dashboard under Training Plans. You can check off progress daily and earn points!\n\nAny questions or extra tips needed?"
      : "\n\nTraining Plan Successfully Created!\n\nI've set up your plan in the dashboard under Training Plans. You can check off progress daily and earn points!\n\nAny questions or extra tips needed?";
  }
  return translated
    ? "\n\nTrainingsplan erfolgreich erstellt und übersetzt!\n\nIch habe deinen Plan im Dashboard unter Trainingspläne angelegt. Dort kannst du täglich Fortschritte abhaken und Punkte sammeln!\n\nHast du Fragen oder brauchst du zusätzliche Tipps?"
    : "\n\nTrainingsplan erfolgreich erstellt!\n\nIch habe deinen Plan im Dashboard unter Trainingspläne angelegt. Dort kannst du täglich Fortschritte abhaken und Punkte sammeln!\n\nHast du Fragen oder brauchst du zusätzliche Tipps?";
}

export function buildCreatePlanSuggestion(language: LanguageCode = "de") {
  return language === "en"
    ? "If you’d like a structured plan, please use the Create Plan button at the top of the chat. I’ll tailor it to your pet."
    : "Wenn du einen strukturierten Plan möchtest, nutze bitte die Schaltfläche Plan erstellen oben im Chat. Ich passe ihn dann an dein Tier an.";
}

/* =========================
 *  Translation (inline impl)
 *  - Minimally depends on OpenAI when key provided
 * ========================= */
async function translatePlanDataInline(
  plan: TrainingPlan,
  openAIApiKey: string
): Promise<{
  title_en?: string;
  description_en?: string;
  steps_en?: { title_en: string; description_en: string }[];
}> {
  // Simple approach: ask the model to translate strictly to English JSON.
  const sys = `You translate pet training content into English.
Return ONLY valid JSON with fields: title_en, description_en, steps_en (array of {title_en, description_en}).
No extra keys, no explanations, no markdown.`;
  const user = JSON.stringify({
    title: plan.title,
    description: plan.description ?? "",
    steps: plan.steps.map((s) => ({ title: s.title, description: s.description })),
  });

  const resp = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_DEFAULT,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Translate API error ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
  const json = extractJson(content) ?? content;
  return JSON.parse(gentleCleanJsonString(json));
}

export async function translatePlanToUserLanguage(
  planData: TrainingPlan,
  userLanguage: LanguageCode,
  openAIApiKey?: string
): Promise<TrainingPlan> {
  if (!openAIApiKey) {
    log.warn("No OpenAI API key for translation; returning original plan");
      return planData;
    }
    
  const combined = `${planData.title} ${planData.description || ""} ${planData.steps.map(s => `${s.title} ${s.description}`).join(" ")}`;
  const currentLanguage = detectLanguageFromContent(combined);
  log.info("Detected plan language:", currentLanguage, "Target:", userLanguage);

  // We only translate to EN in this inline example. (You can extend similarly for DE.)
  if (currentLanguage === userLanguage || userLanguage !== "en") {
    return planData;
  }

  try {
    const translated = await translatePlanDataInline(planData, openAIApiKey);
    const result: TrainingPlan = {
      title: translated.title_en ?? planData.title,
      description: translated.description_en ?? planData.description,
      steps: planData.steps.map((step, i) => ({
        title: translated.steps_en?.[i]?.title_en ?? step.title,
        description: translated.steps_en?.[i]?.description_en ?? step.description,
        points: step.points ?? DEFAULT_STEP_POINTS,
      })),
    };
    log.info("Plan translated successfully");
    return result;
  } catch (e) {
    log.error("Translation failed:", e);
    return planData;
  }
}

/* =========================
 *  Memory snippets for fallback prompt
 * ========================= */
function buildMemorySnippet(memory?: MemoryContext, lang: LanguageCode = "de") {
  if (!memory) return "";
  const pet = memory.pets?.find((p) => p.id === memory.lastActivePetId) || memory.pets?.[0];
  const goals = memory.user?.goals?.join(", ");
  const lines: string[] = [];

  if (pet) {
    const bits: string[] = [];
    if (pet.name) bits.push(`Name: ${pet.name}`);
    if (pet.species) bits.push((lang === "en" ? "Species: " : "Art: ") + pet.species);
    if (pet.breed) bits.push((lang === "en" ? "Breed: " : "Rasse: ") + pet.breed);
    if (typeof pet.ageYears === "number") bits.push((lang === "en" ? "Age (y): " : "Alter (J): ") + pet.ageYears);
    if (pet.focus) bits.push((lang === "en" ? "Focus: " : "Fokus: ") + pet.focus);
    lines.push(bits.join(" • "));
  }
  if (goals) lines.push((lang === "en" ? "User goals: " : "Nutzerziele: ") + goals);
  if (memory.history?.length) lines.push((lang === "en" ? "Recent: " : "Aktuell: ") + memory.history.slice(-2).join(" | "));

  return lines.length ? (lang === "en" ? "Memory: " : "Gedächtnis: ") + lines.join(" | ") : "";
}

function speciesPersonaCue(species: string | undefined, lang: LanguageCode) {
  const s = (species || "").toLowerCase();
  if (lang === "en") {
    if (s.includes("dog")) return "Persona: calm, clear dog coach; explain the why, normalize common struggles, reward-based steps.";
    if (s.includes("cat")) return "Persona: thoughtful feline consultant; short sessions, routines, territory respect, clicker/target.";
    if (s.includes("horse")) return "Persona: empathetic horsemanship coach; timing, pressure-and-release, body language, safety.";
    if (s.includes("small")) return "Persona: gentle small-animal trainer; short precise moments, species enrichment, trust-building.";
    return "Persona: humane, species-appropriate, positive trainer.";
  }
  if (s.includes("hund") || s.includes("dog")) return "Persona: ruhiger, klarer Hundecoach; erkläre das Warum, normalisiere typische Themen, belohnungsbasiert.";
  if (s.includes("katze") || s === "cat") return "Persona: feinfühliger Katzenberater; kurze Einheiten, Routinen, Territorium respektieren, Clicker/Target.";
  if (s.includes("pferd") || s.includes("horse")) return "Persona: empathischer Horsemanship-Coach; Timing, Druck-und-Nachlassen, Körpersprache, Sicherheit.";
  if (s.includes("klein") || s.includes("small")) return "Persona: behutsam für Kleintiere; kurze, präzise Einheiten, artspezifische Beschäftigung, Vertrauensaufbau.";
  return "Persona: tierfreundliche, artspezifische, positive Trainingsmethoden.";
}

/* =========================
 *  Fallback Plan Creation (OpenAI)
 * ========================= */
export async function createFallbackPlan(
  userMessage: string,
  userLanguage: LanguageCode,
  openAIApiKey?: string,
  memory?: MemoryContext,
  model: string = MODEL_DEFAULT,
  maxCompletionTokens: number = MAX_COMPLETION_TOKENS
): Promise<TrainingPlan | null> {
  try {
    log.info("Creating fallback plan...", userMessage.slice(0, 120));
    if (!openAIApiKey) {
      log.warn("No API key for fallback plan");
      return null;
    }
    
    const lang = userLanguage === "en" ? "en" : "de";
    const activePet = memory?.pets?.find((p) => p.id === memory.lastActivePetId) || memory?.pets?.[0];
    const persona = speciesPersonaCue(activePet?.species, lang);
    const mem = buildMemorySnippet(memory, lang);

    const systemPrompt =
      lang === "en"
        ? `You are a senior, humane animal trainer. Speak warmly, clearly, and encouragingly. Use reward-based methods only.
${persona}
${mem ? mem + "\n" : ""}
Create a COMPLETELY UNIQUE training plan tailored to the user's goal and the pet's details (species, age, breed, name, focus) if provided.
IMPORTANT: Return ONLY a valid JSON object (no extra text).
All strings must be escaped correctly. Newlines as \\n, quotes as \\".
CRITICAL: Never use bold text, asterisks, bullet points, or any markdown formatting in the description content.
Format:
{
  "title": "Custom Training Plan: [unique title based on goal]",
  "description": "[detailed approach and goals]",
           "steps": [
             {
      "title": "Module 1: [unique module title]",
      "description": "Exercise Goal: [specific]\\n\\nStep-by-Step Guide: 1. [First] 2. [Second] 3. [Third] 4. [Fourth]\\n\\nRepetition & Duration: [time/frequency] Note: [important]\\n\\nRequired Tools & Framework: [list]\\nLocation: [where]\\nTiming: [when]\\nSpecies Adaptation: [notes]\\n\\nLearning Tips & Motivation: [tip1] [tip2] [tip3]\\n\\nAvoid Common Mistakes: [m1] [m2] [m3]"
    },
    { "title": "Module 2: ...", "description": "..." },
    { "title": "Module 3: ...", "description": "..." }
  ]
}
Requirements:
- Each module is unique and progressively more challenging.
- Keep everything inside description strings.
- Use English only.
- Return JSON only.
- Never use formatting symbols like • ❌ or any markdown.`
        : `Du bist ein erfahrener, tierfreundlicher Trainer. Sprich warmherzig, klar und ermutigend. Verwende ausschließlich belohnungsbasierte Methoden.
${persona}
${mem ? mem + "\n" : ""}
Erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan, zugeschnitten auf das Ziel des Nutzers und die Tierdetails (Art, Alter, Rasse, Name, Fokus), falls vorhanden.
WICHTIG: Gib NUR ein gültiges JSON-Objekt zurück (kein zusätzlicher Text).
Alle Strings korrekt escapen. Zeilenumbrüche als \\n, Anführungszeichen als \\".
KRITISCH: Verwende niemals fetten Text, Sternchen, Aufzählungspunkte oder Markdown-Formatierung im Beschreibungsinhalt.
Format:
{
  "title": "Individueller Trainingsplan: [einzigartiger Titel basierend auf Ziel]",
  "description": "[detaillierter Ansatz und Ziele]",
           "steps": [
             {
      "title": "Modul 1: [einzigartiger Modultitel]",
      "description": "Übungsziel: [spezifisch]\\n\\nSchritt-für-Schritt: 1. [Erster] 2. [Zweiter] 3. [Dritter] 4. [Vierter]\\n\\nWiederholung & Dauer: [Zeit/Häufigkeit] Hinweis: [wichtig]\\n\\nBenötigte Tools & Framework: [Liste]\\nOrt: [wo]\\nZeitpunkt: [wann]\\nArtenanpassung: [Hinweise]\\n\\nLerntipps & Motivation: [Tipp1] [Tipp2] [Tipp3]\\n\\nFehler vermeiden: [F1] [F2] [F3]"
    },
    { "title": "Modul 2: ...", "description": "..." },
    { "title": "Modul 3: ...", "description": "..." }
  ]
}
Anforderungen:
- Jedes Modul ist einzigartig und wird progressiv anspruchsvoller.
- Alles bleibt innerhalb der Description-Strings.
- Nur Deutsch verwenden.
- Nur JSON zurückgeben.
- Verwende niemals Formatierungssymbole wie • ❌ oder Markdown.`;

    const resp = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: maxCompletionTokens,
      }),
    });
    
    if (!resp.ok) {
      const errText = await resp.text();
      log.error("Fallback API error:", resp.status, resp.statusText, errText);
      return null;
    }
    
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      log.error("No content returned by OpenAI");
      return null;
    }

    const json = extractJson(content);
    if (!json) {
      log.error("No JSON found in content");
      return null;
    }
    
    const cleaned = gentleCleanJsonString(json);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      log.error("JSON parse failed after cleaning:", e);
      return null;
    }
    
    if (!isValidPlan(parsed)) {
      log.error("Plan schema invalid");
      return null;
    }
    
    const normalized = normalizePlan(parsed);
    log.info("Fallback plan created:", { title: normalized.title, steps: normalized.steps.length });
    return normalized;
  } catch (error: any) {
    log.error("Fallback plan creation failed:", { name: error?.name, message: error?.message });
    return null;
  }
}

/* =========================
 *  Persist Plan (Supabase-agnostic)
 *  - Provide your Supabase client when calling.
 * ========================= */
export async function createTrainingPlan(
  supabaseClient: any,
  userId: string,
  petId: string | null,
  planData: TrainingPlan,
  _openAIApiKey?: string // kept for compatibility; not used here
) {
  const { data: planResult, error: planError } = await supabaseClient
    .from("training_plans")
    .insert([
      {
      user_id: userId,
      pet_id: petId,
      title: planData.title,
        title_en: null,
        description: planData.description || "",
        description_en: null,
        status: "in_progress",
        is_ai_generated: true,
      },
    ])
    .select()
    .single();

  if (planError) {
    log.error("Error creating training plan:", planError);
    throw new Error("Fehler beim Erstellen des Trainingsplans");
  }

  const stepsPayload = planData.steps.map((step, i) => ({
    training_plan_id: planResult.id,
    step_number: i + 1,
    title: step.title,
    title_en: null,
    description: step.description,
    description_en: null,
    points_reward: typeof step.points === "number" ? step.points : DEFAULT_STEP_POINTS,
    is_ai_generated: true,
    // Structured (kept null)
    exercise_goal: null,
    exercise_goal_en: null,
    step_by_step_guide: null,
    step_by_step_guide_en: null,
    repetition_duration: null,
    repetition_duration_en: null,
    required_tools: null,
    required_tools_en: null,
    learning_tips: null,
    learning_tips_en: null,
    common_mistakes: null,
    common_mistakes_en: null,
  }));

  const { error: stepsError } = await supabaseClient
    .from("training_steps")
    .insert(stepsPayload);

  if (stepsError) {
    log.error("Error creating steps:", stepsError);
    throw new Error("Fehler beim Erstellen der Trainingsschritte");
  }

  await supabaseClient.from("user_rewards").upsert({
      user_id: userId,
    total_points: 0,
  });

  log.info("Training plan persisted:", planResult.id);
  return planResult;
}

/* =========================
 *  Process [PLAN_CREATION] blocks
 * ========================= */
export async function processPlanCreationFromResponse(
  aiResponse: string,
  userLanguage: LanguageCode = "de",
  openAIApiKey?: string
): Promise<TrainingPlan | null> {
  log.info("Scanning response for [PLAN_CREATION]...");
  const match = aiResponse.match(/\[PLAN_CREATION\]([\s\S]*?)\[\/PLAN_CREATION\]/i);
  if (!match) {
    log.info("No plan block found");
    return null;
  }
  
  const planContent = match[1].trim();
  const json = extractJson(planContent) ?? planContent; // allow raw JSON within tags
  let parsed: any;

  try {
    parsed = JSON.parse(gentleCleanJsonString(json));
  } catch (err) {
    log.error("JSON parse failed for plan block:", err);
      return null;
    }
    
  if (!isValidPlan(parsed)) {
    log.error("Plan block schema invalid");
      return null;
    }
    
  const normalized = normalizePlan(parsed);

  // Skip translation for speed optimization
  return normalized;
}

/* =========================
 *  Response Post-Processing
 * ========================= */
export function removePlanCreationFromResponse(
  aiResponse: string,
  planTitle: string,
  language: LanguageCode = "de",
  wasTranslated: boolean = false
) {
  const cleaned = aiResponse
    .replace(/```json|```/g, "")
    .replace(/^\s*```\s*$/gm, "");
  
  // Language-specific success messages
  const successMessages = {
    de: wasTranslated 
      ? `\n\nTrainingsplan erfolgreich erstellt und übersetzt!\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt und es in deine Sprache übersetzt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln!\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps?`
      : `\n\nTrainingsplan erfolgreich erstellt!\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln!\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps?`,
    en: wasTranslated
      ? `\n\nTraining Plan Successfully Created and Translated!\n\nI've set up "${planTitle}" as a structured project for you and translated it to your language. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points!\n\nDo you have any questions about the plan or need additional tips?`
      : `\n\nTraining Plan Successfully Created!\n\nI've set up "${planTitle}" as a structured project for you. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points!\n\nDo you have any questions about the plan or need additional tips?`,
  };

  const successMessage = successMessages[language] || successMessages.de;
  return cleaned.replace(/\[PLAN_CREATION\][\s\S]*?\[\/PLAN_CREATION\]/i, successMessage);
}

export function cleanupFailedPlanCreation(
  aiResponse: string,
  language: LanguageCode = "de"
) {
  let cleaned = aiResponse
    .replace(/```json|```/g, "")
    .replace(/^\s*```\s*$/gm, "")
    .replace(/\[PLAN_CREATION\][\s\S]*?\[\/PLAN_CREATION\]/gi, "")
    .replace(/\[PLAN_CREATION\][\s\S]*$/gi, "")
    .replace(/^[\s\S]*?\[\/PLAN_CREATION\]/gi, "");

  const fallback =
    language === "en"
      ? "\n\nSorry, something glitched while creating the training plan. Tell me quickly what you want to work on, and I’ll try again."
      : "\n\nEntschuldige, beim Erstellen des Trainingsplans gab es ein Problem. Sag mir kurz, woran ihr arbeiten möchtet, und ich versuche es erneut.";

  if (cleaned.trim().length < 20) return fallback;
  return cleaned;
}

/* =========================
 *  Example usage (commented)
 * =========================
import { generateSystemPrompt, createFallbackPlan, processPlanCreationFromResponse, createTrainingPlan } from './trainer';

const systemPrompt = generateSystemPrompt(
  "Marc",
  "Dog • Name: Bella • Focus: Leash pulling at the door",
  true,
  { name: "Bella", species: "dog", breed: "Labrador", age: 2, behavior_focus: "leash pulling" },
  "en",
  {
    petProfiles: [{ name: "Bella", species: "dog", breed: "Labrador", behavior_focus: "leash pulling" }],
    historySummaries: ["Practiced stop-start loose-leash at 5m from door."],
    userPreferences: { goals: ["calm door greetings", "loose leash"] },
  }
);

// Fallback creation if your model didn't return a [PLAN_CREATION] block:
const plan = await createFallbackPlan(
  "We need a plan for door reactivity and leash pulling",
  "en",
  process.env.OPENAI_API_KEY,
  { pets: [{ id: "p1", name: "Bella", species: "dog", breed: "Labrador", ageYears: 2, focus: "leash pulling" }], lastActivePetId: "p1" }
);

// If you have a response with [PLAN_CREATION]...[/PLAN_CREATION], parse it:
const parsed = await processPlanCreationFromResponse(modelResponse, "en", process.env.OPENAI_API_KEY);

// Save to DB (supabaseClient is your initialized client):
if (plan) {
  await createTrainingPlan(supabaseClient, userId, petId, plan);
}
*/
