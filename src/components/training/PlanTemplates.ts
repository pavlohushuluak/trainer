
import { PlanTemplate } from './templateTypes';
import { dogTemplates } from './templates/dogTemplates';
import { breedSpecificTemplates } from './templates/breedSpecificTemplates';
import { catTemplates } from './templates/catTemplates';
import { horseTemplates } from './templates/horseTemplates';
import { birdTemplates } from './templates/birdTemplates';
import { exoticTemplates } from './templates/exoticTemplates';

// Export types for backward compatibility
export type { PlanTemplate, Exercise } from './templateTypes';

// Combine all templates
export const planTemplates: PlanTemplate[] = [
  ...dogTemplates,
  ...breedSpecificTemplates,
  ...catTemplates,
  ...horseTemplates,
  ...birdTemplates,
  ...exoticTemplates
];

// Utility functions
export const getTemplatesBySpecies = (species: string): PlanTemplate[] => {
  return planTemplates.filter(template => 
    template.species.includes(species) || template.species.includes('Alle')
  );
};

export const getTemplatesByDifficulty = (difficulty: string): PlanTemplate[] => {
  return planTemplates.filter(template => template.difficulty === difficulty);
};

export const getTemplatesByAge = (ageInYears: number): PlanTemplate[] => {
  return planTemplates.filter(template => {
    if (!template.ageGroups) return true; // Templates ohne Altersangabe sind für alle geeignet
    
    return template.ageGroups.some(ageGroup => {
      if (ageGroup.includes('Welpe') || ageGroup.includes('Kitten')) return ageInYears < 1;
      if (ageGroup.includes('0-6 Monate')) return ageInYears < 0.5;
      if (ageGroup.includes('2-4 Monate')) return ageInYears < 0.4;
      if (ageGroup.includes('6 Monate+')) return ageInYears >= 0.5;
      if (ageGroup.includes('1-3 Jahre')) return ageInYears >= 1 && ageInYears <= 3;
      if (ageGroup.includes('2-4 Jahre')) return ageInYears >= 2 && ageInYears <= 4;
      if (ageGroup.includes('7+ Jahre') || ageGroup.includes('Senior')) return ageInYears >= 7;
      if (ageGroup.includes('Erwachsen')) return ageInYears >= 1 && ageInYears < 7;
      if (ageGroup.includes('Jungpferd')) return ageInYears >= 2 && ageInYears <= 4;
      return true;
    });
  });
};

export const getTemplatesByBreed = (breed: string): PlanTemplate[] => {
  if (!breed) return planTemplates;
  
  return planTemplates.filter(template => {
    if (!template.breeds) return true; // Templates ohne Rassenangabe sind für alle geeignet
    
    return template.breeds.some(templateBreed => 
      templateBreed.toLowerCase().includes(breed.toLowerCase()) ||
      breed.toLowerCase().includes(templateBreed.toLowerCase())
    );
  });
};
