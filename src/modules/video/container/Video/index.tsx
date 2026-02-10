import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { selectAuth } from '../../../../features/auth/slice';
import {
  loadContent,
  loadFeed,
  selectVideoFeed,
  toggleLike,
} from '../../../../features/video-feed/slice';
import type { TranscriptChunk, VideoFeedItem } from '../../../../features/video-feed/types';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.screen};
`;

const ItemWrap = styled.View`
  width: 100%;
  background-color: #000000;
`;

const VideoPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: #000000;
`;
const VideoTapLayer = styled(Pressable)`
  position: absolute;
  inset: 0;
`;
const PauseOverlay = styled.View`
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
`;
const PauseCircle = styled.View`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  background-color: rgba(0, 0, 0, 0.45);
  align-items: center;
  justify-content: center;
`;
const PauseIcon = styled.Text`
  color: #ffffff;
  font-size: 40px;
  margin-left: 4px;
`;

const MetaBlock = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 22px;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
`;

const SubTitle = styled.Text`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
`;

const LikeButton = styled(Pressable)`
  position: absolute;
  right: 16px;
  top: 16px;
  min-width: 64px;
  border-radius: 999px;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.45);
  align-items: center;
`;

const LikeText = styled.Text`
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
`;

const SubtitleWrap = styled.View`
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 92px;
  gap: 6px;
`;

const SubtitleLine = styled.Text`
  text-align: center;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 10px;
  overflow: hidden;
`;

const CenterMessage = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  text-align: center;
  margin-top: 40px;
`;

const findChunkText = (chunks: TranscriptChunk[] | undefined, currentTime: number): string => {
  if (!chunks || chunks.length === 0) return '';
  const match = chunks.find((chunk) => currentTime >= chunk.timestamp[0] && currentTime <= chunk.timestamp[1]);
  if (match) return match.text;
  const before = [...chunks].reverse().find((chunk) => currentTime >= chunk.timestamp[0]);
  return before?.text ?? '';
};

function ActiveVideoLayer({
  uri,
  onTimeUpdate,
  screenFocused,
}: {
  uri: string;
  onTimeUpdate: (value: number) => void;
  screenFocused: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const player = useVideoPlayer(
    {
      uri,
      contentType: 'hls',
    },
    (p) => {
      p.loop = true;
      p.timeUpdateEventInterval = 0.2;
      if (screenFocused) p.play();
    },
  );

  useEffect(() => {
    const sub = player.addListener('timeUpdate', (payload) => {
      onTimeUpdate(payload.currentTime ?? 0);
    });
    return () => sub.remove();
  }, [onTimeUpdate, player]);

  useEffect(() => {
    if (screenFocused) {
      if (!paused) player.play();
    } else {
      player.pause();
      setPaused(true);
    }
  }, [paused, player, screenFocused]);

  useEffect(() => {
    setPaused(false);
    if (screenFocused) {
      player.play();
    } else {
      player.pause();
      setPaused(true);
    }
  }, [player, screenFocused, uri]);

  const togglePlayback = () => {
    if (!screenFocused) return;
    if (paused) {
      player.play();
      setPaused(false);
      return;
    }
    player.pause();
    setPaused(true);
  };

  return (
    <>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        nativeControls={false}
      />
      <VideoTapLayer onPress={togglePlayback} />
      {paused ? (
        <PauseOverlay pointerEvents="none">
          <PauseCircle>
            <PauseIcon>▶</PauseIcon>
          </PauseCircle>
        </PauseOverlay>
      ) : null}
    </>
  );
}

function FeedCard({
  item,
  active,
  screenFocused,
  height,
}: {
  item: VideoFeedItem;
  active: boolean;
  screenFocused: boolean;
  height: number;
}) {
  const dispatch = useAppDispatch();
  const feed = useAppSelector(selectVideoFeed);
  const content = feed.contentById[item.id];
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (active && !content) {
      dispatch(loadContent(item.id));
    }
  }, [active, content, dispatch, item.id]);

  useEffect(() => {
    if (!active) {
      setTime(0);
    }
  }, [active]);

  const enSub = useMemo(() => findChunkText(content?.transcription?.chunks, time), [content?.transcription?.chunks, time]);
  const ruSub = useMemo(() => findChunkText(content?.translation?.chunks, time), [content?.translation?.chunks, time]);

  return (
    <ItemWrap style={{ height }}>
      {active ? (
        <ActiveVideoLayer uri={item.videoUrl} onTimeUpdate={setTime} screenFocused={screenFocused} />
      ) : (
        <VideoPlaceholder />
      )}

      <LikeButton onPress={() => dispatch(toggleLike(item.id))}>
        <LikeText>{item.isLiked ? '❤️' : '🤍'} {item.likesCount}</LikeText>
      </LikeButton>

      {(enSub || ruSub) && (
        <SubtitleWrap>
          {enSub ? <SubtitleLine>{enSub}</SubtitleLine> : null}
          {ruSub ? <SubtitleLine>{ruSub}</SubtitleLine> : null}
        </SubtitleWrap>
      )}

      <MetaBlock>
        <Title numberOfLines={2}>{item.videoName}</Title>
        <SubTitle>
          {item.analysis.cefrLevel} • {item.analysis.speechSpeed} • {item.author ?? 'Unknown'}
        </SubTitle>
      </MetaBlock>
    </ItemWrap>
  );
}

export function VideoContainer() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const feed = useAppSelector(selectVideoFeed);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [listHeight, setListHeight] = useState(0);
  const listRef = useRef<FlatList<VideoFeedItem> | null>(null);
  const dragStartOffsetY = useRef(0);
  const dragStartIndex = useRef(0);

  useEffect(() => {
    if (!auth.tokens?.accessToken || !auth.profile?.id) return;
    if (feed.items.length === 0) {
      dispatch(loadFeed({ reset: true }));
    }
  }, [auth.profile?.id, auth.tokens?.accessToken, dispatch, feed.items.length]);

  useEffect(() => {
    if (!activeId && feed.items.length > 0) {
      setActiveId(feed.items[0].id);
    }
  }, [activeId, feed.items]);

  const updateActiveByOffset = useCallback(
    (offsetY: number) => {
      if (listHeight <= 0 || feed.items.length === 0) return;
      const index = Math.round(offsetY / listHeight);
      const clamped = Math.max(0, Math.min(feed.items.length - 1, index));
      const nextItem = feed.items[clamped];
      if (nextItem && nextItem.id !== activeId) {
        setActiveId(nextItem.id);
      }
    },
    [activeId, feed.items, listHeight],
  );

  const handleEndReached = useCallback(() => {
    if (!feed.hasMore || feed.status === 'refreshing' || feed.status === 'loading') return;
    dispatch(loadFeed({ reset: false }));
  }, [dispatch, feed.hasMore, feed.status]);

  if (!auth.tokens?.accessToken || !auth.profile?.id) {
    return (
      <Screen edges={[]}>
        <CenterMessage>Please sign in on Home tab to open video feed.</CenterMessage>
      </Screen>
    );
  }

  return (
    <Screen edges={[]} onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}>
      <FlatList
        ref={listRef}
        data={feed.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            active={activeId === item.id}
            screenFocused={isFocused}
            height={Math.max(listHeight, 1)}
          />
        )}
        snapToInterval={Math.max(listHeight, 1)}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        bounces={false}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          updateActiveByOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        onScrollBeginDrag={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          dragStartOffsetY.current = offsetY;
          if (listHeight > 0) {
            dragStartIndex.current = Math.round(offsetY / listHeight);
          }
        }}
        onMomentumScrollEnd={(event) => {
          if (listHeight <= 0 || feed.items.length === 0) return;
          const endOffsetY = event.nativeEvent.contentOffset.y;
          const rawIndex = Math.round(endOffsetY / listHeight);
          const delta = endOffsetY - dragStartOffsetY.current;
          const startIndex = Math.max(0, Math.min(feed.items.length - 1, dragStartIndex.current));

          let targetIndex = rawIndex;
          if (Math.abs(delta) > 24 && rawIndex === startIndex) {
            targetIndex = startIndex + (delta > 0 ? 1 : -1);
          }
          targetIndex = Math.max(startIndex - 1, Math.min(startIndex + 1, targetIndex));
          targetIndex = Math.max(0, Math.min(feed.items.length - 1, targetIndex));

          if (targetIndex !== rawIndex) {
            listRef.current?.scrollToOffset({
              offset: targetIndex * listHeight,
              animated: true,
            });
          }

          const nextItem = feed.items[targetIndex];
          if (nextItem) setActiveId(nextItem.id);
        }}
        onEndReachedThreshold={0.6}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          feed.status === 'loading' ? (
            <CenterMessage>Loading feed...</CenterMessage>
          ) : (
            <CenterMessage>{feed.error ?? 'No videos found for current filters.'}</CenterMessage>
          )
        }
      />
    </Screen>
  );
}
