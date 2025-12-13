/**
 * ErrorBoundary - Catches React errors and displays a fallback UI
 * This prevents blank screens when JavaScript errors occur
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Log to help debug in production
    if (Platform.OS === 'web') {
      console.group('🚨 Mukoko News Error Report');
      console.error('Error:', error?.message || error);
      console.error('Stack:', error?.stack);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.groupEnd();
    }
  }

  handleReload = () => {
    if (Platform.OS === 'web') {
      // Clear caches and reload
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
      // Hard reload
      window.location.reload(true);
    } else {
      // For native, just reset state to retry
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.flagStrip}>
            <View style={[styles.flagBand, { backgroundColor: '#00A651' }]} />
            <View style={[styles.flagBand, { backgroundColor: '#FDD116' }]} />
            <View style={[styles.flagBand, { backgroundColor: '#EF3340' }]} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>Mukoko News encountered an error</Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
              {__DEV__ && this.state.error?.stack && (
                <Text style={styles.stackText}>
                  {this.state.error.stack.slice(0, 500)}...
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.button} onPress={this.handleReload}>
              <Text style={styles.buttonText}>🔄 Reload App</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              If this keeps happening, try clearing your browser cache or using incognito mode.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f8f4',
  },
  flagStrip: {
    flexDirection: 'row',
    height: 4,
  },
  flagBand: {
    flex: 1,
    height: 4,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5a5a5a',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e0dfdc',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5e5772',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d4634a',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  stackText: {
    fontSize: 11,
    color: '#888',
    marginTop: 8,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  button: {
    backgroundColor: '#5e5772',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default ErrorBoundary;
