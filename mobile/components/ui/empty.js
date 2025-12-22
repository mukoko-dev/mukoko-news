/**
 * Empty - shadcn-style empty state components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './button';

export function EmptyState({
  emoji,
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <View className={`flex-1 justify-center items-center px-xl gap-sm ${className}`}>
      {/* Icon or Emoji */}
      {emoji ? (
        <Text className="text-6xl mb-sm">{emoji}</Text>
      ) : Icon ? (
        <Icon size={64} color="#4a4a4a" />
      ) : null}

      {/* Title */}
      <Text className="font-serif-bold text-headline-small text-on-surface text-center mt-md">
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text className="font-sans text-body-medium text-on-surface-variant text-center max-w-[300px] mt-xs">
          {subtitle}
        </Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button variant="default" className="mt-lg" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
