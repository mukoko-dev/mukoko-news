import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  Animated,
  Pressable,
  Text as RNText,
} from 'react-native';
import {
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tag,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import mukokoTheme from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { articles as articlesAPI } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import ShareModal from '../components/ShareModal';
import ArticleEngagementBar from '../components/ArticleEngagementBar';

/**
 * ArticleDetailScreen - Full article view with hero section
 *
 * Features:
 * - Dark hero section with category, title, source, date, keywords
 * - Full article content
 * - Like, save, share actions
 * - Read original link
 * - View tracking
 * - Full dark/light mode support
 */
export default function ArticleDetailScreen({ route, navigation }) {
  const { articleId, source, slug } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Scroll tracking for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(-mukokoTheme.scroll.headerHeight)).current; // Start hidden

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      color: theme.colors['on-surface-variant'],
    },
    errorCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
    },
    errorTitle: {
      color: theme.colors['on-surface'],
    },
    errorMessage: {
      color: theme.colors['on-surface-variant'],
    },
    contentParagraph: {
      color: theme.colors['on-surface'],
    },
    actionsDivider: {
      backgroundColor: theme.colors.outline,
    },
    actionButton: {
      backgroundColor: theme.colors['surface-variant'],
    },
    actionText: {
      color: theme.colors['on-surface'],
    },
    readOriginalButton: {
      backgroundColor: theme.colors.primary,
    },
    readOriginalText: {
      color: theme.colors['on-primary'],
    },
  };

  // Markdown styles for article content
  const markdownStyles = useMemo(() => ({
    body: {
      color: theme.colors['on-surface'],
      fontSize: 16,
      lineHeight: 26,
      fontFamily: mukokoTheme.fonts.regular.fontFamily,
    },
    heading1: {
      color: theme.colors['on-surface'],
      fontSize: 24,
      fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
      marginTop: 24,
      marginBottom: 12,
      lineHeight: 32,
    },
    heading2: {
      color: theme.colors['on-surface'],
      fontSize: 20,
      fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
      marginTop: 20,
      marginBottom: 10,
      lineHeight: 28,
    },
    heading3: {
      color: theme.colors['on-surface'],
      fontSize: 18,
      fontFamily: mukokoTheme.fonts.bold.fontFamily,
      marginTop: 16,
      marginBottom: 8,
      lineHeight: 26,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 16,
    },
    strong: {
      fontFamily: mukokoTheme.fonts.bold.fontFamily,
    },
    em: {
      fontStyle: 'italic',
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.colors['surface-variant'],
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 16,
      paddingVertical: 8,
      marginVertical: 12,
      borderRadius: 4,
    },
    code_inline: {
      backgroundColor: theme.colors['surface-variant'],
      color: theme.colors['on-surface'],
      fontFamily: 'monospace',
      fontSize: 14,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: theme.colors['surface-variant'],
      color: theme.colors['on-surface'],
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
    },
    fence: {
      backgroundColor: theme.colors['surface-variant'],
      color: theme.colors['on-surface'],
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
    },
    bullet_list_icon: {
      color: theme.colors.primary,
      marginRight: 8,
    },
    ordered_list_icon: {
      color: theme.colors.primary,
      marginRight: 8,
    },
    hr: {
      backgroundColor: theme.colors.outline,
      height: 1,
      marginVertical: 16,
    },
    image: {
      width: '100%',
      borderRadius: 8,
      marginVertical: 12,
    },
    table: {
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: 8,
      marginVertical: 12,
    },
    thead: {
      backgroundColor: theme.colors['surface-variant'],
    },
    th: {
      color: theme.colors['on-surface'],
      fontFamily: mukokoTheme.fonts.bold.fontFamily,
      padding: 8,
    },
    td: {
      color: theme.colors['on-surface'],
      padding: 8,
      borderTopColor: theme.colors.outline,
      borderTopWidth: 1,
    },
  }), [theme.colors]);

  useEffect(() => {
    loadArticle();
  }, [articleId, source, slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (source && slug) {
        result = await articlesAPI.getBySourceSlug(source, slug);
      } else if (articleId) {
        result = await articlesAPI.getById(articleId);
      } else {
        throw new Error('No article identifier provided');
      }

      if (result.error) {
        setError(result.error);
        setArticle(null);
      } else if (result.data?.article) {
        const articleData = result.data.article;
        setArticle(articleData);

        // Load liked/saved state from local storage for non-authenticated users
        if (!isAuthenticated) {
          const likedArticles = JSON.parse(await AsyncStorage.getItem('likedArticles') || '[]');
          const savedArticles = JSON.parse(await AsyncStorage.getItem('savedArticles') || '[]');
          setIsLiked(likedArticles.includes(articleData.id));
          setIsSaved(savedArticles.includes(articleData.id));
        } else {
          setIsLiked(articleData.isLiked || false);
          setIsSaved(articleData.isSaved || false);
        }

        setLikesCount(articleData.likesCount || 0);

        navigation.setOptions({
          title: articleData.title,
        });

        await articlesAPI.trackView(articleData.id);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[ArticleDetail] Load error:', err);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    // Allow likes without auth - track engagement for all users
    const wasLiked = isLiked;
    const originalCount = likesCount;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLiked(!wasLiked);
      setLikesCount(wasLiked ? originalCount - 1 : originalCount + 1);

      // Store local state in AsyncStorage for non-authenticated users
      if (!isAuthenticated) {
        const likedArticles = JSON.parse(await AsyncStorage.getItem('likedArticles') || '[]');
        if (wasLiked) {
          const filtered = likedArticles.filter(id => id !== article.id);
          await AsyncStorage.setItem('likedArticles', JSON.stringify(filtered));
        } else {
          likedArticles.push(article.id);
          await AsyncStorage.setItem('likedArticles', JSON.stringify(likedArticles));
        }
      }

      const result = await articlesAPI.toggleLike(article.id);
      if (result.error) {
        setIsLiked(wasLiked);
        setLikesCount(originalCount);
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikesCount(originalCount);
    }
  };

  const handleSave = async () => {
    // Allow bookmarks without auth - store locally
    const wasSaved = isSaved;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaved(!wasSaved);

      // Store local state in AsyncStorage for non-authenticated users
      if (!isAuthenticated) {
        const savedArticles = JSON.parse(await AsyncStorage.getItem('savedArticles') || '[]');
        if (wasSaved) {
          const filtered = savedArticles.filter(id => id !== article.id);
          await AsyncStorage.setItem('savedArticles', JSON.stringify(filtered));
        } else {
          savedArticles.push(article.id);
          await AsyncStorage.setItem('savedArticles', JSON.stringify(savedArticles));
        }
        return; // Don't call API for non-authenticated users
      }

      const result = await articlesAPI.toggleBookmark(article.id);
      if (result.error) {
        setIsSaved(wasSaved);
      }
    } catch (error) {
      setIsSaved(wasSaved);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShareModalVisible(true);
    } catch (error) {
      if (__DEV__) {
        console.error('[ArticleDetail] Share error:', error);
      }
    }
  };

  const handleReadOriginal = async () => {
    if (!article?.original_url) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(article.original_url);
      if (supported) {
        await Linking.openURL(article.original_url);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[ArticleDetail] Open URL error:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  // Handle scroll to show/hide header
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';

        // Only show header when scrolling up and past threshold
        // Hide when scrolling down or at top of page
        if (scrollDirection === 'up' && currentScrollY > mukokoTheme.scroll.headerThreshold) {
          // Show header
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: mukokoTheme.animation.medium,
            useNativeDriver: true,
          }).start();
        } else if (scrollDirection === 'down' || currentScrollY <= mukokoTheme.scroll.headerThreshold) {
          // Hide header
          Animated.timing(headerTranslateY, {
            toValue: -mukokoTheme.scroll.headerHeight,
            duration: mukokoTheme.animation.medium,
            useNativeDriver: true,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      },
    }
  );

  // Extract keywords/tags from article
  const getKeywords = () => {
    const keywords = [];
    if (article?.category) {
      keywords.push(article.category);
    }
    if (article?.tags && Array.isArray(article.tags)) {
      keywords.push(...article.tags.slice(0, 4));
    }
    // Extract from title if no tags
    if (keywords.length < 2 && article?.title) {
      const titleLower = article.title.toLowerCase();
      const commonKeywords = ['zimbabwe', 'harare', 'bulawayo', 'politics', 'economy', 'sports', 'business'];
      commonKeywords.forEach(kw => {
        if (titleLower.includes(kw) && !keywords.includes(kw)) {
          keywords.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      });
    }
    return keywords.slice(0, 5);
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Loading State */}
        {loading && (
          <View className="flex-1 justify-center items-center py-xl gap-md">
            <Loader2 size={48} color={theme.colors.primary} className="animate-spin" />
            <RNText className="font-sans-medium text-body-medium" style={{ color: theme.colors['on-surface']Variant }}>
              Loading article...
            </RNText>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="flex-1 justify-center items-center py-xl">
            <View className="items-center gap-md px-xl py-lg rounded-card border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }}>
              <AlertCircle
                size={64}
                color={theme.colors['on-surface']Variant}
              />
              <RNText className="font-serif-bold text-headline-small text-center" style={{ color: theme.colors['on-surface'] }}>
                Article Not Found
              </RNText>
              <RNText className="font-sans text-body-medium text-center mb-md" style={{ color: theme.colors['on-surface']Variant }}>
                {error}
              </RNText>
              <Pressable
                className="py-md px-xl rounded-button"
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: theme.colors.primary }}
              >
                <RNText className="font-sans-bold text-label-large" style={{ color: theme.colors['on-primary'] }}>
                  Go Back
                </RNText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Article Content */}
        {article && !loading && !error && (
          <>
            {/* Hero Section */}
            <View
              style={[
                styles.heroSection,
                {
                  paddingTop: insets.top + 16,
                  backgroundColor: theme.colors.primary,
                }
              ]}
            >
              {/* Back Button */}
              <Pressable
                onPress={handleBack}
                style={[
                  styles.heroBackButton,
                  {
                    backgroundColor: `${theme.colors['on-primary']}33`,
                    top: insets.top + 16,
                  }
                ]}
              >
                <ChevronLeft
                  size={24}
                  color={theme.colors['on-primary']}
                />
              </Pressable>

              {/* Share Button */}
              <Pressable
                onPress={handleShare}
                style={[
                  styles.heroShareButton,
                  {
                    backgroundColor: `${theme.colors['on-primary']}33`,
                    top: insets.top + 16,
                  }
                ]}
              >
                <Share2
                  size={22}
                  color={theme.colors['on-primary']}
                />
              </Pressable>

              {/* Category Badge */}
              {article.category && (
                <View style={styles.categoryContainer}>
                  <View style={[styles.categoryBadge, {
                    backgroundColor: `${theme.colors['on-primary']}33`,
                    borderColor: `${theme.colors['on-primary']}4D`,
                  }]}>
                    <Tag
                      size={14}
                      color={theme.colors['on-primary']}
                    />
                    <RNText style={[styles.categoryText, { color: theme.colors['on-primary'] }]}>
                      {article.category.toUpperCase()}
                    </RNText>
                  </View>
                </View>
              )}

              {/* Title */}
              <RNText style={[styles.heroTitle, { color: theme.colors['on-primary'] }]} accessibilityRole="header">
                {article.title}
              </RNText>

              {/* Author Profile */}
              {article.author && (
                <View style={styles.authorContainer}>
                  <View style={[styles.authorAvatar, { backgroundColor: `${theme.colors['on-primary']}33` }]}>
                    <User
                      size={20}
                      color={theme.colors['on-primary']}
                    />
                  </View>
                  <RNText style={[styles.authorName, { color: theme.colors['on-primary'] }]}>
                    {article.author}
                  </RNText>
                </View>
              )}

              {/* Source and Date */}
              <View style={styles.heroMeta}>
                <RNText style={[styles.heroSource, { color: theme.colors['on-primary'] }]}>
                  {article.source || 'Unknown Source'}
                </RNText>
                <RNText style={[styles.heroDate, { color: `${theme.colors['on-primary']}B3` }]}>
                  {formatDate(article.published_at)}
                </RNText>
              </View>

              {/* Keywords/Tags */}
              {getKeywords().length > 0 && (
                <View style={styles.keywordsContainer}>
                  {getKeywords().map((keyword, index) => (
                    <View key={index} style={[styles.keywordTag, {
                      backgroundColor: `${theme.colors['on-primary']}33`,
                      borderColor: `${theme.colors['on-primary']}4D`,
                    }]}>
                      <RNText style={[styles.keywordText, { color: `${theme.colors['on-primary']}E6` }]}>
                        {keyword}
                      </RNText>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Article Image (if exists) */}
            {article.image_url && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: article.image_url }}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Article Body */}
            <View style={styles.articleBody}>
              {/* Description */}
              {article.description && (
                <RNText style={[styles.articleDescription, { color: theme.colors['on-surface']Variant }]}>
                  {article.description}
                </RNText>
              )}

              {/* Full Content - Markdown Rendering */}
              {article.content && (
                <View style={styles.contentContainer}>
                  <Markdown
                    style={markdownStyles}
                    onLinkPress={(url) => {
                      Linking.openURL(url);
                      return false;
                    }}
                  >
                    {article.content}
                  </Markdown>
                </View>
              )}

              <View style={[styles.actionsDivider, dynamicStyles.actionsDivider]} />

              {/* Action Buttons - Glass Morphism Effect */}
              <View style={styles.actionsContainer}>
                <ArticleEngagementBar
                  isLiked={isLiked}
                  isSaved={isSaved}
                  likesCount={likesCount}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShare={handleShare}
                  layout="horizontal"
                  variant={isDark ? 'dark' : 'light'}
                />

                {/* Read Original Button */}
                <TouchableOpacity
                  onPress={handleReadOriginal}
                  style={[styles.readOriginalButton, dynamicStyles.readOriginalButton]}
                  activeOpacity={0.7}
                >
                  <RNText style={[styles.readOriginalText, dynamicStyles.readOriginalText]}>
                    Read Original
                  </RNText>
                  <ExternalLink
                    size={18}
                    color={theme.colors['on-primary']}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Header - Shows when scrolling up */}
      {article && !loading && !error && (
        <Animated.View
          style={[
            styles.floatingHeader,
            {
              backgroundColor: theme.colors.primary,
              transform: [{ translateY: headerTranslateY }],
              paddingTop: insets.top + mukokoTheme.spacing.sm,
            },
          ]}
        >
          <View style={styles.floatingHeaderContent}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBack}
              style={[
                styles.floatingButton,
                { backgroundColor: `${theme.colors['on-primary']}33` },
              ]}
              activeOpacity={0.7}
            >
              <ChevronLeft
                size={24}
                color={theme.colors['on-primary']}
              />
            </TouchableOpacity>

            {/* Article Title (truncated) */}
            <RNText
              style={[styles.floatingTitle, { color: theme.colors['on-primary'] }]}
              numberOfLines={1}
            >
              {article.title}
            </RNText>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShare}
              style={[
                styles.floatingButton,
                { backgroundColor: `${theme.colors['on-primary']}33` },
              ]}
              activeOpacity={0.7}
            >
              <Share2
                size={22}
                color={theme.colors['on-primary']}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ShareModal
        visible={shareModalVisible}
        onDismiss={() => setShareModalVisible(false)}
        article={article}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: mukokoTheme.spacing.xl,
    minHeight: 400,
  },
  loadingText: {
    marginTop: mukokoTheme.spacing.md,
    fontSize: 14,
  },
  errorCard: {
    borderRadius: 16,
    padding: mukokoTheme.spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    borderWidth: 1,
    gap: mukokoTheme.spacing.sm,
  },
  errorTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    marginTop: mukokoTheme.spacing.md,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  errorButton: {
    borderRadius: 24,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: mukokoTheme.spacing.lg + mukokoTheme.spacing.xs,
    paddingBottom: mukokoTheme.spacing.xxl,
    position: 'relative',
  },
  heroBackButton: {
    position: 'absolute',
    left: mukokoTheme.spacing.lg,
    width: mukokoTheme.touchTargets.minimum,
    height: mukokoTheme.touchTargets.minimum,
    borderRadius: mukokoTheme.touchTargets.minimum / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroShareButton: {
    position: 'absolute',
    right: mukokoTheme.spacing.lg,
    width: mukokoTheme.touchTargets.minimum,
    height: mukokoTheme.touchTargets.minimum,
    borderRadius: mukokoTheme.touchTargets.minimum / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  categoryContainer: {
    marginTop: mukokoTheme.spacing.xxl + mukokoTheme.spacing.xl + mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.lg + mukokoTheme.spacing.xs,
    flexDirection: 'row',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs + 2,
    borderWidth: 1,
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs + 2,
    borderRadius: mukokoTheme.spacing.lg + mukokoTheme.spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 28,
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  heroMeta: {
    marginBottom: 20,
  },
  heroSource: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  keywordTag: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Image
  imageContainer: {
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  articleImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },

  // Article Body
  articleBody: {
    padding: 20,
  },
  articleDescription: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  contentContainer: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  contentParagraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: mukokoTheme.spacing.md,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  actionsDivider: {
    marginVertical: mukokoTheme.spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  readOriginalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 'auto',
    minHeight: 44,
  },
  readOriginalText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Floating Header (appears on scroll up)
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: mukokoTheme.spacing.md,
    zIndex: 100,
    ...mukokoTheme.shadows.medium,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.md,
  },
  floatingButton: {
    width: mukokoTheme.touchTargets.compact,
    height: mukokoTheme.touchTargets.compact,
    borderRadius: mukokoTheme.touchTargets.compact / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    letterSpacing: -0.2,
  },
});
