/**
 * MenuSection - Container for grouped menu items
 * Provides consistent styling and dividers between items
 */

import React, { Children } from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, useTheme as usePaperTheme } from 'react-native-paper';
import mukokoTheme from '../theme';

export default function MenuSection({ children, style }) {
  const paperTheme = usePaperTheme();
  const childArray = Children.toArray(children);

  return (
    <View style={[styles.menuSection, { backgroundColor: paperTheme.colors.surface }, style]}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && (
            <Divider style={styles.divider} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    marginBottom: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },
  divider: {
    marginLeft: mukokoTheme.layout.actionButtonSize + mukokoTheme.spacing.md + mukokoTheme.spacing.lg,
  },
});
