
import { PlanTemplate, planTemplates, getTemplatesByAge, getTemplatesByBreed } from './PlanTemplates';
import { Pet } from './types';

export const getFilteredTemplatesBySpecies = (userSpecies: string[]): PlanTemplate[] => {
  // Normalize user species by trimming whitespace and converting to lowercase
  const normalizedUserSpecies = userSpecies.map(species => species.trim().toLowerCase());
  
  const filteredTemplates = planTemplates.filter(template => {
    const hasMatchingSpecies = template.species.some(templateSpecies => {
      const normalizedTemplateSpecies = templateSpecies.trim().toLowerCase();
      
      return normalizedUserSpecies.some(userSpecies => {
        // Direct match
        if (normalizedTemplateSpecies === userSpecies) return true;
        
        // Cross-language matches
        if ((normalizedTemplateSpecies === 'hund' && userSpecies === 'dog') ||
            (normalizedTemplateSpecies === 'dog' && userSpecies === 'hund')) return true;
        
        if ((normalizedTemplateSpecies === 'katze' && userSpecies === 'cat') ||
            (normalizedTemplateSpecies === 'cat' && userSpecies === 'katze') ||
            (normalizedTemplateSpecies === 'katz' && userSpecies === 'katze')) return true;
        
        if ((normalizedTemplateSpecies === 'pferd' && userSpecies === 'horse') ||
            (normalizedTemplateSpecies === 'horse' && userSpecies === 'pferd')) return true;
        
        return false;
      });
    });
    
    return hasMatchingSpecies;
  });
  
  return filteredTemplates;
};

export const getFilteredTemplatesByPets = (pets: Pet[]): PlanTemplate[] => {
  if (pets.length === 0) {
    return planTemplates;
  }
  
  // Get all unique species from pets
  const userSpecies = getUserSpeciesFromPets(pets);
  let filteredTemplates = getFilteredTemplatesBySpecies(userSpecies);
  
  // Further filter by age and breed for each pet
  const petSpecificTemplates: PlanTemplate[] = [];
  
  pets.forEach(pet => {
    let petTemplates = getFilteredTemplatesBySpecies([pet.species]);
    
    // Filter by age if available
    if (pet.age !== undefined && pet.age !== null) {
      petTemplates = petTemplates.filter(template => {
        const ageTemplates = getTemplatesByAge(pet.age!);
        return ageTemplates.includes(template);
      });
    }
    
    // Filter by breed if available
    if (pet.breed) {
      petTemplates = petTemplates.filter(template => {
        const breedTemplates = getTemplatesByBreed(pet.breed!);
        return breedTemplates.includes(template);
      });
    }
    
    petSpecificTemplates.push(...petTemplates);
  });
  
  // Combine general templates with pet-specific ones and remove duplicates
  const combinedTemplates = [...filteredTemplates, ...petSpecificTemplates];
  const uniqueTemplates = combinedTemplates.filter((template, index, self) => 
    index === self.findIndex(t => t.id === template.id)
  );
  
  return uniqueTemplates;
};

export const getFilteredTemplatesByCategory = (
  templates: PlanTemplate[], 
  selectedCategory: string
): PlanTemplate[] => {
  if (selectedCategory === 'all') {
    return templates;
  }
  return templates.filter(template => template.category === selectedCategory);
};

export const getAvailableCategories = (templates: PlanTemplate[]): string[] => {
  return ['all', ...new Set(templates.map(t => t.category))];
};

export const getUserSpeciesFromPets = (pets: Pet[]): string[] => {
  return [...new Set(pets.map(pet => pet.species))];
};

export const getPetAgeGroup = (ageInYears: number): string => {
  if (ageInYears < 0.5) return 'Welpe/Kitten (0-6 Monate)';
  if (ageInYears < 1) return 'Jung (6-12 Monate)';
  if (ageInYears < 3) return 'Erwachsen (1-3 Jahre)';
  if (ageInYears < 7) return 'Erwachsen (3-7 Jahre)';
  return 'Senior (7+ Jahre)';
};
