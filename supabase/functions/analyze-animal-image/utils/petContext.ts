
// In-Memory Cache für Pet Context (10 Minuten)
const petContextCache = new Map<string, { data: any; context: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 Minuten

export async function getPetContext(supabaseClient: any, petId: string | null, userId: string) {
  let petContext = "";
  let petData = null;
  
  if (petId) {
    // Cache-Check
    const cacheKey = `${petId}-${userId}`;
    const cached = petContextCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { petContext: cached.context, petData: cached.data };
    }
    const { data: pet, error } = await supabaseClient
      .from('pet_profiles')
      .select('*')
      .eq('id', petId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching pet data:', error);
      return { petContext: "", petData: null };
    }
    
    if (pet) {
      petData = pet;
      
      // Enhanced context for better AI personalization
      let contextParts: string[] = [];
      
      // Basic info with enhanced detail
      contextParts.push(pet.name);
      
      // Age calculation with months precision for young animals
      let ageInfo = '';
      if (pet.age) {
        ageInfo = `${pet.age}J`;
      } else if (pet.birth_date) {
        const birthDate = new Date(pet.birth_date);
        const now = new Date();
        const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        
        if (years === 0) {
          ageInfo = `${ageInMonths}M`; // Show months for animals under 1 year
        } else if (months === 0) {
          ageInfo = `${years}J`;
        } else {
          ageInfo = `${years}J${months}M`;
        }
      }
      if (ageInfo) contextParts.push(ageInfo);
      
      // Species and breed with enhanced info
      const speciesBreed = pet.species + (pet.breed ? `/${pet.breed}` : '');
      contextParts.push(speciesBreed);
      
      // Behavior focus - keep full text for better AI understanding
      if (pet.behavior_focus) {
        contextParts.push(`Fokus: ${pet.behavior_focus}`);
      }
      
      // Notes - keep more detail for context
      if (pet.notes) {
        contextParts.push(`Notizen: ${pet.notes}`);
      }
      
      // Enhanced context with development stage indicators
      const ageInMonths = pet.age ? pet.age * 12 : 
        (pet.birth_date ? Math.floor((Date.now() - new Date(pet.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);
      
      if (ageInMonths <= 6) {
        contextParts.push('Entwicklungsphase: Welpe/Jungtier');
      } else if (ageInMonths <= 18) {
        contextParts.push('Entwicklungsphase: Junghund/Adoleszent');
      } else if (ageInMonths <= 84) {
        contextParts.push('Entwicklungsphase: Erwachsen');
      } else {
        contextParts.push('Entwicklungsphase: Senior');
      }
      
      petContext = contextParts.join(', ');
      
      // Cache speichern mit erweiterten Daten
      const cacheKey = `${petId}-${userId}`;
      petContextCache.set(cacheKey, {
        data: pet,
        context: petContext,
        timestamp: Date.now()
      });
      
      // Pet context created and cached
    }
  }

  return { petContext, petData };
}
