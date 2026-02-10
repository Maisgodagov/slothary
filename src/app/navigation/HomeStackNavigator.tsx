import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeContainer } from '../../modules/home/container/Home';
import { ProfileContainer } from '../../modules/profile/container/Profile';
import { useAppSelector } from '../hooks';
import { selectThemeMode } from '../../features/ui/slice';
import { getAppTheme } from '../../shared/theme/themes';

export type HomeStackParamList = {
  HomeMain: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const themeMode = useAppSelector(selectThemeMode);
  const appTheme = getAppTheme(themeMode);

  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: appTheme.colors.screen },
        headerTintColor: appTheme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: appTheme.colors.screen },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeContainer} options={{ title: 'Home' }} />
      <Stack.Screen name="Profile" component={ProfileContainer} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
}
