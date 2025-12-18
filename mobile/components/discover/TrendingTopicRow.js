/**
 * TrendingTopicRow - Horizontal trending topics with rank badges
 *
 * Design: Apple News trending section inspired
 * - Horizontal scroll of trending categories/topics
 * - Rank badges (1, 2, 3) for top items
 * - Growth indicators
 * - Article counts
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, Icon, useTheme as usePaperTheme } from 'react-native-paper';
import mukokoTheme from '../../theme';
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
  paperTheme,
}) {
  const name = topic?.name || topic?.category_name || 'Topic';
  const count = topic?.article_count || topic?.count || 0;
  const growth = topic?.growth_rate || 0;

  const showRank = rank && rank <= 3;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.topicCard,
        {
          backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
          borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
        }
      ]}
      accessibilityLabel={`${name}. ${count} articles. Rank ${rank}`}
      accessibilityRole="button"
    >
      {/* Rank Badge */}
      {showRank && (
        <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[rank] }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}

      {/* Emoji */}
      <Text style={styles.topicEmoji}>{getEmoji(name)}</Text>

      {/* Name */}
      <Text
        style={[styles.topicName, { color: paperTheme.colors.onSurface }]}
        numberOfLines={1}
      >
        {name}
      </Text>

      {/* Count and Growth */}
      <View style={styles.topicMeta}>
        <Text style={[styles.topicCount, { color: paperTheme.colors.onSurfaceVariant }]}>
          {count} {count === 1 ? 'story' : 'stories'}
        </Text>
        {growth > 0 && (
          <View style={[styles.growthBadge, { backgroundColor: mukokoTheme.colors.success + '20' }]}>
            <Icon source="trending-up" size={10} color={mukokoTheme.colors.success} />
            <Text style={[styles.growthText, { color: mukokoTheme.colors.success }]}>
              +{Math.round(growth * 100)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function TrendingTopicRow({
  topics = [],
  onTopicPress,
  title = 'Hot Topics',
  showAILabel = true,
  style,
}) {
  const paperTheme = usePaperTheme();

  if (!topics || topics.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
          {title}
        </Text>
        {showAILabel && (
          <CuratedLabel variant="trending" size="small" />
        )}
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {topics.map((topic, index) => (
          <TrendingTopicCard
            key={topic.id || topic.slug || index}
            topic={topic}
            rank={index + 1}
            onPress={() => onTopicPress?.(topic)}
            paperTheme={paperTheme}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(TrendingTopicRow);

const styles = StyleSheet.create({
  container: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  topicCard: {
    width: 120,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...mukokoTheme.shadows.small,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  topicEmoji: {
    fontSize: 28,
    marginBottom: mukokoTheme.spacing.xs,
  },
  topicName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: mukokoTheme.spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  topicCount: {
    fontSize: 11,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  growthText: {
    fontSize: 9,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
