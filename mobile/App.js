import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from './theme';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  // Register service worker on web platform for offline-first experience
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      import('./services/ServiceWorkerManager.js').then(({ serviceWorkerManager }) => {
        serviceWorkerManager.register().then((registration) => {
          if (registration) {
            console.log('[App] Service worker registered');
          }
        });
      });
    }
  }, []);

  // Always use light theme for clean aesthetic
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
