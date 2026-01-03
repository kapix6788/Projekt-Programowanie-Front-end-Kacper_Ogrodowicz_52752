import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('weatherConfig');
    return serializedState ? JSON.parse(serializedState) : { unit: 'metric', favorites: [] };
  } catch (e) {
    return { unit: 'metric', favorites: [] };
  }
};

export const weatherSlice = createSlice({
  name: 'weather',
  initialState: loadState(),
  reducers: {
    toggleUnit: (state) => {
      state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
      localStorage.setItem('weatherConfig', JSON.stringify(state));
    },
    
    toggleFavorite: (state, action) => {
      const city = action.payload;
      if (state.favorites.includes(city)) {
        state.favorites = state.favorites.filter(c => c !== city);
      } else {
        state.favorites.push(city);
      }
      localStorage.setItem('weatherConfig', JSON.stringify(state));
    },
  },
});

export const { toggleUnit, toggleFavorite } = weatherSlice.actions;
export default weatherSlice.reducer;