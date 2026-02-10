import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import { store, persistor } from '../store';
import { Loader } from '../shared/ui/Loader';
import { RootNavigator } from './navigation/RootNavigator';
import { useAppSelector } from './hooks';
import { selectThemeMode } from '../features/ui/slice';
import { darkTheme, getAppTheme } from '../shared/theme/themes';

function AppContent() {
  const themeMode = useAppSelector(selectThemeMode);
  const theme = getAppTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <RootNavigator />
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={darkTheme}>
        <Provider store={store}>
          <PersistGate loading={<Loader />} persistor={persistor}>
            <AppContent />
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
