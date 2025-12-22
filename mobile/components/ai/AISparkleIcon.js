import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AISparkleIcon - Subtle animated sparkle indicator for AI-enhanced content
 *
 * Design: Elegant, unobtrusive indicator that AI is working
 * Animation: Gentle opacity pulse every 3 seconds
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AISparkleIcon({
  size = 14,
  color,
  style,
  animated = true,
}) {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const iconColor = color || theme.colors.tanzanite;

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
    <Animated.View className="justify-center items-center" style={[{ opacity: pulseAnim }, style]}>
      <Sparkles
        size={size}
        color={iconColor}
        fill={iconColor}
      />
    </Animated.View>
  );
}
