import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../store';
import { selectAuth } from '../auth/slice';
import {
  dictionaryApi,
  type CreateUserDictionaryEntry,
  type CreateUserPhraseEntry,
  type UserDictionaryEntry,
} from './api';

interface DictionaryState {
  items: UserDictionaryEntry[];
  status: 'idle' | 'loading' | 'failed';
  error?: string;
}

const initialState: DictionaryState = {
  items: [],
  status: 'idle',
};

export const fetchDictionary = createAsyncThunk<UserDictionaryEntry[], void, { state: RootState }>(
  'dictionary/fetch',
  async (_, { getState, rejectWithValue }) => {
    const auth = selectAuth(getState());
    if (!auth.profile?.id || !auth.tokens?.accessToken) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      return await dictionaryApi.getUserDictionary(auth.tokens.accessToken, auth.profile.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dictionary.';
      return rejectWithValue(message);
    }
  },
);

export const addWord = createAsyncThunk<UserDictionaryEntry, CreateUserDictionaryEntry, { state: RootState }>(
  'dictionary/addWord',
  async (payload, { getState, rejectWithValue }) => {
    const auth = selectAuth(getState());
    if (!auth.profile?.id || !auth.tokens?.accessToken) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      return await dictionaryApi.addWord(auth.tokens.accessToken, auth.profile.id, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add word.';
      return rejectWithValue(message);
    }
  },
);

export const addPhrase = createAsyncThunk<UserDictionaryEntry, CreateUserPhraseEntry, { state: RootState }>(
  'dictionary/addPhrase',
  async (payload, { getState, rejectWithValue }) => {
    const auth = selectAuth(getState());
    if (!auth.profile?.id || !auth.tokens?.accessToken) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      return await dictionaryApi.addPhrase(auth.tokens.accessToken, auth.profile.id, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add phrase.';
      return rejectWithValue(message);
    }
  },
);

export const removeWord = createAsyncThunk<string, string, { state: RootState }>(
  'dictionary/removeWord',
  async (id, { getState, rejectWithValue }) => {
    const auth = selectAuth(getState());
    if (!auth.profile?.id || !auth.tokens?.accessToken) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      await dictionaryApi.removeWord(auth.tokens.accessToken, auth.profile.id, id);
      return id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove word.';
      return rejectWithValue(message);
    }
  },
);

export const removePhrase = createAsyncThunk<string, string, { state: RootState }>(
  'dictionary/removePhrase',
  async (id, { getState, rejectWithValue }) => {
    const auth = selectAuth(getState());
    if (!auth.profile?.id || !auth.tokens?.accessToken) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      await dictionaryApi.removePhrase(auth.tokens.accessToken, auth.profile.id, id);
      return id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove phrase.';
      return rejectWithValue(message);
    }
  },
);

const dictionarySlice = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDictionary.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchDictionary.fulfilled, (state, action: PayloadAction<UserDictionaryEntry[]>) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchDictionary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to fetch dictionary.';
      })
      .addCase(addWord.fulfilled, (state, action: PayloadAction<UserDictionaryEntry>) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(addPhrase.fulfilled, (state, action: PayloadAction<UserDictionaryEntry>) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(removeWord.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removePhrase.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const selectDictionary = (state: RootState) => state.dictionary;

export default dictionarySlice.reducer;
