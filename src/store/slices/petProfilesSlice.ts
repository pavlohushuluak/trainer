import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

export interface PetProfile {
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

interface PetProfilesState {
  pets: PetProfile[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isInitialized: boolean;
}

const initialState: PetProfilesState = {
  pets: [],
  loading: false,
  error: null,
  lastFetched: null,
  isInitialized: false,
};

// Async thunk for fetching pet profiles
export const fetchPetProfiles = createAsyncThunk(
  'petProfiles/fetchPets',
  async (userId: string, { rejectWithValue }) => {
    console.log('🔐 fetchPetProfiles thunk: Starting fetch for user', userId);
    
    try {
      console.log('🔐 fetchPetProfiles thunk: Making Supabase query');
      const { data, error } = await supabase
        .from('pet_profiles')
        .select('id, name, species, breed, age, birth_date, behavior_focus, notes, created_at, updated_at, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('🔐 fetchPetProfiles thunk: Supabase response', {
        data: data?.length || 0,
        error: error?.message || null
      });

      if (error) {
        console.log('🔐 fetchPetProfiles thunk: Supabase error', error);
        throw error;
      }

      console.log('🔐 fetchPetProfiles thunk: Returning data', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.log('🔐 fetchPetProfiles thunk: Caught error', error);
      return rejectWithValue(error.message || 'Failed to fetch pet profiles');
    }
  }
);

// Async thunk for creating a pet profile
export const createPetProfile = createAsyncThunk(
  'petProfiles/createPet',
  async (petData: Omit<PetProfile, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .insert([petData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create pet profile');
    }
  }
);

// Async thunk for updating a pet profile
export const updatePetProfile = createAsyncThunk(
  'petProfiles/updatePet',
  async ({ id, updates }: { id: string; updates: Partial<PetProfile> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('pet_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update pet profile');
    }
  }
);

// Async thunk for deleting a pet profile
export const deletePetProfile = createAsyncThunk(
  'petProfiles/deletePet',
  async (petId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('id', petId);

      if (error) {
        throw error;
      }

      return petId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete pet profile');
    }
  }
);

const petProfilesSlice = createSlice({
  name: 'petProfiles',
  initialState,
  reducers: {
    clearPetProfiles: (state) => {
      state.pets = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
      state.isInitialized = false;
    },
    setPetProfiles: (state, action: PayloadAction<PetProfile[]>) => {
      state.pets = action.payload;
      state.isInitialized = true;
    },
    addPetProfile: (state, action: PayloadAction<PetProfile>) => {
      state.pets.unshift(action.payload);
    },
    updatePetProfileOptimistic: (state, action: PayloadAction<PetProfile>) => {
      const index = state.pets.findIndex(pet => pet.id === action.payload.id);
      if (index !== -1) {
        state.pets[index] = action.payload;
      }
    },
    removePetProfile: (state, action: PayloadAction<string>) => {
      state.pets = state.pets.filter(pet => pet.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch pet profiles
    builder
      .addCase(fetchPetProfiles.pending, (state) => {
        console.log('🔐 Redux: fetchPetProfiles.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPetProfiles.fulfilled, (state, action) => {
        console.log('🔐 Redux: fetchPetProfiles.fulfilled', {
          petsCount: action.payload?.length || 0,
          pets: action.payload
        });
        state.loading = false;
        state.pets = action.payload;
        state.lastFetched = Date.now();
        state.isInitialized = true;
      })
      .addCase(fetchPetProfiles.rejected, (state, action) => {
        console.log('🔐 Redux: fetchPetProfiles.rejected', {
          error: action.payload
        });
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create pet profile
    builder
      .addCase(createPetProfile.fulfilled, (state, action) => {
        state.pets.unshift(action.payload);
      })
      .addCase(createPetProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update pet profile
    builder
      .addCase(updatePetProfile.fulfilled, (state, action) => {
        const index = state.pets.findIndex(pet => pet.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
      })
      .addCase(updatePetProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete pet profile
    builder
      .addCase(deletePetProfile.fulfilled, (state, action) => {
        state.pets = state.pets.filter(pet => pet.id !== action.payload);
      })
      .addCase(deletePetProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearPetProfiles,
  setPetProfiles,
  addPetProfile,
  updatePetProfileOptimistic,
  removePetProfile,
} = petProfilesSlice.actions;

export default petProfilesSlice.reducer; 