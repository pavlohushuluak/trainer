import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchPetProfiles, 
  createPetProfile, 
  updatePetProfile, 
  deletePetProfile,
  clearPetProfiles 
} from '@/store/slices/petProfilesSlice';
import {
  selectPets,
  selectPetsLoading,
  selectPetsError,
  selectPetsInitialized,
  selectPetsCount,
  selectPrimaryPet,
  selectPetById,
  selectPetsForChat,
  selectPetsCacheStatus,
} from '@/store/selectors/petProfilesSelectors';
import { useAuth } from '@/hooks/useAuth';
import { PetProfile } from '@/store/slices/petProfilesSlice';

export const usePetProfiles = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Selectors
  const pets = useAppSelector(selectPets);
  const loading = useAppSelector(selectPetsLoading);
  const error = useAppSelector(selectPetsError);
  const isInitialized = useAppSelector(selectPetsInitialized);
  const petsCount = useAppSelector(selectPetsCount);
  const primaryPet = useAppSelector(selectPrimaryPet);
  const cacheStatus = useAppSelector(selectPetsCacheStatus);
  const petsForChat = useAppSelector(selectPetsForChat);

  // Actions
  const fetchPets = useCallback(() => {
    console.log('🔐 usePetProfiles: fetchPets called', {
      userId: user?.id,
      hasUser: !!user?.id
    });
    
    if (user?.id) {
      console.log('🔐 usePetProfiles: Dispatching fetchPetProfiles for user', user.id);
      dispatch(fetchPetProfiles(user.id));
    } else {
      console.log('🔐 usePetProfiles: No user ID, skipping fetch');
    }
  }, [dispatch, user?.id]);

  const createPet = useCallback((petData: Omit<PetProfile, 'id' | 'created_at' | 'updated_at'>) => {
    return dispatch(createPetProfile(petData));
  }, [dispatch]);

  const updatePet = useCallback((id: string, updates: Partial<PetProfile>) => {
    return dispatch(updatePetProfile({ id, updates }));
  }, [dispatch]);

  const removePet = useCallback((petId: string) => {
    return dispatch(deletePetProfile(petId));
  }, [dispatch]);

  const clearPets = useCallback(() => {
    dispatch(clearPetProfiles());
  }, [dispatch]);

  const getPetById = useCallback((petId: string) => {
    return useAppSelector(state => selectPetById(state, petId));
  }, []);

  // Auto-fetch pets when user changes
  useEffect(() => {
    console.log('🔐 usePetProfiles: Auto-fetch effect triggered', {
      userId: user?.id,
      isInitialized,
      cacheStatus,
      shouldFetch: user?.id && (!isInitialized || cacheStatus.isStale)
    });
    
    if (user?.id && (!isInitialized || cacheStatus.isStale)) {
      console.log('🔐 usePetProfiles: Triggering fetchPets');
      fetchPets();
    }
  }, [user?.id, isInitialized, cacheStatus.isStale, fetchPets]);

  // Clear pets when user logs out
  useEffect(() => {
    if (!user) {
      clearPets();
    }
  }, [user, clearPets]);

  return {
    // Data
    pets,
    petsForChat,
    petsCount,
    primaryPet,
    loading,
    error,
    isInitialized,
    cacheStatus,

    // Actions
    fetchPets,
    createPet,
    updatePet,
    removePet,
    clearPets,
    getPetById,

    // Computed values
    hasPets: petsCount > 0,
    isEmpty: petsCount === 0,
  };
}; 