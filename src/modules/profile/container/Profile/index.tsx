import { Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { logout, selectAuth } from '../../../../features/auth/slice';
import { selectThemeMode, setThemeMode } from '../../../../features/ui/slice';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.screen};
`;
const Content = styled.View`flex: 1; padding: 16px;`;
const ProfileRow = styled.View`align-items: center; margin-top: 8px;`;
const AvatarWrap = styled.View`width: 88px; height: 88px; border-radius: 44px; overflow: hidden; border: 2px solid ${({ theme }) => theme.colors.border}; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.avatarBg};`;
const AvatarFallback = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 28px; font-weight: 800;`;
const Name = styled.Text`margin-top: 14px; color: ${({ theme }) => theme.colors.text}; font-size: 24px; font-weight: 800;`;
const Meta = styled.Text`margin-top: 6px; color: ${({ theme }) => theme.colors.mutedText}; font-size: 13px;`;
const Card = styled.View`margin-top: 24px; border-radius: 16px; border: 1px solid ${({ theme }) => theme.colors.border}; background-color: ${({ theme }) => theme.colors.card}; padding: 16px; gap: 10px;`;
const Row = styled.View`flex-direction: row; justify-content: space-between;`;
const Label = styled.Text`color: ${({ theme }) => theme.colors.mutedText}; font-size: 13px;`;
const Value = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 14px; font-weight: 700;`;
const ThemeRow = styled.View`margin-top: 16px; flex-direction: row; gap: 10px;`;
const ThemeButton = styled(Pressable)<{ active: boolean }>`
  flex: 1;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.card)};
  padding: 12px;
  align-items: center;
`;
const ThemeButtonText = styled.Text<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.colors.primaryText : theme.colors.text)};
  font-weight: 700;
`;
const LogoutButton = styled(Pressable)`margin-top: 24px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.primary}; padding: 14px; align-items: center;`;
const LogoutText = styled.Text`color: ${({ theme }) => theme.colors.primaryText}; font-size: 15px; font-weight: 700;`;

export function ProfileContainer() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const themeMode = useAppSelector(selectThemeMode);
  const profile = auth.profile;
  const initial = (profile?.fullName?.[0] ?? profile?.email?.[0] ?? 'U').toUpperCase();

  if (!profile) {
    return (
      <Screen edges={['top', 'bottom']}><Content><Name>Not authenticated</Name><Meta>Please sign in on Home tab.</Meta></Content></Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Content>
        <ProfileRow>
          <AvatarWrap>
            {profile.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={{ width: '100%', height: '100%' }} /> : <AvatarFallback>{initial}</AvatarFallback>}
          </AvatarWrap>
          <Name>{profile.fullName}</Name>
          <Meta>{profile.email}</Meta>
        </ProfileRow>

        <Card>
          <Row><Label>Role</Label><Value>{profile.role}</Value></Row>
          <Row><Label>Level</Label><Value>{profile.level}</Value></Row>
          <Row><Label>XP</Label><Value>{profile.xpPoints}</Value></Row>
          <Row><Label>Streak</Label><Value>{profile.streakDays}</Value></Row>
        </Card>

        <ThemeRow>
          <ThemeButton active={themeMode === 'light'} onPress={() => dispatch(setThemeMode('light'))}><ThemeButtonText active={themeMode === 'light'}>Light</ThemeButtonText></ThemeButton>
          <ThemeButton active={themeMode === 'dark'} onPress={() => dispatch(setThemeMode('dark'))}><ThemeButtonText active={themeMode === 'dark'}>Dark</ThemeButtonText></ThemeButton>
        </ThemeRow>

        <LogoutButton onPress={() => dispatch(logout())}><LogoutText>Logout</LogoutText></LogoutButton>
      </Content>
    </Screen>
  );
}
