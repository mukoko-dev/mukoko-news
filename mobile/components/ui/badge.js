/**
 * Badge - shadcn-style badge component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { staticColors } from '../../constants/design-tokens';

const badgeVariants = {
  default: 'bg-tanzanite',
  secondary: 'bg-cobalt',
  accent: 'bg-gold',
  success: 'bg-malachite',
  error: 'bg-error',
  outline: 'border border-outline bg-transparent',
};

const textVariants = {
  default: 'text-on-primary',
  secondary: 'text-on-secondary',
  accent: 'text-on-accent',
  success: 'text-white',
  error: 'text-white',
  outline: 'text-on-surface',
};

const badgeSizes = {
  sm: 'px-sm py-[2px]',
  default: 'px-md py-xs',
  lg: 'px-lg py-sm',
};

const textSizes = {
  sm: 'text-label-small',
  default: 'text-label-medium',
  lg: 'text-label-large',
};

export function Badge({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) {
  const variantClass = badgeVariants[variant] || badgeVariants.default;
  const textVariantClass = textVariants[variant] || textVariants.default;
  const sizeClass = badgeSizes[size] || badgeSizes.default;
  const textSizeClass = textSizes[size] || textSizes.default;

  const containerClasses = `
    inline-flex items-center justify-center rounded-full
    ${variantClass}
    ${sizeClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const textClasses = `
    font-sans-medium uppercase
    ${textVariantClass}
    ${textSizeClass}
  `.trim().replace(/\s+/g, ' ');

  return (
    <View className={containerClasses} {...props}>
      <Text className={textClasses}>{children}</Text>
    </View>
  );
}

export function CountBadge({ count, className = '', ...props }) {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <Badge variant="error" size="sm" className={`min-w-[18px] ${className}`} {...props}>
      {displayCount}
    </Badge>
  );
}

/**
 * FilterChip - Pressable chip for filters with selected state
 * Used in admin screens for role/status filtering
 */
export function FilterChip({
  selected = false,
  onPress,
  icon: Icon,
  className = '',
  children,
  ...props
}) {
  const { colors } = useTheme();

  const chipClasses = `
    flex-row items-center gap-xs px-md py-sm rounded-full border min-h-touch-compact
    ${selected
      ? 'bg-tanzanite border-tanzanite'
      : 'bg-surface border-outline'
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const textClasses = `
    font-sans-medium text-label-large
    ${selected ? 'text-on-primary' : 'text-on-surface'}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Pressable
      onPress={onPress}
      className={chipClasses}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
    >
      {Icon && <Icon size={14} color={selected ? staticColors.white : colors.onSurface} />}
      <Text className={textClasses}>{children}</Text>
    </Pressable>
  );
}
