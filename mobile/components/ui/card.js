/**
 * Card - shadcn-style card component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

export function Card({ className = '', onPress, children, ...props }) {
  const Component = onPress ? Pressable : View;

  const baseClasses = `
    bg-surface rounded-card p-lg border border-outline shadow-sm
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Component
      className={baseClasses}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <View className={`mb-md ${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <Text
      className={`font-serif-bold text-title-large text-on-surface ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <Text
      className={`font-sans text-body-small text-on-surface-variant ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <View className={`flex-row items-center mt-lg ${className}`} {...props}>
      {children}
    </View>
  );
}
