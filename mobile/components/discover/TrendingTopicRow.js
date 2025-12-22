/**
 * TrendingTopicRow - Horizontal trending topics with rank badges
 *
 * Design: Apple News trending section inspired
 * - Horizontal scroll of trending categories/topics
 * - Rank badges (1, 2, 3) for top items
 * - Growth indicators
 * - Article counts
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text as RNText,
} from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CuratedLabel } from '../ai';

// Category emoji mapping
const CATEGORY_EMOJIS = {
  politics: '\ud83c\udfdb\ufe0f',
  business: '\ud83d\udcbc',
  sports: '\u26bd',
  entertainment: '\ud83c\udfac',
  technology: '\ud83d\udcbb',
  health: '\ud83c\udfe5',
  world: '\ud83c\udf0d',
  local: '\ud83d\udccd',
  opinion: '\ud83d\udcad',
  breaking: '\u26a1',
  crime: '\ud83d\udea8',
  education: '\ud83d\udcda',
  environment: '\ud83c\udf31',
  lifestyle: '\u2728',
  agriculture: '\ud83c\udf3e',
  mining: '\u26cf\ufe0f',
  tourism: '\u2708\ufe0f',
  finance: '\ud83d\udcb0',
  culture: '\ud83c\udfad',
  general: '\ud83d\udcf0',
};

const getEmoji = (categoryName) => {
  const lowerName = (categoryName || '').toLowerCase();
  return CATEGORY_EMOJIS[lowerName] || '\ud83d\udcf0';
};

// Rank colors for top 3
const RANK_COLORS = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver
  3: '#CD7F32', // Bronze
};

function TrendingTopicCard({
  topic,
  rank,
  onPress,
  theme,
}) {
  const name = topic?.name || topic?.category_name || 'Topic';
  const count = topic?.article_count || topic?.count || 0;
  const growth = topic?.growth_rate || 0;

  const showRank = rank && rank <= 3;

  return (
    <Pressable
      onPress={onPress}
      className="w-[120px] p-md rounded-card border items-center relative"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.outline,
      }}
      accessibilityLabel={`${name}. ${count} articles. Rank ${rank}`}
      accessibilityRole="button"
    >
      {/* Rank Badge */}
      {showRank && (
        <View
          className="absolute -top-[6px] -right-[6px] w-[20px] h-[20px] rounded-[10px] justify-center items-center shadow-sm"
          style={{ backgroundColor: RANK_COLORS[rank] }}
        >
          <RNText className="text-white text-[10px] font-sans-bold">{rank}</RNText>
        </View>
      )}

      {/* Emoji */}
      <RNText className="text-[28px] mb-xs">{getEmoji(name)}</RNText>

      {/* Name */}
      <RNText
        className="font-sans-medium text-[13px] text-center capitalize"
        style={{ color: theme.colors['on-surface'] }}
        numberOfLines={1}
      >
        {name}
      </RNText>

      {/* Count and Growth */}
      <View className="flex-row items-center gap-[4px] mt-xs flex-wrap justify-center">
        <RNText className="text-[11px]" style={{ color: theme.colors['on-surface-variant'] }}>
          {count} {count === 1 ? 'story' : 'stories'}
        </RNText>
        {growth > 0 && (
          <View className="flex-row items-center px-xs py-[2px] rounded-[6px] gap-[2px]" style={{ backgroundColor: theme.colors.success + '20' }}>
            <TrendingUp size={10} color={theme.colors.success} strokeWidth={2} />
            <RNText className="font-sans-medium text-[9px]" style={{ color: theme.colors.success }}>
              +{Math.round(growth * 100)}%
            </RNText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function TrendingTopicRow({
  topics = [],
  onTopicPress,
  title = 'Hot Topics',
  showAILabel = true,
  style,
}) {
  const { theme } = useTheme();

  if (!topics || topics.length === 0) return null;

  return (
    <View className="mb-lg" style={style}>
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-md mb-sm">
        <RNText
          className="font-sans-bold text-[14px] uppercase tracking-wide"
          style={{ color: theme.colors['on-surface'] }}
        >
          {title}
        </RNText>
        {showAILabel && (
          <CuratedLabel variant="trending" size="small" />
        )}
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-md gap-sm"
      >
        {topics.map((topic, index) => (
          <TrendingTopicCard
            key={topic.id || topic.slug || index}
            topic={topic}
            rank={index + 1}
            onPress={() => onTopicPress?.(topic)}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(TrendingTopicRow);
