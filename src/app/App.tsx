import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';

import { store, persistor } from '../store';
import { HomeContainer } from '../modules/home/container/Home';
import { Loader } from '../shared/ui/Loader';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistor}>
        <HomeContainer />
        <StatusBar style="light" />
      </PersistGate>
    </Provider>
  );
}
