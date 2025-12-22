/**
 * Button - shadcn-style button component for React Native
 * Copy-paste component with NativeWind (Tailwind CSS)
 * Mukoko brand styling with Nyuchi Brand System v6
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

const buttonVariants = {
  default: 'bg-tanzanite active:bg-tanzanite-active',
  secondary: 'bg-cobalt active:bg-cobalt/90',
  accent: 'bg-gold active:bg-gold/90',
  success: 'bg-malachite active:bg-malachite/90',
  destructive: 'bg-error active:bg-error/90',
  outline: 'border border-outline bg-transparent active:bg-surface-variant',
  ghost: 'bg-transparent active:bg-surface-variant',
};

const buttonSizes = {
  default: 'h-touch px-lg',
  sm: 'h-touch-compact px-md',
  lg: 'h-touch-large px-xl',
  icon: 'h-touch w-touch',
};

const textVariants = {
  default: 'text-on-primary',
  secondary: 'text-on-secondary',
  accent: 'text-on-accent',
  success: 'text-white',
  destructive: 'text-white',
  outline: 'text-on-surface',
  ghost: 'text-on-surface',
};

const textSizes = {
  default: 'text-body-medium',
  sm: 'text-body-small',
  lg: 'text-body-large',
  icon: 'text-body-medium',
};

export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  textClassName = '',
  disabled = false,
  haptics = true,
  icon: Icon,
  iconPosition = 'left',
  children,
  ...props
}) {
  const handlePress = (event) => {
    if (haptics && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPress?.(event);
  };

  const variantClass = buttonVariants[variant] || buttonVariants.default;
  const sizeClass = buttonSizes[size] || buttonSizes.default;
  const textVariantClass = textVariants[variant] || textVariants.default;
  const textSizeClass = textSizes[size] || textSizes.default;

  const baseClasses = `
    flex-row items-center justify-center rounded-button
    ${variantClass}
    ${sizeClass}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const textClasses = `
    font-sans-medium
    ${textVariantClass}
    ${textSizeClass}
    ${textClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Pressable
      className={baseClasses}
      disabled={disabled}
      {...props}
      onPress={handlePress}
    >
      {Icon && iconPosition === 'left' && (
        <View className="mr-xs">
          <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        </View>
      )}
      {children && <Text className={textClasses}>{children}</Text>}
      {Icon && iconPosition === 'right' && (
        <View className="ml-xs">
          <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({ icon: Icon, size = 'default', className = '', ...props }) {
  return (
    <Button size="icon" className={className} {...props}>
      <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
    </Button>
  );
}
