/**
 * NewsBytesScreen - TikTok-style vertical scrolling news
 * Full-screen immersive news experience with responsive positioning
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import {
  Text,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { newsBytes, articles as articlesAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import ZimbabweFlagStrip from '../components/ZimbabweFlagStrip';

export default function NewsBytesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bytes, setBytes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bytesState, setBytesState] = useState({});
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const flatListRef = useRef(null);

  // Calculate responsive values based on screen size and safe areas
  const SCREEN_HEIGHT = screenDimensions.height;
  const SCREEN_WIDTH = screenDimensions.width;

  // Content positioning - responsive to screen size and safe areas
  const CONTENT_BOTTOM_OFFSET = Math.max(insets.bottom + 100, 140); // Tab bar + padding
  const ACTIONS_RIGHT_OFFSET = mukokoTheme.spacing.md;
  const PROGRESS_TOP_OFFSET = insets.top + mukokoTheme.spacing.lg;

  useEffect(() => {
    loadNewsBytes();
  }, []);

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const loadNewsBytes = async () => {
    try {
      setLoading(true);
      // Request more articles since we'll filter out those without images
      const { data, error } = await newsBytes.getFeed({ limit: 50 });

      if (data?.articles) {
        // Transform and filter - ONLY include articles with valid images
        const transformedBytes = data.articles
          .filter((article) => {
            const imageUrl = article.image_url || article.imageUrl;
            // Only include articles with valid image URLs
            return imageUrl && imageUrl.trim().length > 0 && imageUrl.startsWith('http');
          })
          .map((article) => ({
            id: article.id,
            title: article.title,
            description: article.description || '',
            source: article.source,
            source_id: article.source_id,
            slug: article.slug,
            category: article.category,
            image_url: article.image_url || article.imageUrl,
            published_at: article.published_at || article.pubDate,
            likesCount: article.likesCount || 0,
            commentsCount: article.commentsCount || 0,
            isLiked: article.isLiked || false,
            isSaved: article.isSaved || false,
          }))
          .slice(0, 20); // Limit to 20 after filtering

        const initialState = {};
        transformedBytes.forEach(byte => {
          initialState[byte.id] = {
            isLiked: byte.isLiked,
            isSaved: byte.isSaved,
            likesCount: byte.likesCount,
          };
        });
        setBytesState(initialState);
        setBytes(transformedBytes);
      }
    } catch (error) {
      console.error('[NewsBytes] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (byte) => {
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setBytesState(prev => ({
      ...prev,
      [byte.id]: {
        ...prev[byte.id],
        isLiked: !prev[byte.id]?.isLiked,
        likesCount: prev[byte.id]?.isLiked
          ? (prev[byte.id]?.likesCount || 0) - 1
          : (prev[byte.id]?.likesCount || 0) + 1,
      },
    }));

    try {
      const result = await articlesAPI.like(byte.id);
      if (result.error) {
        setBytesState(prev => ({
          ...prev,
          [byte.id]: {
            ...prev[byte.id],
            isLiked: prev[byte.id]?.isLiked,
            likesCount: prev[byte.id]?.likesCount,
          },
        }));
      }
    } catch (error) {
      console.error('[NewsBytes] Like error:', error);
    }
  };

  const handleSave = async (byte) => {
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setBytesState(prev => ({
      ...prev,
      [byte.id]: {
        ...prev[byte.id],
        isSaved: !prev[byte.id]?.isSaved,
      },
    }));

    try {
      const result = await articlesAPI.save(byte.id);
      if (result.error) {
        setBytesState(prev => ({
          ...prev,
          [byte.id]: {
            ...prev[byte.id],
            isSaved: !prev[byte.id]?.isSaved,
          },
        }));
      }
    } catch (error) {
      console.error('[NewsBytes] Save error:', error);
    }
  };

  const handleShare = async (byte) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await Share.share({
        message: `${byte.title}\n\nRead on Mukoko News`,
        title: byte.title,
      });
    } catch (error) {
      console.error('[NewsBytes] Share error:', error);
    }
  };

  const handleViewArticle = (byte) => {
    navigation.navigate('ArticleDetail', {
      articleId: byte.id,
      source: byte.source_id || byte.source,
      slug: byte.slug,
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const renderByte = ({ item, index }) => {
    const byteState = bytesState[item.id] || {};

    return (
      <TouchableOpacity
        style={[styles.byteContainer, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
        activeOpacity={1}
        onPress={() => handleViewArticle(item)}
      >
        {/* Background Image - Only articles with images are shown */}
        <Image
          source={{ uri: item.image_url }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay - Full height for better readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.4, 1]}
          style={styles.gradientOverlay}
        />

        {/* Content - Positioned from bottom with responsive offset */}
        <View style={[
          styles.contentContainer,
          {
            bottom: CONTENT_BOTTOM_OFFSET,
            paddingRight: 72, // Space for action buttons
          }
        ]}>
          {/* Category Badge */}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}

          {/* Title - Large, readable */}
          <Text style={styles.byteTitle} numberOfLines={4}>
            {item.title}
          </Text>

          {/* Description - Two lines max */}
          {item.description && (
            <Text style={styles.byteDescription} numberOfLines={2}>
              {item.description.slice(0, 120)}...
            </Text>
          )}

          {/* Source & Date */}
          <View style={styles.metaContainer}>
            <Text style={styles.sourceText}>{item.source}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.dateText}>{formatDate(item.published_at)}</Text>
          </View>

          {/* Read More Button */}
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => handleViewArticle(item)}
          >
            <Text style={styles.readMoreText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side Actions - Vertically centered */}
        <View style={[
          styles.actionsContainer,
          {
            right: ACTIONS_RIGHT_OFFSET,
            bottom: CONTENT_BOTTOM_OFFSET + 40,
          }
        ]}>
          <ActionButton
            icon={byteState.isLiked ? "heart" : "heart-outline"}
            color={byteState.isLiked ? mukokoTheme.colors.zwRed : mukokoTheme.colors.zwWhite}
            label={byteState.likesCount || 0}
            onPress={() => handleLike(item)}
          />

          <ActionButton
            icon="comment-outline"
            color={mukokoTheme.colors.zwWhite}
            label={item.commentsCount || 0}
            onPress={() => handleViewArticle(item)}
          />

          <ActionButton
            icon="share-variant-outline"
            color={mukokoTheme.colors.zwWhite}
            label="Share"
            onPress={() => handleShare(item)}
          />

          <ActionButton
            icon={byteState.isSaved ? "bookmark" : "bookmark-outline"}
            color={byteState.isSaved ? mukokoTheme.colors.accent : mukokoTheme.colors.zwWhite}
            onPress={() => handleSave(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={mukokoTheme.colors.zwWhite} />
          <Text style={styles.loadingText}>Loading NewsBytes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Zimbabwe Flag Strip */}
      <ZimbabweFlagStrip />

      {/* Progress Indicator - Responsive top position */}
      <View style={[styles.progressContainer, { top: PROGRESS_TOP_OFFSET }]}>
        {bytes.slice(0, 10).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
        {bytes.length > 10 && (
          <Text style={styles.progressMore}>+{bytes.length - 10}</Text>
        )}
      </View>

      {/* Vertical Scrolling Bytes */}
      <FlatList
        ref={flatListRef}
        data={bytes}
        renderItem={renderByte}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { height: SCREEN_HEIGHT }]}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={styles.emptyTitle}>No NewsBytes available</Text>
            <Text style={styles.emptyDescription}>
              Pull down to refresh or check back later
            </Text>
          </View>
        }
      />
    </View>
  );
}

/**
 * ActionButton Component - Reusable action button for the side panel
 */
function ActionButton({ icon, color, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <IconButton
          icon={icon}
          iconColor={color}
          size={28}
          style={styles.actionIcon}
        />
      </View>
      {label !== undefined && (
        <Text style={styles.actionText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.zwBlack,
  },
  byteContainer: {
    position: 'relative',
    backgroundColor: mukokoTheme.colors.zwBlack,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Content positioning
  contentContainer: {
    position: 'absolute',
    left: mukokoTheme.spacing.md,
    right: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: mukokoTheme.colors.accent,
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs - 2,
    borderRadius: mukokoTheme.roundness / 2,
  },
  categoryText: {
    color: mukokoTheme.colors.zwBlack,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  byteTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    color: mukokoTheme.colors.zwWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.3,
  },
  byteDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: mukokoTheme.colors.zwWhite,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
  },
  sourceText: {
    color: mukokoTheme.colors.accent,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dotSeparator: {
    color: mukokoTheme.colors.zwWhite,
    opacity: 0.6,
  },
  dateText: {
    color: mukokoTheme.colors.zwWhite,
    opacity: 0.8,
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: mukokoTheme.spacing.xs,
  },
  readMoreText: {
    color: mukokoTheme.colors.zwWhite,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontSize: 13,
  },

  // Actions panel
  actionsContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    color: mukokoTheme.colors.zwWhite,
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Progress indicator
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
    zIndex: 100,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    backgroundColor: mukokoTheme.colors.accent,
    width: 18,
  },
  progressMore: {
    color: mukokoTheme.colors.zwWhite,
    fontSize: 10,
    opacity: 0.7,
    marginLeft: mukokoTheme.spacing.xs,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
  },
  loadingText: {
    color: mukokoTheme.colors.zwWhite,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: mukokoTheme.spacing.xl,
    gap: mukokoTheme.spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 22,
    color: mukokoTheme.colors.zwWhite,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: mukokoTheme.colors.zwWhite,
    opacity: 0.7,
    textAlign: 'center',
  },
});
