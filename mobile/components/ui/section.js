/**
 * SectionLabel - shadcn-style section header component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export function SectionLabel({
  children,
  action,
  actionLabel,
  onActionPress,
  className = '',
}) {
  return (
    <View className={`flex-row items-center justify-between mb-md ${className}`}>
      <Text className="font-sans-bold text-label-large text-on-surface-variant uppercase tracking-wide">
        {children}
      </Text>

      {actionLabel && onActionPress && (
        <Pressable
          className="flex-row items-center"
          onPress={onActionPress}
        >
          <Text className="font-sans-medium text-label-large text-tanzanite mr-xs">
            {actionLabel}
          </Text>
          <ChevronRight size={16} color="#4B0082" />
        </Pressable>
      )}

      {action && action}
    </View>
  );
}

export function SectionDivider({ className = '' }) {
  return <View className={`h-[1px] bg-outline my-lg ${className}`} />;
}
