import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface CreatePetData {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
}

export const useOptimisticPetActions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const addPendingAction = useCallback((petId: string) => {
    setPendingActions(prev => new Set(prev).add(petId));
  }, []);

  const removePendingAction = useCallback((petId: string) => {
    setPendingActions(prev => {
      const newSet = new Set(prev);
      newSet.delete(petId);
      return newSet;
    });
  }, []);

  const optimisticCreate = useCallback(async (petData: CreatePetData) => {
    if (!user) return null;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticPet: Pet = {
      id: tempId,
      name: petData.name,
      species: petData.species,
      breed: petData.breed || '',
      age: petData.age || null,
      birth_date: petData.birth_date || null,
      behavior_focus: petData.behavior_focus || '',
      notes: petData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id
    };

    addPendingAction(tempId);

    // Optimistisch zur Cache-Liste hinzufügen - SOFORT
    queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
      const pets = oldData || [];
      return [optimisticPet, ...pets]; // Neues Tier an erster Stelle
    });

    // SOFORTIGE Toast-Benachrichtigung - direkt nach UI-Update
    toast({
      title: t('pets.toast.created.title'),
      description: t('pets.toast.created.description', { name: petData.name }),
    });

    try {
      // Hintergrund-Speicherung in Datenbank
      const dbPetData = {
        user_id: user.id,
        name: petData.name.trim(),
        species: petData.species.trim(),
        breed: petData.breed?.trim() || null,
        age: petData.age || null,
        birth_date: petData.birth_date || null,
        behavior_focus: petData.behavior_focus?.trim() || null,
        notes: petData.notes?.trim() || null
      };

      const { error, data } = await supabase
        .from('pet_profiles')
        .insert([dbPetData])
        .select()
        .single();

      if (error) throw error;

      // Erfolgreich gespeichert - Cache mit echten Daten aktualisieren
      queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
        const pets = oldData || [];
        return pets.map(pet => pet.id === tempId ? { ...data } : pet);
      });

      removePendingAction(tempId);

      // Erfolg-Toast (optional, da bereits optimistisch angezeigt)
      toast({
        title: t('pets.toast.saved.title'),
        description: t('pets.toast.saved.description', { name: petData.name }),
      });

      return data;
    } catch (error: any) {
      console.error('Error creating pet:', error);
      
      // Fehler - Cache zurücksetzen
      queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
        const pets = oldData || [];
        return pets.filter(pet => pet.id !== tempId);
      });

      removePendingAction(tempId);

      // Fehler-Toast
      toast({
        title: t('pets.toast.error.title'),
        description: t('pets.toast.error.description'),
        variant: "destructive",
      });

      throw error;
    }
  }, [user, queryClient, addPendingAction, removePendingAction, toast, t]);

  const optimisticUpdate = useCallback(async (petId: string, petData: CreatePetData) => {
    if (!user) return null;

    addPendingAction(petId);

    // Optimistisch Cache aktualisieren
    queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
      const pets = oldData || [];
      return pets.map(pet => 
        pet.id === petId 
          ? { 
              ...pet, 
              ...petData,
              updated_at: new Date().toISOString()
            } 
          : pet
      );
    });

    // SOFORTIGE Toast-Benachrichtigung
    toast({
      title: t('pets.toast.updated.title'),
      description: t('pets.toast.updated.description', { name: petData.name }),
    });

    try {
      // Hintergrund-Speicherung
      const { error, data } = await supabase
        .from('pet_profiles')
        .update({
          name: petData.name.trim(),
          species: petData.species.trim(),
          breed: petData.breed?.trim() || null,
          age: petData.age || null,
          birth_date: petData.birth_date || null,
          behavior_focus: petData.behavior_focus?.trim() || null,
          notes: petData.notes?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', petId)
        .select()
        .single();

      if (error) throw error;

      // Erfolgreich aktualisiert - Cache mit echten Daten aktualisieren
      queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
        const pets = oldData || [];
        return pets.map(pet => pet.id === petId ? { ...data } : pet);
      });

      removePendingAction(petId);

      // Erfolg-Toast
      toast({
        title: t('pets.toast.saved.title'),
        description: t('pets.toast.saved.description', { name: petData.name }),
      });

      return data;
    } catch (error: any) {
      console.error('Error updating pet:', error);
      
      // Fehler - Cache zurücksetzen (Original-Daten wiederherstellen)
      queryClient.invalidateQueries({ queryKey: ['pets', user.id] });

      removePendingAction(petId);

      // Fehler-Toast
      toast({
        title: t('pets.toast.error.title'),
        description: t('pets.toast.error.description'),
        variant: "destructive",
      });

      throw error;
    }
  }, [user, queryClient, addPendingAction, removePendingAction, toast, t]);

  const optimisticDelete = useCallback(async (petId: string, petName: string) => {
    if (!user) return;

    addPendingAction(petId);

    // Optimistisch aus Cache entfernen
    queryClient.setQueryData(['pets', user.id], (oldData: Pet[] | undefined) => {
      const pets = oldData || [];
      return pets.filter(pet => pet.id !== petId);
    });

    // SOFORTIGE Toast-Benachrichtigung
    toast({
      title: t('pets.toast.deleted.title'),
      description: t('pets.toast.deleted.description', { name: petName }),
    });

    try {
      // Hintergrund-Löschung
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId)
        .eq('user_id', user.id);

      if (error) throw error;

      removePendingAction(petId);

      // Erfolg-Toast
      toast({
        title: t('pets.toast.deletedConfirmed.title'),
        description: t('pets.toast.deletedConfirmed.description', { name: petName }),
      });
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      
      // Fehler - Cache zurücksetzen
      queryClient.invalidateQueries({ queryKey: ['pets', user.id] });

      removePendingAction(petId);

      // Fehler-Toast
      toast({
        title: t('pets.toast.error.title'),
        description: t('pets.toast.error.description'),
        variant: "destructive",
      });

      throw error;
    }
  }, [user, queryClient, addPendingAction, removePendingAction, toast, t]);

  return {
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    isPending: (petId: string) => pendingActions.has(petId)
  };
};
