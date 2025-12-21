/**
 * ScreenErrorBoundary - Lightweight error boundary for individual screens
 * Provides graceful degradation if a screen fails to render
 * NativeWind + Lucide icons
 */

import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Text as RNText } from 'react-native';
import { AlertCircle, RefreshCw, Home } from 'lucide-react-native';

class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error(`[ScreenErrorBoundary:${this.props.screenName || 'Unknown'}] Caught error:`, error);
    console.error('[ScreenErrorBoundary] Error info:', errorInfo);

    // Optional error reporting callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate('Home');
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { screenName = 'This screen', navigation } = this.props;

      return (
        <View className="flex-1 bg-background justify-center items-center px-xl">
          {/* Error Icon */}
          <View className="mb-lg">
            <AlertCircle size={64} color="#B3261E" />
          </View>

          {/* Title */}
          <RNText className="font-serif-bold text-title-large text-on-surface mb-sm text-center">
            {screenName} unavailable
          </RNText>

          {/* Error Message */}
          <RNText className="font-sans text-body-medium text-on-surface-variant mb-lg text-center max-w-[320px]">
            We're having trouble loading this screen. Try again or go back home.
          </RNText>

          {/* Error Details (Dev only) */}
          {__DEV__ && this.state.error && (
            <View className="bg-error-container rounded-button p-md mb-lg w-full max-w-[400px]">
              <RNText
                className="font-sans text-label-small text-error"
                style={{ fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}
              >
                {this.state.error.message}
              </RNText>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-md">
            {/* Retry Button */}
            <Pressable
              className="bg-tanzanite px-lg py-md rounded-button active:bg-tanzanite-active"
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading screen"
            >
              <View className="flex-row items-center gap-sm">
                <RefreshCw size={20} color="#FFFFFF" />
                <RNText className="font-sans-medium text-body-medium text-on-primary">
                  Retry
                </RNText>
              </View>
            </Pressable>

            {/* Go Home Button (if navigation available) */}
            {navigation && (
              <Pressable
                className="bg-surface border border-outline px-lg py-md rounded-button active:bg-surface-variant"
                onPress={this.handleGoHome}
                accessibilityRole="button"
                accessibilityLabel="Go to home screen"
              >
                <View className="flex-row items-center gap-sm">
                  <Home size={20} color="#1C1B1F" />
                  <RNText className="font-sans-medium text-body-medium text-on-surface">
                    Home
                  </RNText>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ScreenErrorBoundary;
