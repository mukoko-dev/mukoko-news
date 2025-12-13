import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Startup diagnostics
const logStartup = (stage, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[Mukoko] ${timestamp} - ${stage}`, details);
};

logStartup('App module loaded');

/**
 * Register service worker for offline-first experience
 * Strategy: HTML=network-only, API=stale-while-revalidate, Assets=cache-first
 */
async function registerServiceWorker() {
  if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    logStartup('Service worker registered', { scope: registration.scope });

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      logStartup('Service worker update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          logStartup('New service worker ready, will activate on next visit');
          // Optionally: prompt user to refresh for new version
        }
      });
    });
  } catch (error) {
    logStartup('Service worker registration failed', { error: error.message });
  }
}

// Inner component that uses theme context
function AppContent() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    logStartup('AppContent mounted', { isDark });

    // Register service worker after app mounts (web only)
    if (Platform.OS === 'web') {
      // Small delay to ensure cleanup script in HTML has run first
      setTimeout(registerServiceWorker, 1000);
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
