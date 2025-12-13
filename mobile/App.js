import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Inner component that uses theme context
function AppContent() {
  const { theme, isDark } = useTheme();

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

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
