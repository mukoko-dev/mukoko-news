/**
 * EnhancedSearchBar - Premium glass-effect search bar
 *
 * Design: Apple-inspired premium search experience
 * - Glass morphism effect
 * - Subtle glow on focus
 * - AI indicator when enhanced
 * - Smooth animations
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Icon, ActivityIndicator, useTheme as usePaperTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../../theme';
import { AISparkleIcon } from '../ai';

export default function EnhancedSearchBar({
  value = '',
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Search African news...',
  loading = false,
  showAIIndicator = true,
  style,
}) {
  const paperTheme = usePaperTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
    onFocus?.();
  }, [focusAnim, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
    onBlur?.();
  }, [focusAnim, onBlur]);

  const handleClear = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  const handleSubmit = useCallback(() => {
    if (value.trim().length > 0) {
      onSubmit?.(value);
    }
  }, [value, onSubmit]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      paperTheme.colors.glassBorder || 'rgba(0,0,0,0.1)',
      paperTheme.colors.primary,
    ],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
          borderColor: borderColor,
          shadowOpacity: shadowOpacity,
          shadowColor: paperTheme.colors.primary,
        },
        style,
      ]}
    >
      {/* Search Icon / AI Indicator */}
      <View style={styles.iconContainer}>
        {showAIIndicator && value.length > 0 ? (
          <AISparkleIcon size={18} animated={loading} />
        ) : (
          <Icon
            source="magnify"
            size={20}
            color={isFocused ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
          />
        )}
      </View>

      {/* Input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: paperTheme.colors.onSurface,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        placeholderTextColor={paperTheme.colors.onSurfaceVariant}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        selectTextOnFocus
      />

      {/* Loading / Clear Button */}
      <View style={styles.rightContainer}>
        {loading ? (
          <ActivityIndicator size={18} color={paperTheme.colors.primary} />
        ) : value.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              source="close-circle"
              size={18}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm + 2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    marginRight: mukokoTheme.spacing.sm,
    width: 22,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    paddingVertical: 0,
  },
  rightContainer: {
    marginLeft: mukokoTheme.spacing.sm,
    width: 22,
    alignItems: 'center',
  },
  clearButton: {
    padding: 2,
  },
});
