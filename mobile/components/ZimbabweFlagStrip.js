import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../constants/design-tokens';

// Zimbabwe national flag colors - these are fixed national symbols
const ZW_FLAG_COLORS = {
  green: '#009739',   // Growth, prosperity, agriculture
  yellow: '#FCD116',  // Mineral wealth, sunshine
  red: '#CE1126',     // Heritage, struggle, passion
  black: '#000000',   // African heritage, strength
  white: '#FFFFFF',   // Peace, unity, progress
};

/**
 * Zimbabwe Flag Strip Component
 *
 * Displays a simplified Zimbabwe flag as a vertical strip on the left side
 * with 5 unique horizontal stripes (no repeating colors)
 */
export default function ZimbabweFlagStrip({ style }) {
  return (
    <View style={[styles.container, style]}>
      {/* 5 unique horizontal stripes - no repeating colors */}
      <View style={[styles.stripe, styles.green]} />
      <View style={[styles.stripe, styles.yellow]} />
      <View style={[styles.stripe, styles.red]} />
      <View style={[styles.stripe, styles.black]} />
      <View style={[styles.stripe, styles.white]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    zIndex: 1000,
    flexDirection: 'column',
  },
  stripe: {
    flex: 1,
    width: '100%',
  },
  green: {
    backgroundColor: ZW_FLAG_COLORS.green,
  },
  yellow: {
    backgroundColor: ZW_FLAG_COLORS.yellow,
  },
  red: {
    backgroundColor: ZW_FLAG_COLORS.red,
  },
  black: {
    backgroundColor: ZW_FLAG_COLORS.black,
  },
  white: {
    backgroundColor: ZW_FLAG_COLORS.white,
  },
});
