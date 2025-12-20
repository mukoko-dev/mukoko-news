/**
 * LoadingState - Reusable loading indicator component
 * Used across 14/14 screens (100%)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme as usePaperTheme } from 'react-native-paper';
import mukokoTheme from '../../theme';

export default function LoadingState({ message, variant = 'fullscreen', style }) {
  const paperTheme = usePaperTheme();

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <ActivityIndicator size="small" color={paperTheme.colors.primary} />
        {message && (
          <Text style={[styles.inlineMessage, { color: paperTheme.colors.onSurfaceVariant }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.fullscreenContainer, { backgroundColor: paperTheme.colors.background }, style]}>
      <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      {message && (
        <Text style={[styles.fullscreenMessage, { color: paperTheme.colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  fullscreenMessage: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginTop: mukokoTheme.spacing.sm,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.sm,
  },
  inlineMessage: {
    fontSize: mukokoTheme.typography.bodySmall,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
