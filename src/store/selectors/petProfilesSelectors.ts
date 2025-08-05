import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { PetProfile } from '../slices/petProfilesSlice';

// Basic selectors
export const selectPetProfilesState = (state: RootState) => state.petProfiles;
export const selectPets = (state: RootState) => state.petProfiles.pets;
export const selectPetsLoading = (state: RootState) => state.petProfiles.loading;
export const selectPetsError = (state: RootState) => state.petProfiles.error;
export const selectPetsLastFetched = (state: RootState) => state.petProfiles.lastFetched;
export const selectPetsInitialized = (state: RootState) => state.petProfiles.isInitialized;

// Computed selectors
export const selectPetsCount = createSelector(
  [selectPets],
  (pets) => pets.length
);

export const selectPrimaryPet = createSelector(
  [selectPets],
  (pets) => pets[0] || null
);

export const selectPetById = createSelector(
  [selectPets, (_state: RootState, petId: string) => petId],
  (pets, petId) => pets.find(pet => pet.id === petId) || null
);

export const selectPetsBySpecies = createSelector(
  [selectPets, (_state: RootState, species: string) => species],
  (pets, species) => pets.filter(pet => pet.species === species)
);

export const selectPetsWithValidData = createSelector(
  [selectPets],
  (pets) => pets.filter(pet => pet.id && pet.name && pet.species)
);

export const selectPetsForChat = createSelector(
  [selectPetsWithValidData],
  (pets) => pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    behavior_focus: pet.behavior_focus,
  }))
);

// Performance selectors
export const selectPetsCacheStatus = createSelector(
  [selectPetsLastFetched, selectPetsInitialized],
  (lastFetched, isInitialized) => ({
    isInitialized,
    lastFetched,
    isStale: lastFetched ? Date.now() - lastFetched > 5 * 60 * 1000 : true, // 5 minutes
  })
); 