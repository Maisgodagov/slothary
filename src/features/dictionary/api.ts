import { apiFetch } from '../../shared/api/client';

export interface UserDictionaryEntry {
  id: string;
  type: 'word' | 'phrase';
  word?: string;
  phrase?: string;
  translation: string;
  otherTranslations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDictionaryEntry {
  query: string;
  lang: 'en' | 'ru';
  word?: string;
  translation?: string;
}

export interface CreateUserPhraseEntry {
  query: string;
  lang: 'en' | 'ru';
}

export interface MuellerEntry {
  id: number;
  word: string;
  partOfSpeech: string | null;
  translations: string[];
  synonyms?: string[];
}

export interface PhraseSnippet {
  id: string;
  contentId: string;
  videoName: string;
  videoUrl: string;
  startSeconds: number;
  endSeconds: number;
  matchedText: string;
  contextText: string;
  phrase: string;
  durationSeconds: number | null;
  translationMatchedText?: string;
  translationContextText?: string;
}

export interface PhraseSearchResult {
  items: PhraseSnippet[];
  phrase: string;
  returned: number;
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
}

const userHeaders = (userId: string) => ({ 'x-user-id': userId });

export const dictionaryApi = {
  getUserDictionary(token: string, userId: string) {
    return apiFetch<UserDictionaryEntry[]>('dictionary', {
      token,
      headers: userHeaders(userId),
    });
  },

  addWord(token: string, userId: string, payload: CreateUserDictionaryEntry) {
    return apiFetch<UserDictionaryEntry>('dictionary', {
      token,
      method: 'POST',
      headers: userHeaders(userId),
      body: payload,
    });
  },

  addPhrase(token: string, userId: string, payload: CreateUserPhraseEntry) {
    return apiFetch<UserDictionaryEntry>('dictionary/phrases', {
      token,
      method: 'POST',
      headers: userHeaders(userId),
      body: payload,
    });
  },

  removeWord(token: string, userId: string, id: string) {
    return apiFetch<void>(`dictionary/${id}`, {
      token,
      method: 'DELETE',
      headers: userHeaders(userId),
    });
  },

  removePhrase(token: string, userId: string, id: string) {
    return apiFetch<void>(`dictionary/phrases/${id}`, {
      token,
      method: 'DELETE',
      headers: userHeaders(userId),
    });
  },

  lookupMueller(token: string, word: string, lang: 'en' | 'ru' = 'en') {
    const query = new URLSearchParams({ word, lang });
    return apiFetch<MuellerEntry[]>(`mueller/lookup?${query.toString()}`, { token });
  },

  searchSnippets(token: string, phrase: string, limit = 8) {
    const query = new URLSearchParams({ phrase, limit: String(limit) });
    return apiFetch<PhraseSearchResult>(`video-learning/search?${query.toString()}`, { token });
  },
};
