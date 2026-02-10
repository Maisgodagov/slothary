import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../store';
import type { ThemeMode } from '../../shared/theme/themes';

interface UiState {
  themeMode: ThemeMode;
}

const initialState: UiState = {
  themeMode: 'dark',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
  },
});

export const { setThemeMode } = uiSlice.actions;
export const selectThemeMode = (state: RootState) => state.ui.themeMode;

export default uiSlice.reducer;
