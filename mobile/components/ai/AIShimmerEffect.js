import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AIShimmerEffect - Brief shimmer animation on load
 *
 * Design: 800ms gradient animation that runs once on mount
 * Use: Wrap content that's AI-enhanced, shimmer plays on first load
 *
 * Migration: NativeWind + ThemeContext only (NO React Native Paper, NO StyleSheet)
 */
export default function AIShimmerEffect({
  children,
  style,
  duration = 800,
  enabled = true,
}) {
  const { isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enabled) return;

    // Run shimmer animation once on mount
    Animated.sequence([
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [enabled, duration, shimmerAnim, opacityAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const shimmerColor = isDark
    ? 'rgba(179, 136, 255, 0.15)' // Tanzanite for dark mode
    : 'rgba(75, 0, 130, 0.08)';   // Tanzanite for light mode

  return (
    <View className="relative overflow-hidden" style={style}>
      {children}
      {enabled && (
        <Animated.View
          className="absolute top-0 bottom-0 w-[80px] left-1/2 -ml-[40px]"
          style={{
            opacity: opacityAnim,
            transform: [{ translateX }],
            backgroundColor: shimmerColor,
          }}
          pointerEvents="none"
        />
      )}
    </View>
  );
}
