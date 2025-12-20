/**
 * Error - shadcn-style error state components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Button } from './button';

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  icon: Icon = AlertCircle,
  showRetryButton = true,
  className = '',
}) {
  return (
    <View className={`flex-1 justify-center items-center bg-background px-xl gap-md ${className}`}>
      <Icon size={48} color="#B3261E" />
      <Text className="font-bold text-headline-small text-on-surface text-center mt-md">
        {title}
      </Text>
      {message && (
        <Text className="font-sans text-body-medium text-on-surface-variant text-center max-w-[300px]">
          {message}
        </Text>
      )}
      {showRetryButton && onRetry && (
        <Button
          variant="default"
          className="mt-md"
          onPress={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </View>
  );
}

export function ErrorBanner({ message, onDismiss, className = '' }) {
  return (
    <View className={`bg-error-container p-md rounded-button flex-row items-center ${className}`}>
      <AlertCircle size={20} color="#B3261E" />
      <Text className="flex-1 ml-sm font-sans text-body-small text-error">
        {message}
      </Text>
      {onDismiss && (
        <Button variant="ghost" size="sm" onPress={onDismiss}>
          Dismiss
        </Button>
      )}
    </View>
  );
}
