import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../store';
import { selectAuth } from '../auth/slice';
import { videoFeedApi } from './api';
import type { VideoContent, VideoFeedItem, VideoFeedResponse } from './types';

export type SpeechSpeedFilter = 'slow' | 'normal' | 'fast';

interface FeedFilters {
  cefrLevels: string[] | null;
  speechSpeeds: SpeechSpeedFilter[] | null;
  showAdultContent: boolean;
  moderationFilter: 'all' | 'moderated' | 'unmoderated' | null;
}

interface VideoFeedState {
  items: VideoFeedItem[];
  status: 'idle' | 'loading' | 'refreshing' | 'failed';
  cursor: string | null;
  hasMore: boolean;
  error?: string;
  filters: FeedFilters;
  contentById: Record<string, VideoContent | undefined>;
}

export const initialFilters: FeedFilters = {
  cefrLevels: null,
  speechSpeeds: null,
  showAdultContent: true,
  moderationFilter: null,
};

const initialState: VideoFeedState = {
  items: [],
  status: 'idle',
  cursor: null,
  hasMore: true,
  filters: initialFilters,
  contentById: {},
};

export const loadFeed = createAsyncThunk<VideoFeedResponse, { reset?: boolean } | undefined, { state: RootState }>(
  'videoFeed/load',
  async (options, { getState, rejectWithValue }) => {
    const state = getState();
    const auth = selectAuth(state);
    const token = auth.tokens?.accessToken;
    const userId = auth.profile?.id;
    if (!token || !userId) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      const moderationFilter = state.videoFeed.filters.moderationFilter ?? 'all';
      const role = auth.profile?.role === 'admin' ? 'admin' : null;
      return await videoFeedApi.getFeed(token, userId, {
        cursor: options?.reset ? null : state.videoFeed.cursor,
        limit: 5,
        role,
        moderationFilter,
        showAdultContent: state.videoFeed.filters.showAdultContent,
        cefrLevels: state.videoFeed.filters.cefrLevels?.join(','),
        speechSpeeds: state.videoFeed.filters.speechSpeeds?.join(','),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load feed';
      return rejectWithValue(message);
    }
  },
);

export const loadContent = createAsyncThunk<{ id: string; content: VideoContent }, string, { state: RootState }>(
  'videoFeed/loadContent',
  async (contentId, { getState, rejectWithValue }) => {
    const state = getState();
    const auth = selectAuth(state);
    const token = auth.tokens?.accessToken;
    const userId = auth.profile?.id;
    if (!token || !userId) {
      return rejectWithValue('Please sign in first.');
    }
    try {
      const role = auth.profile?.role === 'admin' ? 'admin' : null;
      const content = await videoFeedApi.getContent(token, userId, contentId, role);
      return { id: contentId, content };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load content';
      return rejectWithValue(message);
    }
  },
);

export const toggleLike = createAsyncThunk<
  { contentId: string; likesCount: number; isLiked: boolean },
  string,
  { state: RootState }
>('videoFeed/toggleLike', async (contentId, { getState, rejectWithValue }) => {
  const state = getState();
  const auth = selectAuth(state);
  const target = state.videoFeed.items.find((item) => item.id === contentId);
  const nextLike = target ? !target.isLiked : true;
  if (!auth.profile?.id || !auth.tokens?.accessToken) {
    return rejectWithValue('Please sign in first.');
  }
  try {
    const role = auth.profile?.role === 'admin' ? 'admin' : null;
    const response = await videoFeedApi.updateLike(auth.tokens.accessToken, auth.profile.id, contentId, nextLike, role);
    return { contentId, ...response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update like';
    return rejectWithValue(message);
  }
});

const videoFeedSlice = createSlice({
  name: 'videoFeed',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FeedFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.items = [];
      state.cursor = null;
      state.hasMore = true;
      state.status = 'idle';
      state.contentById = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFeed.pending, (state, action) => {
        state.status = action.meta.arg?.reset ? 'loading' : 'refreshing';
        state.error = undefined;
        if (action.meta.arg?.reset) {
          state.items = [];
          state.cursor = null;
          state.hasMore = true;
          state.contentById = {};
        }
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.status = 'idle';
        const existing = new Set(state.items.map((item) => item.id));
        state.items = [...state.items, ...action.payload.items.filter((item) => !existing.has(item.id))];
        state.cursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore && Boolean(action.payload.nextCursor);
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load feed';
      })
      .addCase(loadContent.fulfilled, (state, action) => {
        state.contentById[action.payload.id] = action.payload.content;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.contentId
            ? { ...item, likesCount: action.payload.likesCount, isLiked: action.payload.isLiked }
            : item,
        );
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = (action.payload as string) ?? state.error;
      });
  },
});

export const { setFilters } = videoFeedSlice.actions;
export const selectVideoFeed = (state: RootState) => state.videoFeed;

export default videoFeedSlice.reducer;
