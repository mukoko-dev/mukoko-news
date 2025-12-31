/**
 * StyledView - Wrapper that handles className prop on web
 * Converts common className patterns to inline styles for web compatibility
 * while preserving className for native platforms
 */
import { View, Text, Platform } from 'react-native';
import React from 'react';

// Simple className to style converter for web
const classNameToStyle = (className) => {
  if (!className || Platform.OS !== 'web') return {};

  const styles = {};
  const classes = className.split(' ');

  classes.forEach(cls => {
    // Flex
    if (cls === 'flex-1') styles.flex = 1;
    if (cls === 'flex-row') styles.flexDirection = 'row';
    if (cls === 'flex-col') styles.flexDirection = 'column';

    // Justify & Align
    if (cls === 'justify-center') styles.justifyContent = 'center';
    if (cls === 'justify-between') styles.justifyContent = 'space-between';
    if (cls === 'items-center') styles.alignItems = 'center';
    if (cls === 'items-start') styles.alignItems = 'flex-start';

    // Padding
    if (cls === 'p-md') styles.padding = 12;
    if (cls === 'p-lg') styles.padding = 16;
    if (cls === 'p-xl') styles.padding = 20;
    if (cls === 'px-md') { styles.paddingLeft = 12; styles.paddingRight = 12; }
    if (cls === 'px-lg') { styles.paddingLeft = 16; styles.paddingRight = 16; }
    if (cls === 'px-xl') { styles.paddingLeft = 20; styles.paddingRight = 20; }
    if (cls === 'py-md') { styles.paddingTop = 12; styles.paddingBottom = 12; }
    if (cls === 'py-lg') { styles.paddingTop = 16; styles.paddingBottom = 16; }

    // Margin
    if (cls === 'm-md') styles.margin = 12;
    if (cls === 'mb-md') styles.marginBottom = 12;
    if (cls === 'mb-lg') styles.marginBottom = 16;
    if (cls === 'mt-lg') styles.marginTop = 16;

    // Gap
    if (cls === 'gap-sm') styles.gap = 8;
    if (cls === 'gap-md') styles.gap = 12;
    if (cls === 'gap-lg') styles.gap = 16;

    // Background colors
    if (cls.startsWith('bg-')) {
      const colorMap = {
        'bg-tanzanite': '#4B0082',
        'bg-surface': '#FAF9F5',
        'bg-background': '#FAF9F5',
        'bg-white': '#FFFFFF',
        'bg-black': '#000000',
      };
      styles.backgroundColor = colorMap[cls] || 'transparent';
    }

    // Text colors
    if (cls.startsWith('text-')) {
      const colorMap = {
        'text-on-surface': '#1C1B1F',
        'text-on-background': '#1C1B1F',
        'text-white': '#FFFFFF',
      };
      if (colorMap[cls]) styles.color = colorMap[cls];

      // Font sizes
      if (cls === 'text-headline-large') styles.fontSize = 32;
      if (cls === 'text-title-large') styles.fontSize = 22;
      if (cls === 'text-body-large') styles.fontSize = 16;
      if (cls === 'text-body-medium') styles.fontSize = 14;
    }

    // Font families
    if (cls === 'font-serif-bold') styles.fontFamily = 'NotoSerif-Bold';
    if (cls === 'font-sans') styles.fontFamily = 'PlusJakartaSans-Regular';
    if (cls === 'font-sans-medium') styles.fontFamily = 'PlusJakartaSans-Medium';
    if (cls === 'font-sans-bold') styles.fontFamily = 'PlusJakartaSans-Bold';
  });

  return styles;
};

export function StyledView({ className, style, ...props }) {
  const convertedStyle = classNameToStyle(className);
  return <View style={[convertedStyle, style]} {...props} />;
}

export function StyledText({ className, style, ...props }) {
  const convertedStyle = classNameToStyle(className);
  return <Text style={[convertedStyle, style]} {...props} />;
}
