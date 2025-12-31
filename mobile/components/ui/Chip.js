/**
 * Chip - Reusable NativeWind chip/tag component
 * Uses only global constants from theme
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * @param {Object} props
 * @param {string} props.label - Chip label
 * @param {boolean} props.selected - Selected state
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.variant - 'default' | 'tanzanite' | 'cobalt' | 'malachite' | 'gold'
 * @param {string} props.className - Additional Tailwind classes
 */
export default function Chip({
  label,
  selected = false,
  icon,
  variant = 'default',
  className = '',
  ...props
}) {
  // Variant classes for selected state
  const selectedClasses = {
    default: 'bg-tanzanite',
    tanzanite: 'bg-tanzanite',
    cobalt: 'bg-cobalt',
    malachite: 'bg-malachite',
    gold: 'bg-gold',
  };

  // Variant classes for unselected state
  const unselectedClasses = {
    default: 'bg-surface-variant',
    tanzanite: 'bg-tanzanite-container',
    cobalt: 'bg-cobalt-container',
    malachite: 'bg-malachite-container',
    gold: 'bg-gold-container',
  };

  // Text color classes
  const textClasses = {
    default: selected ? 'text-on-primary' : 'text-on-surface-variant',
    tanzanite: selected ? 'text-on-primary' : 'text-tanzanite-on-container',
    cobalt: selected ? 'text-on-primary' : 'text-cobalt-on-container',
    malachite: selected ? 'text-on-primary' : 'text-malachite-on-container',
    gold: selected ? 'text-on-primary' : 'text-gold-on-container',
  };

  return (
    <Pressable
      className={`
        flex-row items-center justify-center gap-xs px-md py-sm rounded-button min-h-touch-compact
        ${selected ? selectedClasses[variant] : unselectedClasses[variant]}
        ${className}
      `}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...props}
    >
      {icon && <View>{icon}</View>}
      <Text className={`font-sans-medium text-label-large ${textClasses[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
