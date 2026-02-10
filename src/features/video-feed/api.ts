import { apiFetch } from '../../shared/api/client';
import type { VideoContent, VideoFeedResponse } from './types';

const buildHeaders = (userId?: string | null, role?: string | null) => {
  const headers: Record<string, string> = {};
  if (userId) headers['x-user-id'] = userId;
  if (role) headers['x-user-role'] = role;
  return headers;
};

export const videoFeedApi = {
  getFeed(
    token: string,
    userId?: string | null,
    options: {
      cursor?: string | null;
      limit?: number;
      role?: string | null;
      moderationFilter?: 'all' | 'moderated' | 'unmoderated';
      showAdultContent?: boolean;
      cefrLevels?: string;
      speechSpeeds?: string;
    } = {},
  ) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.cursor) params.append('cursor', options.cursor);
    if (options.moderationFilter) params.append('moderationFilter', options.moderationFilter);
    if (options.showAdultContent !== undefined) params.append('showAdultContent', options.showAdultContent ? 'true' : 'false');
    if (options.cefrLevels) params.append('cefrLevels', options.cefrLevels);
    if (options.speechSpeeds) params.append('speechSpeeds', options.speechSpeeds);
    const query = params.toString();
    const endpoint = query ? `video-learning/feed?${query}` : 'video-learning/feed';

    return apiFetch<VideoFeedResponse>(endpoint, {
      token,
      headers: buildHeaders(userId, options.role),
    });
  },
  getContent(token: string, userId: string | null | undefined, contentId: string, role?: string | null) {
    return apiFetch<VideoContent>(`video-learning/${contentId}`, {
      token,
      headers: buildHeaders(userId ?? undefined, role),
    });
  },
  updateLike(token: string, userId: string, contentId: string, like: boolean, role?: string | null) {
    return apiFetch<{ likesCount: number; isLiked: boolean }>(`video-learning/${contentId}/like`, {
      token,
      method: 'POST',
      headers: buildHeaders(userId, role),
      body: { like },
    });
  },
};
