import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { TabNavigator } from './TabNavigator';
import { useAppSelector } from '../hooks';
import { selectThemeMode } from '../../features/ui/slice';
import { getAppTheme } from '../../shared/theme/themes';

export function RootNavigator() {
  const themeMode = useAppSelector(selectThemeMode);
  const appTheme = getAppTheme(themeMode);

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: appTheme.colors.screen,
          card: appTheme.colors.card,
          border: appTheme.colors.border,
          text: appTheme.colors.text,
          primary: appTheme.colors.primary,
        },
      }}
    >
      <TabNavigator />
    </NavigationContainer>
  );
}
