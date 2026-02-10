import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeStackNavigator } from './HomeStackNavigator';
import { VideoContainer } from '../../modules/video/container/Video';
import { DictionaryContainer } from '../../modules/dictionary/container/Dictionary';
import { useAppSelector } from '../hooks';
import { selectThemeMode } from '../../features/ui/slice';
import { getAppTheme } from '../../shared/theme/themes';

export type RootTabParamList = {
  Home: undefined;
  Video: undefined;
  Dictionary: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const themeMode = useAppSelector(selectThemeMode);
  const appTheme = getAppTheme(themeMode);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: appTheme.colors.card,
          borderTopColor: appTheme.colors.border,
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="Video"
        component={VideoContainer}
        options={{
          tabBarLabel: 'Video',
          headerShown: true,
          title: 'Video',
          headerStyle: { backgroundColor: appTheme.colors.screen },
          headerTintColor: appTheme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryContainer}
        options={{
          tabBarLabel: 'Dictionary',
          headerShown: true,
          title: 'Dictionary',
          headerStyle: { backgroundColor: appTheme.colors.screen },
          headerTintColor: appTheme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Tab.Navigator>
  );
}
