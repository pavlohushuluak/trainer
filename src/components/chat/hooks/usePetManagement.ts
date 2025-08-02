
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
}

export const usePetManagement = (preloadedPets: PetProfile[] = []) => {
  const { user } = useAuth();
  const [selectedPet, setSelectedPet] = useState<string>(() => {
    // Versuche Pet-Kontext aus localStorage zu laden
    const savedPetId = localStorage.getItem('selected_pet_id');
    return savedPetId || "none";
  });
  const [pets, setPets] = useState<PetProfile[]>(preloadedPets);

  // Use preloaded pets immediately if available
  useEffect(() => {
    if (preloadedPets.length > 0) {
      setPets(preloadedPets);
    } else if (user) {
      // Only fetch if no preloaded pets available
      fetchPets();
    }
  }, [user, preloadedPets]);

  // Automatische Auswahl und Persistierung des ersten Tiers
  useEffect(() => {
    if (pets.length === 1 && selectedPet === "none") {
      setSelectedPet(pets[0].id);
      localStorage.setItem('selected_pet_id', pets[0].id);
    } else if (pets.length === 0 && selectedPet !== "none") {
      setSelectedPet("none");
      localStorage.setItem('selected_pet_id', "none");
    } else if (selectedPet !== "none" && !pets.find(p => p.id === selectedPet)) {
      setSelectedPet("none");
      localStorage.setItem('selected_pet_id', "none");
    }
  }, [pets, selectedPet]);

  const fetchPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching pets:', error);
        return;
      }
      
      // Only log when pets count changes
      if (data && data.length !== pets.length) {
      }
      setPets(data || []);
    } catch (error) {
      console.error('❌ Error fetching pets:', error);
    }
  };

  const getSelectedPetName = () => {
    if (selectedPet === "none") return null;
    const pet = pets.find(p => p.id === selectedPet);
    return pet ? pet.name : null;
  };

  const getSelectedPetSpecies = () => {
    if (selectedPet === "none") return null;
    const pet = pets.find(p => p.id === selectedPet);
    return pet ? pet.species : null;
  };

  const getSelectedPetData = () => {
    return selectedPet !== "none" ? pets.find(p => p.id === selectedPet) : null;
  };

  const hasPets = pets.length > 0;

  // Enhanced setSelectedPet mit Persistierung
  const setSelectedPetWithPersistence = (petId: string) => {
    setSelectedPet(petId);
    localStorage.setItem('selected_pet_id', petId);
  };

  return {
    selectedPet,
    setSelectedPet: setSelectedPetWithPersistence,
    pets,
    getSelectedPetName,
    getSelectedPetSpecies,
    getSelectedPetData,
    hasPets
  };
};
