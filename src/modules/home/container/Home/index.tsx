import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'styled-components/native';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { apiFetch } from '../../../../shared/api/client';
import { login, selectAuth } from '../../../../features/auth/slice';
import type { HomeStackParamList } from '../../../../app/navigation/HomeStackNavigator';

interface DictionaryStats {
  learningCount: number;
  knownCount: number;
  viewedCount: number;
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.screen};`;
const Content = styled.View`flex: 1; padding: 16px;`;
const LoginTitle = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 30px; font-weight: 700;`;
const Subtitle = styled.Text`margin-top: 12px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 16px; line-height: 22px;`;
const Label = styled.Text`margin-top: 16px; margin-bottom: 8px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 13px;`;
const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px 14px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.card};
`;
const Button = styled(Pressable)`margin-top: 18px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.primary}; padding: 14px; align-items: center;`;
const ButtonText = styled.Text`color: ${({ theme }) => theme.colors.primaryText}; font-size: 15px; font-weight: 700;`;
const ErrorText = styled.Text`margin-top: 10px; color: ${({ theme }) => theme.colors.danger}; font-size: 13px;`;
const HeaderRow = styled.View`flex-direction: row; align-items: flex-start; justify-content: space-between; margin-top: 4px;`;
const HeaderLeft = styled.View`flex: 1; padding-right: 12px;`;
const Greeting = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 32px; font-weight: 800;`;
const Meta = styled.Text`margin-top: 6px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;`;
const HeaderRight = styled.View`align-items: flex-end; gap: 10px;`;
const ProfileButton = styled(Pressable)`width: 44px; height: 44px; border-radius: 22px; border: 2px solid ${({ theme }) => theme.colors.border}; overflow: hidden; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.avatarBg};`;
const ProfileFallback = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 15px; font-weight: 800;`;
const StreakBadge = styled.View`min-width: 78px; padding: 10px 14px; border-radius: 18px; background-color: ${({ theme }) => theme.colors.card}; flex-direction: row; align-items: center; justify-content: center;`;
const StreakIcon = styled.Text`color: ${({ theme }) => theme.colors.flame}; font-size: 18px; margin-right: 8px;`;
const StreakText = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 20px; font-weight: 800;`;
const SectionHeader = styled.View`margin-top: 22px; margin-bottom: 12px; flex-direction: row; align-items: center; justify-content: space-between;`;
const SectionTitle = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 30px; font-weight: 800;`;
const SectionLink = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: 16px; font-weight: 700;`;
const ProgressCard = styled.View`border-radius: 24px; background-color: ${({ theme }) => theme.colors.cardStrong}; border: 1px solid ${({ theme }) => theme.colors.border}; padding-vertical: 18px; flex-direction: row;`;
const ProgressItem = styled.View`flex: 1; align-items: center; justify-content: center;`;
const ProgressDivider = styled.View`width: 1px; background-color: ${({ theme }) => theme.colors.border};`;
const ProgressValue = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 36px; font-weight: 800;`;
const ProgressLabel = styled.Text`margin-top: 2px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;`;
const ProgressHint = styled.Text`margin-top: 10px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 12px;`;

export function HomeContainer() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const theme = useTheme();
  const auth = useAppSelector(selectAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<DictionaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const isLoading = auth.status === 'loading';
  const profileInitial = useMemo(() => (auth.profile?.fullName?.[0] ?? auth.profile?.email?.[0] ?? 'U').toUpperCase(), [auth.profile?.email, auth.profile?.fullName]);
  const displayName = auth.profile?.fullName?.split(' ').filter(Boolean)[0] || auth.profile?.email || 'User';

  useEffect(() => {
    const userId = auth.profile?.id;
    const token = auth.tokens?.accessToken;
    if (!userId || !token) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    apiFetch<DictionaryStats>('dictionary/stats', { token, headers: { 'x-user-id': userId } })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [auth.profile?.id, auth.tokens?.accessToken]);

  if (!auth.profile) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Content>
          <LoginTitle>Sign in</LoginTitle>
          <Subtitle>Login with email and password.</Subtitle>
          <Label>Email</Label>
          <Input value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.colors.mutedText} autoCapitalize="none" keyboardType="email-address" />
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={theme.colors.mutedText} secureTextEntry />
          <Button onPress={() => dispatch(login({ email: email.trim(), password }))} disabled={isLoading}><ButtonText>{isLoading ? 'Signing in...' : 'Sign in'}</ButtonText></Button>
          {auth.error ? <ErrorText>{auth.error}</ErrorText> : null}
        </Content>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Content>
        <HeaderRow>
          <HeaderLeft>
            <Greeting>Hello, {displayName}!</Greeting>
            <Meta>Level {auth.profile.level}  •  {auth.profile.xpPoints} XP</Meta>
          </HeaderLeft>
          <HeaderRight>
            <ProfileButton accessibilityLabel="Open profile" onPress={() => navigation.navigate('Profile')}>
              {auth.profile.avatarUrl ? <Image source={{ uri: auth.profile.avatarUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <ProfileFallback>{profileInitial}</ProfileFallback>}
            </ProfileButton>
            <StreakBadge><StreakIcon>🔥</StreakIcon><StreakText>{auth.profile.streakDays}</StreakText></StreakBadge>
          </HeaderRight>
        </HeaderRow>
        <SectionHeader><SectionTitle>My progress</SectionTitle><SectionLink>Details</SectionLink></SectionHeader>
        <ProgressCard>
          <ProgressItem><ProgressValue>{stats?.learningCount ?? 0}</ProgressValue><ProgressLabel>Learning words</ProgressLabel></ProgressItem>
          <ProgressDivider />
          <ProgressItem><ProgressValue>{stats?.knownCount ?? 0}</ProgressValue><ProgressLabel>Known words</ProgressLabel></ProgressItem>
          <ProgressDivider />
          <ProgressItem><ProgressValue>{stats?.viewedCount ?? 0}</ProgressValue><ProgressLabel>Translated words</ProgressLabel></ProgressItem>
        </ProgressCard>
        {statsLoading ? <ProgressHint>Loading stats...</ProgressHint> : null}
      </Content>
    </Screen>
  );
}
