/**
 * InsightsScreen - AI-Powered Analytics Dashboard
 * Community-focused analytics with open access to data
 * Core Mukoko belief: Everyone gets access to insights, not just admins
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text,
  Surface,
  ActivityIndicator,
  Icon,
  useTheme as usePaperTheme,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import { insights as insightsAPI, categories as categoriesAPI } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category emoji mapping
const CATEGORY_EMOJIS = {
  politics: '🏛️',
  business: '💼',
  sports: '⚽',
  entertainment: '🎬',
  technology: '💻',
  health: '🏥',
  world: '🌍',
  local: '📍',
  opinion: '💭',
  breaking: '⚡',
  crime: '🚨',
  education: '📚',
  environment: '🌱',
  lifestyle: '✨',
  agriculture: '🌾',
  mining: '⛏️',
  tourism: '✈️',
  finance: '💰',
  culture: '🎭',
  general: '📰',
};

const getEmoji = (categoryName) => {
  const lowerName = (categoryName || '').toLowerCase();
  return CATEGORY_EMOJIS[lowerName] || '📰';
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <Text>{displayValue.toLocaleString()}{suffix}</Text>;
};

export default function InsightsScreen({ navigation }) {
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [trendingAuthors, setTrendingAuthors] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [categoryInsights, setCategoryInsights] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);
  const [contentQuality, setContentQuality] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        trendingCatsResult,
        trendingAuthorsResult,
        statsResult,
        insightsResult,
        analyticsResult,
        qualityResult,
      ] = await Promise.all([
        insightsAPI.getTrendingCategories(12),
        insightsAPI.getTrendingAuthors(10),
        insightsAPI.getStats(),
        insightsAPI.getCategoryInsights(timeRange),
        insightsAPI.getAnalytics(),
        insightsAPI.getContentQuality(),
      ]);

      if (trendingCatsResult.data?.trending) {
        setTrendingCategories(trendingCatsResult.data.trending);
      }

      if (trendingAuthorsResult.data?.trending_authors) {
        setTrendingAuthors(trendingAuthorsResult.data.trending_authors);
      }

      if (statsResult.data?.database) {
        setPlatformStats(statsResult.data.database);
      }

      if (insightsResult.data?.insights) {
        setCategoryInsights(insightsResult.data.insights);
      }

      if (analyticsResult.data) {
        setEngagementStats(analyticsResult.data);
      }

      if (qualityResult.data) {
        setContentQuality(qualityResult.data);
      }
    } catch (err) {
      console.error('[Insights] Load error:', err);
      setError('Failed to load insights. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate('DiscoverFeed', { selectedCategory: category.slug || category.id });
  };

  const handleAuthorPress = (author) => {
    navigation.navigate('SearchFeed', { searchQuery: author.name });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    card: {
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
    title: {
      color: paperTheme.colors.onSurface,
    },
    subtitle: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    statValue: {
      color: paperTheme.colors.primary,
    },
    aiGlow: {
      backgroundColor: isDark ? 'rgba(212, 99, 74, 0.15)' : 'rgba(212, 99, 74, 0.08)',
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, dynamicStyles.subtitle]}>
            Analyzing trends with AI...
          </Text>
          <View style={styles.loadingDotsContainer}>
            <Icon source="robot" size={20} color={mukokoTheme.colors.accent} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[paperTheme.colors.primary]}
            tintColor={paperTheme.colors.primary}
          />
        }
      >
        {/* Header with AI Badge */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, dynamicStyles.title]}>Insights</Text>
            <Chip
              mode="flat"
              style={[styles.aiBadge, dynamicStyles.aiGlow]}
              textStyle={styles.aiBadgeText}
              icon={() => <Icon source="robot" size={14} color={mukokoTheme.colors.accent} />}
            >
              AI Powered
            </Chip>
          </View>
          <Text style={[styles.headerSubtitle, dynamicStyles.subtitle]}>
            Community analytics - open to everyone
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[7, 14, 30].map((days) => (
              <Chip
                key={days}
                mode={timeRange === days ? 'flat' : 'outlined'}
                selected={timeRange === days}
                onPress={() => setTimeRange(days)}
                style={[
                  styles.timeChip,
                  timeRange === days && { backgroundColor: paperTheme.colors.primary },
                ]}
                textStyle={timeRange === days ? { color: '#FFFFFF' } : {}}
              >
                {days} Days
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Error State */}
        {error && (
          <TouchableOpacity
            style={[styles.errorCard, { backgroundColor: paperTheme.colors.errorContainer }]}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Icon source="alert-circle" size={20} color={paperTheme.colors.error} />
            <Text style={{ color: paperTheme.colors.error, flex: 1 }}>{error}</Text>
            <Icon source="refresh" size={20} color={paperTheme.colors.error} />
          </TouchableOpacity>
        )}

        {/* Platform Stats - Live Counter Style */}
        {platformStats && (
          <TouchableOpacity
            style={[styles.card, dynamicStyles.card]}
            onPress={() => toggleSection('stats')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Platform statistics"
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="chart-bar" size={20} color={paperTheme.colors.primary} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Live Platform Stats</Text>
              </View>
              <View style={[styles.liveBadge, { backgroundColor: mukokoTheme.colors.zwGreen }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('DiscoverFeed')}
                accessibilityRole="button"
                accessibilityLabel={`${platformStats.total_articles} articles, tap to browse`}
              >
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={platformStats.total_articles || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Articles</Text>
                <Icon source="chevron-right" size={16} color={paperTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={platformStats.active_sources || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Sources</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={platformStats.categories || 0} />
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.subtitle]}>Categories</Text>
              </View>
            </View>
            {expandedSection === 'stats' && (
              <View style={styles.expandedContent}>
                <Text style={[styles.expandedText, dynamicStyles.subtitle]}>
                  Updated in real-time from Zimbabwe's top news sources
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Engagement Metrics */}
        {engagementStats && (
          <TouchableOpacity
            style={[styles.card, dynamicStyles.card]}
            onPress={() => toggleSection('engagement')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Engagement metrics"
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="heart-pulse" size={20} color={mukokoTheme.colors.zwRed} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Community Engagement</Text>
              </View>
              <Icon
                source={expandedSection === 'engagement' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.engagementGrid}>
              <View style={styles.engagementItem}>
                <Icon source="eye" size={24} color={paperTheme.colors.primary} />
                <Text style={[styles.engagementValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={engagementStats.total_views || 0} />
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Views</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon source="heart" size={24} color={mukokoTheme.colors.zwRed} />
                <Text style={[styles.engagementValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={engagementStats.total_likes || 0} />
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Likes</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon source="bookmark" size={24} color={mukokoTheme.colors.zwYellow} />
                <Text style={[styles.engagementValue, dynamicStyles.statValue]}>
                  <AnimatedCounter value={engagementStats.total_saves || 0} />
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Saves</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon source="percent" size={24} color={mukokoTheme.colors.zwGreen} />
                <Text style={[styles.engagementValue, dynamicStyles.statValue]}>
                  {(engagementStats.avg_engagement_rate || 0).toFixed(1)}%
                </Text>
                <Text style={[styles.engagementLabel, dynamicStyles.subtitle]}>Avg Rate</Text>
              </View>
            </View>
            {expandedSection === 'engagement' && engagementStats.top_articles && (
              <View style={styles.topArticlesSection}>
                <Text style={[styles.topArticlesTitle, dynamicStyles.title]}>Top Performing</Text>
                {engagementStats.top_articles.slice(0, 3).map((article, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.topArticleItem, { backgroundColor: paperTheme.colors.surface }]}
                    onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.topArticleRank, { color: paperTheme.colors.primary }]}>
                      {index + 1}
                    </Text>
                    <View style={styles.topArticleInfo}>
                      <Text style={[styles.topArticleTitle, dynamicStyles.title]} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <View style={styles.topArticleStats}>
                        <Text style={dynamicStyles.subtitle}>👁️ {article.view_count || 0}</Text>
                        <Text style={dynamicStyles.subtitle}>❤️ {article.like_count || 0}</Text>
                      </View>
                    </View>
                    <Icon source="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Content Quality Metrics */}
        {contentQuality && (
          <TouchableOpacity
            style={[styles.card, dynamicStyles.card]}
            onPress={() => toggleSection('quality')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Content quality metrics"
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="star-check" size={20} color={mukokoTheme.colors.zwYellow} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Content Quality</Text>
              </View>
              <Icon
                source={expandedSection === 'quality' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.qualityGrid}>
              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, dynamicStyles.statValue]}>
                  {(contentQuality.avg_word_count || 0).toFixed(0)}
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>Avg Words</Text>
              </View>
              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, dynamicStyles.statValue]}>
                  {(contentQuality.with_images_percent || 0).toFixed(0)}%
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>With Images</Text>
              </View>
              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, dynamicStyles.statValue]}>
                  {(contentQuality.ai_enhanced_percent || 0).toFixed(0)}%
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>AI Enhanced</Text>
              </View>
              <View style={styles.qualityItem}>
                <Text style={[styles.qualityValue, dynamicStyles.statValue]}>
                  {(contentQuality.avg_read_time || 0).toFixed(1)}m
                </Text>
                <Text style={[styles.qualityLabel, dynamicStyles.subtitle]}>Read Time</Text>
              </View>
            </View>
            {expandedSection === 'quality' && (
              <View style={styles.expandedContent}>
                <Text style={[styles.expandedText, dynamicStyles.subtitle]}>
                  Our AI enhances articles with summaries, keywords, and improved readability
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* AI Insights Section */}
        {categoryInsights && (
          <TouchableOpacity
            style={[styles.card, styles.aiCard, dynamicStyles.card, dynamicStyles.aiGlow]}
            onPress={() => toggleSection('ai')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="AI-generated insights"
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Icon source="lightbulb-on" size={20} color={mukokoTheme.colors.zwYellow} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>AI Analysis</Text>
              </View>
              <Icon
                source={expandedSection === 'ai' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </View>

            {/* AI Summary */}
            {categoryInsights.summary && (
              <View style={[styles.aiSummaryBox, { backgroundColor: paperTheme.colors.surface }]}>
                <Icon source="robot" size={16} color={mukokoTheme.colors.accent} style={styles.aiIcon} />
                <Text style={[styles.aiSummaryText, dynamicStyles.title]}>
                  "{categoryInsights.summary}"
                </Text>
              </View>
            )}

            {/* AI Recommendations */}
            {expandedSection === 'ai' && categoryInsights.recommendations && (
              <View style={styles.recommendationsList}>
                {categoryInsights.recommendations.slice(0, 5).map((rec, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.recommendationItem, { backgroundColor: paperTheme.colors.surface }]}
                    onPress={() => {
                      // Extract topic from recommendation and search
                      const topic = rec.split(' ').slice(0, 3).join(' ');
                      navigation.navigate('SearchFeed', { searchQuery: topic });
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon source="lightbulb" size={16} color={mukokoTheme.colors.zwYellow} />
                    <Text style={[styles.recommendationText, dynamicStyles.subtitle]} numberOfLines={2}>
                      {rec}
                    </Text>
                    <Icon source="arrow-right" size={16} color={paperTheme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Trending Categories */}
        {trendingCategories.length > 0 && (
          <View style={[styles.card, dynamicStyles.card]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection('categories')}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Icon source="fire" size={20} color={mukokoTheme.colors.accent} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Trending Topics</Text>
              </View>
              <Icon
                source={expandedSection === 'categories' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <View style={styles.categoriesGrid}>
              {trendingCategories.slice(0, expandedSection === 'categories' ? 12 : 6).map((category, index) => (
                <TouchableOpacity
                  key={category.id || index}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
                      borderColor: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.15)',
                    }
                  ]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.name || category.category_name}, ${category.article_count} articles`}
                >
                  <Text style={styles.categoryEmoji}>
                    {getEmoji(category.name || category.category_name)}
                  </Text>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, dynamicStyles.title]} numberOfLines={1}>
                      {category.name || category.category_name}
                    </Text>
                    {category.article_count && (
                      <Text style={[styles.categoryCount, dynamicStyles.subtitle]}>
                        {category.article_count} articles
                      </Text>
                    )}
                  </View>
                  {category.growth_rate !== undefined && (
                    <View style={[
                      styles.growthBadge,
                      { backgroundColor: category.growth_rate >= 0 ? 'rgba(0, 166, 81, 0.15)' : 'rgba(239, 51, 64, 0.15)' }
                    ]}>
                      <Icon
                        source={category.growth_rate >= 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed}
                      />
                      <Text style={{
                        fontSize: 10,
                        fontFamily: mukokoTheme.fonts.medium.fontFamily,
                        color: category.growth_rate >= 0 ? mukokoTheme.colors.zwGreen : mukokoTheme.colors.zwRed,
                      }}>
                        {Math.abs(category.growth_rate || 0).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {trendingCategories.length > 6 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => toggleSection('categories')}
              >
                <Text style={[styles.showMoreText, { color: paperTheme.colors.primary }]}>
                  {expandedSection === 'categories' ? 'Show Less' : `Show ${trendingCategories.length - 6} More`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Top Journalists */}
        {trendingAuthors.length > 0 && (
          <View style={[styles.card, dynamicStyles.card]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection('authors')}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <Icon source="account-star" size={20} color={paperTheme.colors.primary} />
                <Text style={[styles.cardTitle, dynamicStyles.title]}>Top Journalists</Text>
              </View>
              <Icon
                source={expandedSection === 'authors' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <View style={styles.authorsList}>
              {trendingAuthors.slice(0, expandedSection === 'authors' ? 10 : 5).map((author, index) => (
                <TouchableOpacity
                  key={author.id || index}
                  style={[
                    styles.authorItem,
                    {
                      backgroundColor: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.05)',
                    }
                  ]}
                  onPress={() => handleAuthorPress(author)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${author.name}, ${author.article_count} articles`}
                >
                  <View style={[
                    styles.authorRank,
                    {
                      backgroundColor: index === 0 ? '#FFD700' :
                        index === 1 ? '#C0C0C0' :
                        index === 2 ? '#CD7F32' : paperTheme.colors.primary
                    }
                  ]}>
                    <Text style={styles.authorRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, dynamicStyles.title]} numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text style={[styles.authorMeta, dynamicStyles.subtitle]} numberOfLines={1}>
                      {author.article_count || 0} articles
                      {author.outlets && ` • ${author.outlets.slice(0, 2).join(', ')}`}
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              ))}
            </View>

            {trendingAuthors.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => toggleSection('authors')}
              >
                <Text style={[styles.showMoreText, { color: paperTheme.colors.primary }]}>
                  {expandedSection === 'authors' ? 'Show Less' : `Show ${trendingAuthors.length - 5} More`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Community Message */}
        <View style={[styles.communityCard, dynamicStyles.card]}>
          <Icon source="account-group" size={24} color={paperTheme.colors.primary} />
          <View style={styles.communityContent}>
            <Text style={[styles.communityTitle, dynamicStyles.title]}>
              Open Analytics
            </Text>
            <Text style={[styles.communityText, dynamicStyles.subtitle]}>
              At Mukoko, we believe everyone should have access to news insights.
              This data helps you understand what Zimbabwe is reading and talking about.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon source="rocket-launch" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.cardTitle, dynamicStyles.title]}>Explore More</Text>
            </View>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.primaryContainer }]}
              onPress={() => navigation.navigate('DiscoverFeed')}
              accessibilityRole="button"
              accessibilityLabel="Browse trending articles"
            >
              <Icon source="fire" size={24} color={paperTheme.colors.primary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onPrimaryContainer }]}>
                Trending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.secondaryContainer }]}
              onPress={() => navigation.navigate('Search')}
              accessibilityRole="button"
              accessibilityLabel="Search articles"
            >
              <Icon source="magnify" size={24} color={paperTheme.colors.secondary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onSecondaryContainer }]}>
                Search
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: paperTheme.colors.tertiaryContainer }]}
              onPress={() => navigation.navigate('Bytes')}
              accessibilityRole="button"
              accessibilityLabel="View NewsBytes"
            >
              <Icon source="lightning-bolt" size={24} color={paperTheme.colors.tertiary} />
              <Text style={[styles.actionLabel, { color: paperTheme.colors.onTertiaryContainer }]}>
                Bytes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: mukokoTheme.spacing.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  loadingDotsContainer: {
    marginTop: mukokoTheme.spacing.sm,
  },

  // Time Range
  timeRangeContainer: {
    marginBottom: mukokoTheme.spacing.md,
  },
  timeChip: {
    marginRight: mukokoTheme.spacing.sm,
  },

  // Header
  header: {
    marginBottom: mukokoTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.xs,
  },
  headerTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  aiBadge: {
    height: 28,
  },
  aiBadgeText: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.accent,
  },

  // Cards
  card: {
    borderRadius: mukokoTheme.roundness,
    padding: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
    borderWidth: 1,
  },
  aiCard: {
    borderWidth: 2,
    borderColor: mukokoTheme.colors.accent + '40',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mukokoTheme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
  },
  cardTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 16,
  },

  // Live Badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    marginBottom: mukokoTheme.spacing.md,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statValue: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    marginTop: mukokoTheme.spacing.xs,
  },
  expandedContent: {
    marginTop: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  expandedText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Engagement Grid
  engagementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementItem: {
    alignItems: 'center',
    flex: 1,
    gap: mukokoTheme.spacing.xs,
  },
  engagementValue: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
  },
  engagementLabel: {
    fontSize: 11,
  },

  // Top Articles
  topArticlesSection: {
    marginTop: mukokoTheme.spacing.md,
    paddingTop: mukokoTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  topArticlesTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.sm,
  },
  topArticleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness / 2,
    marginBottom: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  topArticleRank: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    width: 24,
  },
  topArticleInfo: {
    flex: 1,
  },
  topArticleTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  topArticleStats: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.md,
    marginTop: 4,
  },

  // Quality Grid
  qualityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualityItem: {
    alignItems: 'center',
    flex: 1,
  },
  qualityValue: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    marginBottom: mukokoTheme.spacing.xs,
  },
  qualityLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // AI Section
  aiSummaryBox: {
    flexDirection: 'row',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness / 2,
    marginBottom: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.sm,
  },
  aiIcon: {
    marginTop: 2,
  },
  aiSummaryText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  recommendationsList: {
    gap: mukokoTheme.spacing.sm,
    marginTop: mukokoTheme.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness / 2,
    gap: mukokoTheme.spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    minWidth: (SCREEN_WIDTH - mukokoTheme.spacing.md * 4) / 2 - mukokoTheme.spacing.sm,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: mukokoTheme.spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  categoryCount: {
    fontSize: 10,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },

  // Authors
  authorsList: {
    gap: mukokoTheme.spacing.sm,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness / 2,
    gap: mukokoTheme.spacing.sm,
    minHeight: 48,
  },
  authorRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorRankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  authorMeta: {
    fontSize: 11,
  },

  // Show More
  showMoreButton: {
    alignItems: 'center',
    paddingTop: mukokoTheme.spacing.md,
    marginTop: mukokoTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  showMoreText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Community Card
  communityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: mukokoTheme.spacing.md,
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    marginBottom: mukokoTheme.spacing.md,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  communityText: {
    fontSize: 12,
    lineHeight: 18,
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    gap: mukokoTheme.spacing.xs,
    minHeight: 80,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Bottom padding
  bottomPadding: {
    height: 100,
  },
});
