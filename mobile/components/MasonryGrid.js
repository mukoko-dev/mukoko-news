/**
 * MasonryGrid - A responsive masonry layout component
 * Renders items in columns with varying heights for visual interest
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { spacing } from '../constants/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive column calculation
const getColumnCount = (screenWidth) => {
  if (screenWidth >= 1200) return 4;
  if (screenWidth >= 900) return 3;
  if (screenWidth >= 600) return 2;
  return 2;
};

/**
 * Distribute items across columns in a balanced way
 * Uses a greedy algorithm to minimize height differences
 */
const distributeItems = (items, columnCount) => {
  const columns = Array.from({ length: columnCount }, () => ({
    items: [],
    height: 0,
  }));

  items.forEach((item, index) => {
    // Estimate height based on item properties
    // Cards with images are taller, featured items are tallest
    const estimatedHeight = item.variant === 'featured' ? 350 :
      item.imageUrl || item.image_url ? 280 : 180;

    // Find the shortest column
    const shortestColumn = columns.reduce((min, col, i) =>
      col.height < columns[min].height ? i : min, 0);

    columns[shortestColumn].items.push({ ...item, index });
    columns[shortestColumn].height += estimatedHeight;
  });

  return columns;
};

export default function MasonryGrid({
  data = [],
  renderItem,
  keyExtractor,
  gap = spacing.sm,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}) {
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const columnCount = getColumnCount(screenWidth);
  const horizontalPadding = spacing.md * 2;
  const totalGapWidth = gap * (columnCount - 1);
  const columnWidth = (screenWidth - horizontalPadding - totalGapWidth) / columnCount;

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return distributeItems(data, columnCount);
  }, [data, columnCount]);

  if (!data || data.length === 0) {
    return ListEmptyComponent || null;
  }

  return (
    <View style={[styles.container, contentContainerStyle]}>
      {ListHeaderComponent}

      <View style={[styles.columnsContainer, { gap }]}>
        {columns.map((column, columnIndex) => (
          <View key={`column-${columnIndex}`} style={[styles.column, { width: columnWidth }]}>
            {column.items.map((item) => (
              <View key={keyExtractor ? keyExtractor(item, item.index) : item.id || item.index} style={{ marginBottom: gap }}>
                {renderItem({ item, index: item.index, columnWidth })}
              </View>
            ))}
          </View>
        ))}
      </View>

      {ListFooterComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  columnsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
  },
});
