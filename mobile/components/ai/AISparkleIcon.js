import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

/**
 * AISparkleIcon - Subtle animated sparkle indicator for AI-enhanced content
 *
 * Design: Elegant, unobtrusive indicator that AI is working
 * Animation: Gentle opacity pulse every 3 seconds
 */
export default function AISparkleIcon({
  size = 14,
  color,
  style,
  animated = true,
}) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const iconColor = color || theme.colors.primary;

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Delay start for subtle effect
    const timeout = setTimeout(() => pulse.start(), 1000);

    return () => {
      clearTimeout(timeout);
      pulse.stop();
    };
  }, [animated, pulseAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }, style]}>
      <Icon
        source="auto-fix"
        size={size}
        color={iconColor}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
