/**
 * Stats - shadcn-style stats display components for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

export function StatCard({
  emoji,
  icon: Icon,
  value,
  label,
  trend,
  trendLabel,
  onPress,
  className = '',
}) {
  const Component = onPress ? Pressable : View;

  return (
    <Component
      className={`bg-surface rounded-card p-lg border border-outline ${className}`}
      onPress={onPress}
    >
      {/* Icon/Emoji */}
      {emoji ? (
        <Text className="text-4xl mb-sm">{emoji}</Text>
      ) : Icon ? (
        <Icon size={32} color="#4B0082" />
      ) : null}

      {/* Value */}
      <Text className="font-serif-bold text-stats text-tanzanite">
        {value}
      </Text>

      {/* Label */}
      <Text className="font-sans text-body-small text-on-surface-variant mt-xs">
        {label}
      </Text>

      {/* Trend (optional) */}
      {trend && (
        <View className="flex-row items-center mt-sm">
          <Text className={`font-sans-medium text-label-small ${trend > 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
          {trendLabel && (
            <Text className="font-sans text-label-small text-on-surface-variant ml-xs">
              {trendLabel}
            </Text>
          )}
        </View>
      )}
    </Component>
  );
}

export function StatsRow({
  stats = [],
  showDivider = true,
  className = '',
}) {
  return (
    <View className={`flex-row justify-around bg-surface rounded-card p-lg ${className}`}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <View className="items-center flex-1">
            {/* Emoji/Icon */}
            {stat.emoji && (
              <Text className="text-2xl mb-xs">{stat.emoji}</Text>
            )}
            {stat.icon && (
              <stat.icon size={24} color={stat.iconColor || '#4B0082'} />
            )}

            {/* Value */}
            <Text className="font-serif-bold text-stats text-tanzanite">
              {stat.value}
            </Text>

            {/* Label */}
            <Text className="font-sans text-body-small text-on-surface-variant text-center mt-xs">
              {stat.label}
            </Text>
          </View>

          {/* Divider */}
          {showDivider && index < stats.length - 1 && (
            <View className="w-[1px] h-8 bg-outline self-center" />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export function StatBadge({
  value,
  label,
  variant = 'default',
  className = '',
}) {
  const variantClasses = {
    default: 'bg-tanzanite-container',
    success: 'bg-malachite-container',
    warning: 'bg-gold-container',
    error: 'bg-error-container',
  };

  const textVariants = {
    default: 'text-tanzanite',
    success: 'text-malachite',
    warning: 'text-gold',
    error: 'text-error',
  };

  return (
    <View className={`${variantClasses[variant]} px-md py-xs rounded-full flex-row items-center gap-xs ${className}`}>
      <Text className={`font-sans-bold text-label-large ${textVariants[variant]}`}>
        {value}
      </Text>
      <Text className={`font-sans text-label-small ${textVariants[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
