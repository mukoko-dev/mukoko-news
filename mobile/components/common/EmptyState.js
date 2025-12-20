/**
 * EmptyState - Reusable empty state component
 * Used across 7/14 screens (50%)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../../theme';

export default function EmptyState({
  emoji,
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Icon or Emoji */}
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={mukokoTheme.layout.emojiXL}
          color={paperTheme.colors.onSurfaceVariant}
        />
      ) : null}

      {/* Title */}
      <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
          icon="refresh"
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: mukokoTheme.spacing.xl,
    gap: mukokoTheme.spacing.sm,
  },
  emoji: {
    fontSize: mukokoTheme.layout.emojiXL,
    marginBottom: mukokoTheme.spacing.sm,
  },
  title: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginTop: mukokoTheme.spacing.md,
  },
  subtitle: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: mukokoTheme.spacing.xs,
  },
  actionButton: {
    marginTop: mukokoTheme.spacing.lg,
  },
});
