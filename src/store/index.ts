import { configureStore } from '@reduxjs/toolkit';
import petProfilesReducer from './slices/petProfilesSlice';

export const store = configureStore({
  reducer: {
    petProfiles: petProfilesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['petProfiles/fetchPets/pending', 'petProfiles/fetchPets/fulfilled', 'petProfiles/fetchPets/rejected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['petProfiles.lastFetched'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 