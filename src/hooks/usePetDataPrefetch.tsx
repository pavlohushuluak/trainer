
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePetDataPrefetch = () => {
  const { user } = useAuth();

  // Prefetch pet data for logged-in users
  const { data: pets } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, species, breed, age, birth_date, behavior_focus, notes, created_at, updated_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Pet prefetch failed:', error);
        return [];
      }
      
      // Enhanced data validation and transformation for prefetch
      const validatedPets = (data || []).map(pet => ({
        id: pet.id,
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed,
        age: pet.age,
        birth_date: pet.birth_date,
        behavior_focus: pet.behavior_focus,
        notes: pet.notes,
        created_at: pet.created_at,
        updated_at: pet.updated_at,
        user_id: pet.user_id
      }));
      
      return validatedPets;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 20 * 60 * 1000, // 20 minutes in memory
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Prefetch admin status with longer cache
  const { data: isAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      const result = !error && data && (data.role === 'admin' || data.role === 'support');
      return result;
    },
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 60 minutes cache (increased)
    gcTime: 120 * 60 * 1000, // 120 minutes in memory
    refetchOnWindowFocus: false,
    retry: false,
  });

  return {
    pets: pets || [],
    isAdmin: isAdmin || false,
    hasPrefetchedData: !!pets && pets.length >= 0
  };
};
