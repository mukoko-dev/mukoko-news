/**
 * CategoryExplorerCard - Visual category card for Discover screen
 *
 * Design: Artifact/Flipboard inspired
 * - Square or 4:3 aspect ratio
 * - Gradient background based on category
 * - Large emoji (32px centered)
 * - Category name (bold)
 * - Article count badge
 *
 * Migration: NativeWind only (NO React Native Paper, NO StyleSheet)
 */

import React, { memo } from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Category emoji and gradient mappings
const CATEGORY_CONFIG = {
  politics: { emoji: '\ud83c\udfdb\ufe0f', gradient: ['#4B0082', '#6B3FA0'] },
  business: { emoji: '\ud83d\udcbc', gradient: ['#1E3A5F', '#2C5282'] },
  sports: { emoji: '\u26bd', gradient: ['#22543D', '#2F855A'] },
  entertainment: { emoji: '\ud83c\udfac', gradient: ['#702459', '#97266D'] },
  technology: { emoji: '\ud83d\udcbb', gradient: ['#1A365D', '#2B6CB0'] },
  health: { emoji: '\ud83c\udfe5', gradient: ['#234E52', '#319795'] },
  world: { emoji: '\ud83c\udf0d', gradient: ['#1A365D', '#3182CE'] },
  local: { emoji: '\ud83d\udccd', gradient: ['#553C9A', '#805AD5'] },
  opinion: { emoji: '\ud83d\udcad', gradient: ['#5D4037', '#795548'] },
  breaking: { emoji: '\u26a1', gradient: ['#C53030', '#E53E3E'] },
  crime: { emoji: '\ud83d\udea8', gradient: ['#702459', '#9B2C2C'] },
  education: { emoji: '\ud83d\udcda', gradient: ['#2C5282', '#4299E1'] },
  environment: { emoji: '\ud83c\udf31', gradient: ['#276749', '#48BB78'] },
  lifestyle: { emoji: '\u2728', gradient: ['#805AD5', '#9F7AEA'] },
  agriculture: { emoji: '\ud83c\udf3e', gradient: ['#744210', '#D69E2E'] },
  mining: { emoji: '\u26cf\ufe0f', gradient: ['#2D3748', '#4A5568'] },
  tourism: { emoji: '\u2708\ufe0f', gradient: ['#2B6CB0', '#63B3ED'] },
  finance: { emoji: '\ud83d\udcb0', gradient: ['#22543D', '#38A169'] },
  culture: { emoji: '\ud83c\udfad', gradient: ['#702459', '#B83280'] },
  general: { emoji: '\ud83d\udcf0', gradient: ['#4A5568', '#718096'] },
};

const getConfig = (categoryName) => {
  const lowerName = (categoryName || '').toLowerCase();
  return CATEGORY_CONFIG[lowerName] || CATEGORY_CONFIG.general;
};

function CategoryExplorerCard({
  category,
  onPress,
  width,
  style,
  showCount = true,
}) {
  const categoryName = category?.name || category?.category_name || 'General';
  const articleCount = category?.article_count || category?.count || 0;
  const config = getConfig(categoryName);

  const cardWidth = width || 100;

  return (
    <Pressable
      onPress={onPress}
      className="aspect-square rounded-card overflow-hidden shadow-sm"
      style={[{ width: cardWidth }, style]}
      accessibilityLabel={`${categoryName}. ${articleCount} articles`}
      accessibilityRole="button"
      accessibilityHint={`Browse ${categoryName} articles`}
    >
      <LinearGradient
        colors={config.gradient}
        className="flex-1 justify-center items-center p-sm relative"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Emoji */}
        <RNText className="text-[32px] mb-xs">{config.emoji}</RNText>

        {/* Category Name */}
        <RNText className="text-white text-[12px] font-sans-bold text-center capitalize" numberOfLines={1}>
          {categoryName}
        </RNText>

        {/* Article Count Badge */}
        {showCount && articleCount > 0 && (
          <View className="absolute top-xs right-xs bg-white/25 px-[6px] py-[2px] rounded-[10px] min-w-[20px] items-center">
            <RNText className="text-white text-[10px] font-sans-bold">{articleCount}</RNText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default memo(CategoryExplorerCard, (prevProps, nextProps) => {
  return (
    prevProps.category?.id === nextProps.category?.id &&
    prevProps.category?.article_count === nextProps.category?.article_count &&
    prevProps.width === nextProps.width
  );
});
