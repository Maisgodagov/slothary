import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

const Wrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #060b1f;
`;

export function Loader() {
  return (
    <Wrap>
      <ActivityIndicator size="large" color="#7dd3fc" />
    </Wrap>
  );
}
