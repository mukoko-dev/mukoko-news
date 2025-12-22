/**
 * ErrorBoundary - Catches React errors and displays a fallback UI
 * This prevents blank screens when JavaScript errors occur
 * Migrated to NativeWind + Lucide icons + Mukoko UI components
 */

import React from 'react';
import { View, ScrollView, Platform, Pressable } from 'react-native';
import { Text as RNText } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

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
        <View className="flex-1 bg-background">
          {/* Zimbabwean flag colors strip */}
          <View className="flex-row h-[4px]">
            <View className="flex-1 h-[4px]" style={{ backgroundColor: '#00A651' }} />
            <View className="flex-1 h-[4px]" style={{ backgroundColor: '#FDD116' }} />
            <View className="flex-1 h-[4px]" style={{ backgroundColor: '#EF3340' }} />
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 64 }}>
            {/* Error Icon */}
            <View className="items-center mb-lg">
              <AlertTriangle size={64} color="#B3261E" />
            </View>

            {/* Title */}
            <RNText className="font-serif-bold text-headline-large text-on-surface mb-sm text-center">
              Something went wrong
            </RNText>

            {/* Subtitle */}
            <RNText className="font-sans text-body-large text-on-surface-variant mb-lg text-center">
              Mukoko News encountered an error
            </RNText>

            {/* Error Details Box */}
            <View className="bg-surface rounded-card p-lg mb-lg w-full max-w-[400px] border border-outline">
              <RNText className="font-sans-medium text-label-large text-on-surface-variant mb-sm">
                Error Details:
              </RNText>
              <RNText
                className="font-sans text-body-small text-error"
                style={{ fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}
              >
                {this.state.error?.message || 'Unknown error'}
              </RNText>
              {__DEV__ && this.state.error?.stack && (
                <RNText
                  className="font-sans text-label-small text-on-surface-variant mt-sm"
                  style={{ fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}
                >
                  {this.state.error.stack.slice(0, 500)}...
                </RNText>
              )}
            </View>

            {/* Reload Button - Using inline Pressable since we can't import Button (might be broken) */}
            <Pressable
              className="bg-tanzanite px-xl py-md rounded-button mb-md active:bg-tanzanite-active"
              onPress={this.handleReload}
              accessibilityRole="button"
              accessibilityLabel="Reload application"
            >
              <View className="flex-row items-center gap-sm justify-center">
                <RefreshCw size={20} color="#FFFFFF" />
                <RNText className="font-sans-medium text-body-medium text-on-primary">
                  Reload App
                </RNText>
              </View>
            </Pressable>

            {/* Help Text */}
            <RNText className="font-sans text-body-small text-on-surface-variant text-center max-w-[300px]">
              If this keeps happening, try clearing your browser cache or using incognito mode.
            </RNText>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
