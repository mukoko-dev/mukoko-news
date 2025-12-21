/**
 * NewsBytesScreen - TikTok-style vertical scrolling news
 * Full-screen immersive news experience with responsive positioning
 * Supports theme-aware accent colors while maintaining dark immersive UI
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Share,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { newsBytes, articles as articlesAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLayout, CONTENT_WIDTHS } from '../components/layout';
import mukokoTheme from '../theme';
import SourceIcon from '../components/SourceIcon';

export default function NewsBytesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const layout = useLayout();
  const [loading, setLoading] = useState(true);
  const [bytes, setBytes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bytesState, setBytesState] = useState({});
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);

  // Calculate responsive values based on screen size and safe areas
  const SCREEN_HEIGHT = screenDimensions.height;

  // On tablet/desktop, constrain width to maintain mobile phone-like experience
  // This creates the Instagram-style centered content look
  const isResponsiveLayout = layout.isTablet || layout.isDesktop;
  const SCREEN_WIDTH = isResponsiveLayout
    ? Math.min(screenDimensions.width, CONTENT_WIDTHS.maxWidth)
    : screenDimensions.width;

  // Content positioning - responsive to screen size and safe areas
  // On desktop/tablet, no tab bar so reduce bottom offset
  const CONTENT_BOTTOM_OFFSET = isResponsiveLayout
    ? Math.max(insets.bottom + 40, 60)
    : Math.max(insets.bottom + 100, 140);
  const ACTIONS_RIGHT_OFFSET = mukokoTheme.spacing.md;
  const PROGRESS_TOP_OFFSET = insets.top + mukokoTheme.spacing.lg;

  // Theme-aware colors for immersive dark UI
  const colors = {
    // Background is always dark for immersive experience
    background: '#000000',
    // Text colors
    white: '#FFFFFF',
    whiteTranslucent: 'rgba(255, 255, 255, 0.8)',
    whiteFaded: 'rgba(255, 255, 255, 0.6)',
    // Use theme accent color for highlights
    accent: theme.colors.tertiary || theme.colors.cobalt || '#d4634a',
    // Like color from theme
    liked: theme.colors.error || '#EF4444',
    // Saved color from theme
    saved: theme.colors.tertiary || '#d4634a',
    // Glass effects
    glassBackground: 'rgba(0, 0, 0, 0.3)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
  };

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
      setError(null);
      // Request more articles since we'll filter out those without images
      const { data, error: apiError } = await newsBytes.getFeed({ limit: 50 });

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
    } catch (err) {
      if (__DEV__) {
        console.error('[NewsBytes] Load error:', err);
      }
      setError('Failed to load NewsBytes. Please try again.');
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

    // Capture original values for rollback
    const originalState = bytesState[byte.id] || {};
    const wasLiked = originalState.isLiked || false;
    const originalCount = originalState.likesCount || 0;

    // Optimistic update
    setBytesState(prev => ({
      ...prev,
      [byte.id]: {
        ...prev[byte.id],
        isLiked: !wasLiked,
        likesCount: wasLiked ? originalCount - 1 : originalCount + 1,
      },
    }));

    try {
      const result = await articlesAPI.toggleLike(byte.id);
      if (result.error) {
        // Revert to original values
        setBytesState(prev => ({
          ...prev,
          [byte.id]: {
            ...prev[byte.id],
            isLiked: wasLiked,
            likesCount: originalCount,
          },
        }));
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[NewsBytes] Like error:', error);
      }
      // Revert to original values on error
      setBytesState(prev => ({
        ...prev,
        [byte.id]: {
          ...prev[byte.id],
          isLiked: wasLiked,
          likesCount: originalCount,
        },
      }));
    }
  };

  const handleSave = async (byte) => {
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Capture original value for rollback
    const originalState = bytesState[byte.id] || {};
    const wasSaved = originalState.isSaved || false;

    // Optimistic update
    setBytesState(prev => ({
      ...prev,
      [byte.id]: {
        ...prev[byte.id],
        isSaved: !wasSaved,
      },
    }));

    try {
      const result = await articlesAPI.toggleBookmark(byte.id);
      if (result.error) {
        // Revert to original value
        setBytesState(prev => ({
          ...prev,
          [byte.id]: {
            ...prev[byte.id],
            isSaved: wasSaved,
          },
        }));
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[NewsBytes] Save error:', error);
      }
      // Revert to original value on error
      setBytesState(prev => ({
        ...prev,
        [byte.id]: {
          ...prev[byte.id],
          isSaved: wasSaved,
        },
      }));
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
      if (__DEV__) {
        console.error('[NewsBytes] Share error:', error);
      }
    }
  };

  const handleViewArticle = (byte) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        className="relative"
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: colors.background,
        }}
        activeOpacity={1}
        onPress={() => handleViewArticle(item)}
      >
        {/* Background Image - Only articles with images are shown */}
        <Image
          source={{ uri: item.image_url }}
          className="absolute inset-0 bg-[#1a1a1a]"
          resizeMode="cover"
        />

        {/* Gradient Overlay - Full height for better readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.4, 1]}
          className="absolute inset-0"
        />

        {/* Content - Positioned from bottom with responsive offset */}
        <View
          className="absolute left-md right-md gap-sm"
          style={{
            bottom: CONTENT_BOTTOM_OFFSET,
            paddingRight: 72, // Space for action buttons
          }}
        >
          {/* Category Badge */}
          {item.category && (
            <View
              className="self-start px-sm py-[2px] rounded-md"
              style={{ backgroundColor: colors.accent }}
            >
              <Text
                className="font-sans-bold text-body-small uppercase"
                style={{ color: colors.background, letterSpacing: 0.5 }}
              >
                {item.category}
              </Text>
            </View>
          )}

          {/* Title - Large, readable */}
          <Text
            className="font-serif-bold text-headline-large leading-8"
            style={{
              color: colors.white,
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
              letterSpacing: -0.3,
            }}
            numberOfLines={4}
          >
            {item.title}
          </Text>

          {/* Description - Two lines max */}
          {item.description && (
            <Text
              className="font-sans text-body-medium leading-5"
              style={{
                color: colors.whiteTranslucent,
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              numberOfLines={2}
            >
              {item.description.slice(0, 120)}...
            </Text>
          )}

          {/* Source & Date */}
          <View className="flex-row items-center gap-xs">
            <SourceIcon source={item.source} size={18} showBorder={false} />
            <Text
              className="font-sans-bold text-label-large"
              style={{
                color: colors.accent,
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {item.source}
            </Text>
            <Text className="opacity-60" style={{ color: colors.whiteFaded }}>
              •
            </Text>
            <Text
              className="font-sans text-label-large"
              style={{
                color: colors.whiteTranslucent,
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {formatDate(item.published_at)}
            </Text>
          </View>

          {/* Read More Button */}
          <Pressable
            className="self-start px-md py-sm rounded-button border mt-xs"
            style={{
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            }}
            onPress={() => handleViewArticle(item)}
          >
            <Text className="font-sans-medium text-label-large" style={{ color: colors.white }}>
              Read Full Article
            </Text>
          </Pressable>
        </View>

        {/* Right Side Actions - Vertically centered */}
        <View
          className="absolute items-center gap-md"
          style={{
            right: ACTIONS_RIGHT_OFFSET,
            bottom: CONTENT_BOTTOM_OFFSET + 40,
          }}
        >
          <ActionButton
            Icon={Heart}
            fill={byteState.isLiked}
            color={byteState.isLiked ? colors.liked : colors.white}
            label={byteState.likesCount || 0}
            onPress={() => handleLike(item)}
            glassColor={colors.glassBackground}
            textColor={colors.white}
          />

          <ActionButton
            Icon={MessageCircle}
            color={colors.white}
            label={item.commentsCount || 0}
            onPress={() => handleViewArticle(item)}
            glassColor={colors.glassBackground}
            textColor={colors.white}
          />

          <ActionButton
            Icon={Share2}
            color={colors.white}
            label="Share"
            onPress={() => handleShare(item)}
            glassColor={colors.glassBackground}
            textColor={colors.white}
          />

          <ActionButton
            Icon={Bookmark}
            fill={byteState.isSaved}
            color={byteState.isSaved ? colors.saved : colors.white}
            onPress={() => handleSave(item)}
            glassColor={colors.glassBackground}
            textColor={colors.white}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 justify-center items-center gap-md">
          <Loader2 size={48} color={colors.accent} className="animate-spin" />
          <Text className="font-sans-medium text-body-medium" style={{ color: colors.white }}>
            Loading NewsBytes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View className="flex-1 justify-center items-center gap-md px-xl">
          <AlertCircle size={64} color={colors.accent} />
          <Text
            className="font-serif-bold text-headline-small text-center mb-sm"
            style={{ color: colors.white }}
          >
            Something went wrong
          </Text>
          <Text
            className="font-sans text-body-medium text-center mb-lg"
            style={{ color: colors.whiteTranslucent }}
          >
            {error}
          </Text>
          <Pressable
            className="flex-row items-center justify-center gap-sm py-sm px-lg rounded-button min-w-[120px]"
            style={{ backgroundColor: colors.accent }}
            onPress={loadNewsBytes}
            accessibilityRole="button"
            accessibilityLabel="Retry loading NewsBytes"
          >
            <RefreshCw size={16} color={mukokoTheme.colors.onPrimary} />
            <Text className="font-sans-medium text-body-medium" style={{ color: mukokoTheme.colors.onPrimary }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Progress Indicator - Responsive top position */}
      <View
        className="absolute left-0 right-0 flex-row justify-center items-center gap-xs z-[100]"
        style={{ top: PROGRESS_TOP_OFFSET }}
      >
        {bytes.slice(0, 10).map((_, index) => (
          <View
            key={index}
            className="rounded-full"
            style={{
              width: index === currentIndex ? mukokoTheme.layout.progressDotActive : mukokoTheme.layout.progressDotSize,
              height: mukokoTheme.layout.progressDotSize,
              backgroundColor: index === currentIndex ? colors.accent : colors.whiteFaded,
            }}
          />
        ))}
        {bytes.length > 10 && (
          <Text
            className="font-sans text-label-small ml-xs"
            style={{ color: colors.white, opacity: 0.8 }}
          >
            +{bytes.length - 10}
          </Text>
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
          <View
            className="flex-1 justify-center items-center px-xl gap-md"
            style={{ height: SCREEN_HEIGHT, backgroundColor: colors.background }}
          >
            <Text className="text-[64px] opacity-50">📰</Text>
            <Text
              className="font-serif-bold text-headline-medium text-center"
              style={{ color: colors.white }}
              accessibilityRole="header"
            >
              No NewsBytes available
            </Text>
            <Text
              className="font-sans text-body-medium text-center"
              style={{ color: colors.whiteTranslucent }}
            >
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
function ActionButton({ Icon, fill, color, label, onPress, glassColor, textColor }) {
  return (
    <Pressable className="items-center gap-xs" onPress={onPress}>
      <View
        className="w-touch h-touch rounded-full items-center justify-center"
        style={{ backgroundColor: glassColor }}
      >
        <Icon size={28} color={color} fill={fill ? color : 'transparent'} />
      </View>
      {label !== undefined && (
        <Text
          className="font-sans-medium text-body-small"
          style={{
            color: textColor,
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// All styles removed - using NativeWind classes instead
// Note: textShadow styles kept inline as NativeWind doesn't support text shadows
