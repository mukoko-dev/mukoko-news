/**
 * MenuItem - Reusable menu item component
 * WeChat/Settings style menu item with icon, label, value, and chevron
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

export default function MenuItem({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  showChevron = true,
  disabled = false,
  style,
}) {
  const paperTheme = usePaperTheme();

  return (
    <TouchableOpacity
      style={[styles.menuItem, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {/* Icon Circle */}
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons
          name={icon}
          size={mukokoTheme.layout.emojiMedium}
          color={iconColor}
        />
      </View>

      {/* Label */}
      <Text style={[styles.menuLabel, { color: paperTheme.colors.onSurface }]}>
        {label}
      </Text>

      {/* Value or Chevron */}
      {value ? (
        <Text style={[styles.menuValue, { color: paperTheme.colors.onSurfaceVariant }]}>
          {value}
        </Text>
      ) : showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={mukokoTheme.layout.badgeMedium}
          color={paperTheme.colors.onSurfaceVariant}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.lg,
    minHeight: mukokoTheme.layout.emojiXL,
  },
  menuIconContainer: {
    width: mukokoTheme.layout.actionButtonSize,
    height: mukokoTheme.layout.actionButtonSize,
    borderRadius: mukokoTheme.layout.actionButtonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: mukokoTheme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  menuValue: {
    fontSize: mukokoTheme.typography.bodySmall,
    marginRight: mukokoTheme.spacing.xs,
  },
});
