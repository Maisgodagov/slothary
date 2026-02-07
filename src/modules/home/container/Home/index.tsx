import styled from 'styled-components/native';

import { useAppSelector } from '../../../../app/hooks';
import type { RootState } from '../../../../app/store';

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: #0f111a;
`;

const Content = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

const Title = styled.Text`
  color: #f8fafc;
  font-size: 30px;
  font-weight: 700;
`;

const Subtitle = styled.Text`
  margin-top: 12px;
  color: #cbd5e1;
  font-size: 16px;
  line-height: 22px;
`;

const Badge = styled.View`
  margin-top: 20px;
  align-self: flex-start;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 8px 14px;
`;

const BadgeText = styled.Text`
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 600;
`;

export function HomeContainer() {
  const profile = useAppSelector((state: RootState) => state.auth.profile);

  return (
    <Screen>
      <Content>
        <Title>English Mobile</Title>
        <Subtitle>
          Expo + React Native проект поднят и готов к переносу модулей из веб-приложения.
        </Subtitle>
        <Badge>
          <BadgeText>{profile ? `User: ${profile.fullName}` : 'Not authenticated'}</BadgeText>
        </Badge>
      </Content>
    </Screen>
  );
}
