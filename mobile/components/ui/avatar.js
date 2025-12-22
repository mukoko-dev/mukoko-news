/**
 * Avatar - shadcn-style avatar component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Image, Text } from 'react-native';

const avatarSizes = {
  sm: 32,
  default: 48,
  lg: 64,
  xl: 100,
};

export function Avatar({
  src,
  alt,
  size = 'default',
  fallback,
  className = '',
}) {
  const avatarSize = typeof size === 'number' ? size : avatarSizes[size];

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const sizeClasses = {
    32: 'w-8 h-8 text-label-medium',
    48: 'w-12 h-12 text-title-medium',
    64: 'w-16 h-16 text-title-large',
    100: 'w-[100px] h-[100px] text-display-small',
  };

  const sizeClass = sizeClasses[avatarSize] || 'w-12 h-12';

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        className={`${sizeClass} rounded-full ${className}`}
        accessibilityLabel={alt}
      />
    );
  }

  return (
    <View className={`${sizeClass} rounded-full bg-tanzanite-container items-center justify-center ${className}`}>
      <Text className="font-serif-bold text-tanzanite">
        {getInitials(fallback || alt || '?')}
      </Text>
    </View>
  );
}

export function AvatarGroup({ children, max = 3, className = '' }) {
  const childArray = React.Children.toArray(children);
  const displayChildren = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <View className={`flex-row ${className}`}>
      {displayChildren.map((child, index) => (
        <View key={index} className={index > 0 ? '-ml-2' : ''}>
          {child}
        </View>
      ))}
      {remaining > 0 && (
        <View className="-ml-2 w-12 h-12 rounded-full bg-surface-variant items-center justify-center border-2 border-surface">
          <Text className="font-sans-medium text-label-medium text-on-surface-variant">
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
