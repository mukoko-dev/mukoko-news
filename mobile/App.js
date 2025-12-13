import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Startup diagnostics - helps debug blank screen issues
const logStartup = (stage, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[Mukoko] ${timestamp} - ${stage}`, details);
};

// Force clear old service workers on web (runs immediately when module loads)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  logStartup('Web platform detected, checking service workers...');

  // Clear any cached service workers immediately
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        logStartup(`Found ${registrations.length} service worker(s), unregistering...`);
        registrations.forEach((reg) => {
          reg.unregister().then(() => {
            logStartup('Service worker unregistered');
          });
        });
      } else {
        logStartup('No service workers registered');
      }
    }).catch((err) => {
      logStartup('Service worker check error', { error: err.message });
    });
  }

  // Clear caches immediately
  if ('caches' in window) {
    caches.keys().then((names) => {
      if (names.length > 0) {
        logStartup(`Found ${names.length} cache(s), clearing...`);
        names.forEach((name) => caches.delete(name));
      }
    }).catch(() => {});
  }
}

logStartup('App module loaded');

// Inner component that uses theme context
function AppContent() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    logStartup('AppContent mounted', { isDark });
  }, [isDark]);

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
  useEffect(() => {
    logStartup('App component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
