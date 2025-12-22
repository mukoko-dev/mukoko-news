/**
 * MenuItem - Reusable menu item component
 * WeChat/Settings style menu item with icon, label, value, and chevron
 * shadcn-style with NativeWind + Lucide icons
 */

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { getIcon } from '../constants/icons';

export default function MenuItem({
  icon,
  iconColor = '#FFD740',
  iconBg = 'rgba(255, 215, 64, 0.15)',
  label,
  value,
  onPress,
  showChevron = true,
  disabled = false,
  className = '',
}) {
  const IconComponent = typeof icon === 'string' ? getIcon(icon) : icon;

  return (
    <Pressable
      className={`flex-row items-center p-lg min-h-[64px] ${className}`}
      onPress={onPress}
      disabled={disabled}
    >
      {/* Icon Circle */}
      <View
        className="w-[48px] h-[48px] rounded-full items-center justify-center mr-md"
        style={{ backgroundColor: iconBg }}
      >
        <IconComponent size={28} color={iconColor} />
      </View>

      {/* Label */}
      <Text className="flex-1 font-sans text-body-medium text-on-surface">
        {label}
      </Text>

      {/* Value or Chevron */}
      {value ? (
        <Text className="font-sans text-body-small text-on-surface-variant mr-xs">
          {value}
        </Text>
      ) : showChevron ? (
        <ChevronRight size={24} color="#4a4a4a" />
      ) : null}
    </Pressable>
  );
}
