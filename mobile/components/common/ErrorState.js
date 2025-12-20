/**
 * ErrorState - Reusable error display component
 * Used across 13/14 screens (93%)
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../../theme';

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  icon = 'alert-circle-outline',
  showRetryButton = true,
  style,
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }, style]}>
      <MaterialCommunityIcons
        name={icon}
        size={mukokoTheme.layout.emojiLarge}
        color={paperTheme.colors.error}
      />
      <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: paperTheme.colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
      {showRetryButton && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={mukokoTheme.typography.bodyMedium}
            color={paperTheme.colors.onPrimary}
          />
          <Text style={[styles.retryButtonText, { color: paperTheme.colors.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
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
    gap: mukokoTheme.spacing.md,
  },
  title: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textAlign: 'center',
    marginTop: mukokoTheme.spacing.md,
  },
  message: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.xl,
    borderRadius: mukokoTheme.roundness,
    marginTop: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.xs,
  },
  retryButtonText: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
