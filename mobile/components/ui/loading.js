/**
 * Loading - shadcn-style loading components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export function LoadingState({ message, variant = 'fullscreen', className = '' }) {
  if (variant === 'inline') {
    return (
      <View className={`flex-row items-center justify-center p-lg gap-sm ${className}`}>
        <ActivityIndicator size="small" color="#4B0082" />
        {message && (
          <Text className="font-sans text-body-small text-on-surface-variant">
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={`flex-1 justify-center items-center bg-background gap-md ${className}`}>
      <ActivityIndicator size="large" color="#4B0082" />
      {message && (
        <Text className="font-sans text-body-medium text-on-surface-variant mt-sm">
          {message}
        </Text>
      )}
    </View>
  );
}

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeValue = size === 'sm' ? 'small' : 'large';
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator size={sizeValue} color="#4B0082" />
    </View>
  );
}
