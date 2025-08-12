
import { PlanTemplate } from './templateTypes';
import { dogTemplates } from './templates/dogTemplates';
import { dogTemplatesEn } from './templates/dogTemplatesEn';
import { breedSpecificTemplates } from './templates/breedSpecificTemplates';
import { breedSpecificTemplatesEn } from './templates/breedSpecificTemplatesEn';
import { catTemplates } from './templates/catTemplates';
import { catTemplatesEn } from './templates/catTemplatesEn';
import { horseTemplates } from './templates/horseTemplates';
import { horseTemplatesEn } from './templates/horseTemplatesEn';
import { birdTemplates } from './templates/birdTemplates';
import { birdTemplatesEn } from './templates/birdTemplatesEn';
import { exoticTemplates } from './templates/exoticTemplates';
import { exoticTemplatesEn } from './templates/exoticTemplatesEn';

// Export types for backward compatibility
export type { PlanTemplate, Exercise } from './templateTypes';

// Function to get templates based on language
export const getPlanTemplates = (language: string = 'de'): PlanTemplate[] => {
  if (language === 'en') {
    return [
      ...dogTemplatesEn,
      ...breedSpecificTemplatesEn,
      ...catTemplatesEn,
      ...horseTemplatesEn,
      ...birdTemplatesEn,
      ...exoticTemplatesEn
    ];
  }
  
  // Default to German templates
  return [
    ...dogTemplates,
    ...breedSpecificTemplates,
    ...catTemplates,
    ...horseTemplates,
    ...birdTemplates,
    ...exoticTemplates
  ];
};

// Combine all templates (default to German for backward compatibility)
export const planTemplates: PlanTemplate[] = getPlanTemplates('de');

// Utility functions
export const getTemplatesBySpecies = (species: string, language: string = 'de'): PlanTemplate[] => {
  const templates = getPlanTemplates(language);
  return templates.filter(template => 
    template.species.includes(species) || template.species.includes('Alle')
  );
};

export const getTemplatesByDifficulty = (difficulty: string, language: string = 'de'): PlanTemplate[] => {
  const templates = getPlanTemplates(language);
  return templates.filter(template => template.difficulty === difficulty);
};

export const getTemplatesByAge = (ageInYears: number, language: string = 'de'): PlanTemplate[] => {
  const templates = getPlanTemplates(language);
  return templates.filter(template => {
    if (!template.ageGroups) return true; // Templates without age specification are suitable for all
    
    return template.ageGroups.some(ageGroup => {
      if (ageGroup.includes('Welpe') || ageGroup.includes('Kitten') || ageGroup.includes('Puppy')) return ageInYears < 1;
      if (ageGroup.includes('0-6 Monate') || ageGroup.includes('0-6 months')) return ageInYears < 0.5;
      if (ageGroup.includes('2-4 Monate') || ageGroup.includes('2-4 months')) return ageInYears < 0.4;
      if (ageGroup.includes('6 Monate+') || ageGroup.includes('6 months+')) return ageInYears >= 0.5;
      if (ageGroup.includes('1-3 Jahre') || ageGroup.includes('1-3 years')) return ageInYears >= 1 && ageInYears <= 3;
      if (ageGroup.includes('2-4 Jahre') || ageGroup.includes('2-4 years')) return ageInYears >= 2 && ageInYears <= 4;
      if (ageGroup.includes('7+ Jahre') || ageGroup.includes('Senior') || ageGroup.includes('7+ years')) return ageInYears >= 7;
      if (ageGroup.includes('Erwachsen') || ageGroup.includes('Adult')) return ageInYears >= 1 && ageInYears < 7;
      if (ageGroup.includes('Jungpferd') || ageGroup.includes('Young horse')) return ageInYears >= 2 && ageInYears <= 4;
      return true;
    });
  });
};

export const getTemplatesByBreed = (breed: string, language: string = 'de'): PlanTemplate[] => {
  const templates = getPlanTemplates(language);
  if (!breed) return templates;
  
  return templates.filter(template => {
    if (!template.breeds) return true; // Templates without breed specification are suitable for all
    
    return template.breeds.some(templateBreed => 
      templateBreed.toLowerCase().includes(breed.toLowerCase()) ||
      breed.toLowerCase().includes(templateBreed.toLowerCase())
    );
  });
};
