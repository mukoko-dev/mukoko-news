/**
 * MenuSection - Container for grouped menu items
 * Provides consistent styling and dividers between items
 * shadcn-style with NativeWind
 */

import React, { Children } from 'react';
import { View } from 'react-native';

export default function MenuSection({ children, className = '' }) {
  const childArray = Children.toArray(children);

  return (
    <View className={`bg-surface mb-sm rounded-card overflow-hidden ${className}`}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && (
            <View className="h-[1px] bg-outline ml-[76px]" />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
