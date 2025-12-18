import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * AIShimmerEffect - Brief shimmer animation on load
 *
 * Design: 800ms gradient animation that runs once on mount
 * Use: Wrap content that's AI-enhanced, shimmer plays on first load
 */
export default function AIShimmerEffect({
  children,
  style,
  duration = 800,
  enabled = true,
}) {
  const theme = useTheme();
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

  const shimmerColor = theme.dark
    ? 'rgba(179, 136, 255, 0.15)' // Tanzanite for dark mode
    : 'rgba(75, 0, 130, 0.08)';   // Tanzanite for light mode

  return (
    <View style={[styles.container, style]}>
      {children}
      {enabled && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              opacity: opacityAnim,
              transform: [{ translateX }],
              backgroundColor: shimmerColor,
            }
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    left: '50%',
    marginLeft: -40,
  },
});
