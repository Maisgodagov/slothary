import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { selectAuth } from '../../../../features/auth/slice';
import {
  addPhrase,
  addWord,
  fetchDictionary,
  removePhrase,
  removeWord,
  selectDictionary,
} from '../../../../features/dictionary/slice';
import { dictionaryApi, type MuellerEntry, type PhraseSnippet } from '../../../../features/dictionary/api';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.screen};
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

const Wrap = styled.View`
  padding: 16px;
  gap: 14px;
`;

const SearchRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const SearchInputWrap = styled.View`
  flex: 1;
  position: relative;
`;

const SearchInput = styled(TextInput)`
  height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 44px 12px 14px;
  font-size: 16px;
`;

const ClearButton = styled(Pressable)`
  position: absolute;
  right: 10px;
  top: 0;
  bottom: 0;
  width: 28px;
  align-items: center;
  justify-content: center;
`;

const ClearButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 18px;
  font-weight: 700;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 800;
`;

const Card = styled.View`
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.cardStrong};
  padding: 14px;
  gap: 8px;
`;

const WordLine = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: 800;
`;

const MetaLine = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 14px;
`;
const SynonymsWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
`;
const SynonymsLabel = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 14px;
  font-weight: 700;
`;
const SynonymLink = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  text-decoration-line: underline;
`;

const ActionRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 4px;
`;
const SplitActionRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 4px;
`;

const ActionButton = styled(Pressable)`
  height: 48px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  padding: 0 12px;
  align-items: center;
  justify-content: center;
`;
const SplitActionButton = styled(ActionButton)`
  flex: 1;
`;

const ActionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const SnippetCarouselWrap = styled.View`
  margin-top: 6px;
  border-radius: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  padding: 10px;
  gap: 10px;
`;

const SnippetSlide = styled.View`
  border-radius: 24px;
  overflow: hidden;
  background-color: #000000;
`;

const SnippetVideoWrap = styled.View`
  width: 100%;
  aspect-ratio: 1 / 1.35;
  background-color: #000000;
`;

const SnippetPlaceholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: #000000;
`;
const SnippetTapLayer = styled(Pressable)`
  position: absolute;
  inset: 0;
`;
const SnippetPauseOverlay = styled.View`
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
`;
const SnippetPauseCircle = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
`;
const SnippetPauseIcon = styled.Text`
  color: #ffffff;
  font-size: 32px;
  margin-left: 3px;
`;

const SnippetOverlay = styled.View`
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 24px;
  gap: 4px;
`;

const SnippetText = styled.Text`
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.68);
  border-radius: 10px;
`;
const SnippetHighlight = styled.Text`
  color: #facc15;
  font-size: 17px;
  font-weight: 800;
`;

const SnippetMuted = styled.Text`
  color: #ffffff;
  font-size: 15px;
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.68);
  border-radius: 10px;
`;

const SnippetBadge = styled(Pressable)`
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.65);
  padding: 6px 10px;
`;

const SnippetBadgeText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
`;

const SnippetCounter = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-size: 13px;
  font-weight: 700;
`;

const UserCard = styled.View`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  padding: 12px;
`;

const UserLine = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 700;
`;

const UserSub = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
  margin-top: 2px;
`;

const Empty = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 13px;
`;
const InlineStatus = styled.Text`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 14px;
  font-weight: 700;
`;
const StatusPill = styled.View`
  height: 48px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  padding: 0 12px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const detectLanguage = (value: string) => (/[а-яё]/i.test(value) ? 'ru' : 'en');
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function renderHighlightedSubtitle(text: string, phrase: string) {
  const trimmedPhrase = phrase.trim();
  if (!trimmedPhrase) return text;

  const regex = new RegExp(`(${escapeRegExp(trimmedPhrase)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedPhrase.toLowerCase() ? (
      <SnippetHighlight key={`${part}-${index}`}>{part}</SnippetHighlight>
    ) : (
      part
    ),
  );
}

function SnippetVideo({
  uri,
  active,
  screenFocused,
  startSeconds,
  endSeconds,
}: {
  uri: string;
  active: boolean;
  screenFocused: boolean;
  startSeconds: number;
  endSeconds: number;
}) {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(
    {
      uri,
      contentType: 'hls',
    },
    (p) => {
      p.loop = false;
      p.timeUpdateEventInterval = 0.2;
      if (active && screenFocused) p.play();
    },
  );

  useEffect(() => {
    setReady(false);
    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setReady(true);
      }
    });
    return () => sub.remove();
  }, [player, uri]);

  useEffect(() => {
    if (!active || !ready) {
      setPaused(false);
      return;
    }
    player.currentTime = Math.max(0, startSeconds);
  }, [active, player, ready, startSeconds, uri]);

  useEffect(() => {
    if (!ready) {
      player.pause();
      return;
    }
    if (active && screenFocused) {
      if (!paused) {
        player.play();
      }
    } else {
      player.pause();
    }
  }, [active, paused, player, ready, screenFocused]);

  useEffect(() => {
    if (!active || !ready) return;
    const sub = player.addListener('timeUpdate', (payload) => {
      const current = payload.currentTime ?? 0;
      if (current >= endSeconds) {
        player.currentTime = Math.max(0, startSeconds);
        if (!paused && screenFocused) {
          player.play();
        } else {
          player.pause();
        }
      }
    });
    return () => sub.remove();
  }, [active, endSeconds, paused, player, ready, screenFocused, startSeconds]);

  const togglePlayback = () => {
    if (!active || !screenFocused || !ready) return;
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
        contentFit="cover"
        nativeControls={false}
      />
      <SnippetTapLayer onPress={togglePlayback} />
      {paused ? (
        <SnippetPauseOverlay pointerEvents="none">
          <SnippetPauseCircle>
            <SnippetPauseIcon>▶</SnippetPauseIcon>
          </SnippetPauseCircle>
        </SnippetPauseOverlay>
      ) : null}
    </>
  );
}

function SnippetCarousel({ items, screenFocused }: { items: PhraseSnippet[]; screenFocused: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  return (
    <SnippetCarouselWrap>
      <View onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}>
        <FlatList
          data={items}
          horizontal
          pagingEnabled
          snapToAlignment="start"
          decelerationRate="fast"
          keyExtractor={(item, index) => `${item.contentId}-${item.startSeconds}-${index}`}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item, index }) => (
            <SnippetSlide style={{ width: Math.max(cardWidth, 1) }}>
              <SnippetVideoWrap>
                {index === activeIndex ? (
                  <SnippetVideo
                    uri={item.videoUrl}
                    active
                    screenFocused={screenFocused}
                    startSeconds={item.startSeconds}
                    endSeconds={item.endSeconds}
                  />
                ) : (
                  <SnippetPlaceholder />
                )}
                <SnippetBadge>
                  <SnippetBadgeText>Full video</SnippetBadgeText>
                </SnippetBadge>
                <SnippetOverlay>
                  <SnippetText>
                    {renderHighlightedSubtitle(item.contextText || item.matchedText || item.phrase, item.phrase)}
                  </SnippetText>
                  {item.translationMatchedText ? (
                    <SnippetMuted>{item.translationMatchedText}</SnippetMuted>
                  ) : null}
                </SnippetOverlay>
              </SnippetVideoWrap>
            </SnippetSlide>
          )}
          onMomentumScrollEnd={(event) => {
            if (cardWidth <= 0) return;
            const next = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
            const clamped = Math.max(0, Math.min(items.length - 1, next));
            setActiveIndex(clamped);
          }}
        />
      </View>
      <SnippetCounter>
        {items.length > 0 ? `${activeIndex + 1}/${items.length}` : '0/0'}
      </SnippetCounter>
    </SnippetCarouselWrap>
  );
}

export function DictionaryContainer() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const dictionary = useAppSelector(selectDictionary);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [entry, setEntry] = useState<MuellerEntry | null>(null);
  const [snippets, setSnippets] = useState<PhraseSnippet[]>([]);
  const [showSnippets, setShowSnippets] = useState(true);

  const token = auth.tokens?.accessToken;
  const userId = auth.profile?.id;

  useEffect(() => {
    if (!token || !userId) return;
    if (dictionary.items.length === 0) {
      dispatch(fetchDictionary());
    }
  }, [dictionary.items.length, dispatch, token, userId]);

  const normalizedWord = useMemo(() => entry?.word?.toLowerCase() ?? '', [entry?.word]);
  const normalizedTranslation = useMemo(() => entry?.translations?.[0]?.toLowerCase() ?? '', [entry?.translations]);

  const existingWord = useMemo(
    () =>
      dictionary.items.find(
        (item) =>
          (item.type ?? 'word') === 'word' &&
          (item.word ?? '').toLowerCase() === normalizedWord &&
          item.translation.toLowerCase() === normalizedTranslation,
      ),
    [dictionary.items, normalizedTranslation, normalizedWord],
  );

  const searchByTerm = async (rawValue: string) => {
    if (!token) return;
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(null);
    setEntry(null);
    setSnippets([]);
    setShowSnippets(true);

    try {
      const lang = detectLanguage(trimmed);
      const lookup = await dictionaryApi.lookupMueller(token, trimmed, lang);
      const lookupEntry = lookup[0] ?? null;
      const snippetsQuery = lang === 'ru' ? lookupEntry?.word?.trim() || trimmed : trimmed;
      const foundSnippets = await dictionaryApi.searchSnippets(token, snippetsQuery, 12).then((res) => res.items);

      setEntry(lookupEntry);
      setSnippets(foundSnippets ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
    } finally {
      setSearching(false);
    }
  };

  const onSearch = async () => {
    await searchByTerm(query);
  };

  const onSynonymPress = async (value: string) => {
    setQuery(value);
    await searchByTerm(value);
  };

  const addCurrent = () => {
    if (!entry) return;
    const translation = entry.translations[0] ?? '';
    if (!translation) return;

    dispatch(
      addWord({
        query: query.trim() || entry.word,
        lang: detectLanguage(query.trim() || entry.word),
        word: entry.word,
        translation,
      }),
    );
  };

  return (
    <Screen edges={[]}>
      <Content keyboardShouldPersistTaps="handled">
        <Wrap>
          <SearchRow>
            <SearchInputWrap>
              <SearchInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search word or phrase"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              {query.length > 0 ? (
                <ClearButton onPress={() => setQuery('')}>
                  <ClearButtonText>×</ClearButtonText>
                </ClearButton>
              ) : null}
            </SearchInputWrap>
            <ActionButton onPress={onSearch}>
              <ActionText>Search</ActionText>
            </ActionButton>
          </SearchRow>

          {searchError ? <Empty>{searchError}</Empty> : null}

          {entry ? (
            <Card>
              {(() => {
                const synonyms = entry.synonyms?.slice(0, 8) ?? [];
                return (
                  <>
              <WordLine>
                {entry.word} - {entry.translations[0] ?? ''}
              </WordLine>
              {entry.translations.length > 1 ? (
                <MetaLine>Other translations: {entry.translations.slice(1, 9).join(', ')}</MetaLine>
              ) : null}
              {synonyms.length > 0 ? (
                <SynonymsWrap>
                  <SynonymsLabel>Synonyms:</SynonymsLabel>
                  {synonyms.map((synonym, index) => (
                    <SynonymLink key={`${synonym}-${index}`} onPress={() => onSynonymPress(synonym)}>
                      {synonym}
                      {index < synonyms.length - 1 ? ',' : ''}
                    </SynonymLink>
                  ))}
                </SynonymsWrap>
              ) : null}

              <SplitActionRow>
                <SplitActionButton onPress={() => setShowSnippets((prev) => !prev)}>
                  <ActionText>{showSnippets ? 'Hide examples' : 'Show examples'}</ActionText>
                </SplitActionButton>
                {existingWord ? (
                  <StatusPill>
                    <InlineStatus>Already in dictionary</InlineStatus>
                  </StatusPill>
                ) : (
                  <SplitActionButton onPress={addCurrent}>
                    <ActionText>Add to dictionary</ActionText>
                  </SplitActionButton>
                )}
              </SplitActionRow>

              {snippets.length > 0 && showSnippets ? (
                <View>
                  <SectionTitle>Video snippets</SectionTitle>
                  <SnippetCarousel items={snippets} screenFocused={isFocused} />
                </View>
              ) : null}
                  </>
                );
              })()}
            </Card>
          ) : null}

          <SectionTitle>My dictionary</SectionTitle>
          {dictionary.items.length === 0 ? (
            <Empty>No words or phrases added yet.</Empty>
          ) : (
            dictionary.items.map((item) => {
              const isPhrase = (item.type ?? 'word') === 'phrase';
              const title = isPhrase ? item.phrase ?? item.word ?? '' : item.word ?? '';
              return (
                <UserCard key={item.id}>
                  <UserLine>
                    {title} - {item.translation}
                  </UserLine>
                  <UserSub>{isPhrase ? 'Phrase' : 'Word'}</UserSub>
                  {isPhrase ? (
                    <ActionRow>
                      <ActionButton onPress={() => dispatch(removePhrase(item.id))}>
                        <ActionText>Delete</ActionText>
                      </ActionButton>
                    </ActionRow>
                  ) : (
                    <ActionRow>
                      <ActionButton onPress={() => dispatch(removeWord(item.id))}>
                        <ActionText>Delete</ActionText>
                      </ActionButton>
                    </ActionRow>
                  )}
                </UserCard>
              );
            })
          )}
        </Wrap>
      </Content>
    </Screen>
  );
}
