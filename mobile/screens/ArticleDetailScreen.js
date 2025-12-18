import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Text, IconButton, Button, Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import mukokoTheme, { paperThemeDark } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { articles as articlesAPI } from '../api/client';

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
  const paperTheme = usePaperTheme();
  const insets = useSafeAreaInsets();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    loadingText: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    errorCard: {
      backgroundColor: paperTheme.colors.surface,
      borderColor: paperTheme.colors.outline,
    },
    errorTitle: {
      color: paperTheme.colors.onSurface,
    },
    errorMessage: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    articleContainer: {
      backgroundColor: paperTheme.colors.surface,
    },
    contentParagraph: {
      color: paperTheme.colors.onSurface,
    },
    actionsDivider: {
      backgroundColor: paperTheme.colors.outline,
    },
    actionButton: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
    actionText: {
      color: paperTheme.colors.onSurface,
    },
    readOriginalButton: {
      backgroundColor: paperTheme.colors.primary,
    },
    readOriginalText: {
      color: paperTheme.colors.onPrimary,
    },
  };

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
        setIsLiked(articleData.isLiked || false);
        setIsSaved(articleData.isSaved || false);
        setLikesCount(articleData.likesCount || 0);

        navigation.setOptions({
          title: articleData.title,
        });

        await articlesAPI.trackView(articleData.id);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      console.error('[ArticleDetail] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    const wasLiked = isLiked;
    const originalCount = likesCount;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLiked(!wasLiked);
      setLikesCount(wasLiked ? originalCount - 1 : originalCount + 1);

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
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    const wasSaved = isSaved;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaved(!wasSaved);

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
      await Share.share({
        message: `${article.title}\n\nRead on Mukoko News: ${article.original_url}`,
        title: article.title,
        url: article.original_url,
      });
    } catch (error) {
      console.error('[ArticleDetail] Share error:', error);
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
      console.error('[ArticleDetail] Open URL error:', error);
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
      >
        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading article...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.centerContainer}>
            <View style={[styles.errorCard, dynamicStyles.errorCard]}>
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={64}
                color={paperTheme.colors.onSurfaceVariant}
              />
              <Text style={[styles.errorTitle, dynamicStyles.errorTitle]}>Article Not Found</Text>
              <Text style={[styles.errorMessage, dynamicStyles.errorMessage]}>{error}</Text>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.errorButton}
                buttonColor={paperTheme.colors.primary}
              >
                Go Back
              </Button>
            </View>
          </View>
        )}

        {/* Article Content */}
        {article && !loading && !error && (
          <>
            {/* Hero Section - Uses dark theme colors */}
            <LinearGradient
              colors={[paperThemeDark.colors.background, paperThemeDark.colors.surface]}
              style={[styles.heroSection, { paddingTop: insets.top + 16 }]}
            >
              {/* Back Button */}
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.heroBackButton, { backgroundColor: paperThemeDark.colors.glass }]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={paperThemeDark.colors.onSurface}
                />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                onPress={handleShare}
                style={[styles.heroShareButton, { backgroundColor: paperThemeDark.colors.glass }]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={22}
                  color={paperThemeDark.colors.onSurface}
                />
              </TouchableOpacity>

              {/* Category Badge */}
              {article.category && (
                <View style={styles.categoryContainer}>
                  <View style={[styles.categoryBadge, {
                    backgroundColor: paperThemeDark.colors.glass,
                    borderColor: paperThemeDark.colors.glassBorder,
                  }]}>
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={14}
                      color={paperThemeDark.colors.primary}
                    />
                    <Text style={[styles.categoryText, { color: paperThemeDark.colors.onSurface }]}>
                      {article.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Title */}
              <Text style={[styles.heroTitle, { color: paperThemeDark.colors.onSurface }]} accessibilityRole="header">
                {article.title}
              </Text>

              {/* Source and Date */}
              <View style={styles.heroMeta}>
                <Text style={[styles.heroSource, { color: paperThemeDark.colors.onSurface }]}>
                  {article.source || 'Unknown Source'}
                </Text>
                <Text style={[styles.heroDate, { color: paperThemeDark.colors.onSurfaceVariant }]}>
                  {formatDate(article.published_at)}
                </Text>
              </View>

              {/* Keywords/Tags */}
              {getKeywords().length > 0 && (
                <View style={styles.keywordsContainer}>
                  {getKeywords().map((keyword, index) => (
                    <View key={index} style={[styles.keywordTag, {
                      backgroundColor: paperThemeDark.colors.glass,
                      borderColor: paperThemeDark.colors.glassBorder,
                    }]}>
                      <Text style={[styles.keywordText, { color: paperThemeDark.colors.onSurfaceVariant }]}>
                        {keyword}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>

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
            <View style={[styles.articleBody, dynamicStyles.articleContainer]}>
              {/* Description */}
              {article.description && (
                <Text style={[styles.articleDescription, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {article.description}
                </Text>
              )}

              {/* Full Content */}
              {article.content && (
                <View style={styles.contentContainer}>
                  {article.content.split('\n\n').map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    return trimmed ? (
                      <Text key={index} style={[styles.contentParagraph, dynamicStyles.contentParagraph]}>
                        {trimmed}
                      </Text>
                    ) : null;
                  })}
                </View>
              )}

              <Divider style={[styles.actionsDivider, dynamicStyles.actionsDivider]} />

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {/* Like Button */}
                <TouchableOpacity
                  onPress={handleLike}
                  style={[styles.actionButton, dynamicStyles.actionButton]}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isLiked ? paperTheme.colors.error : paperTheme.colors.onSurface}
                  />
                  <Text style={[styles.actionText, dynamicStyles.actionText]}>
                    {likesCount > 0 ? likesCount : 'Like'}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.actionButton, dynamicStyles.actionButton]}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={22}
                    color={isSaved ? paperTheme.colors.tertiary : paperTheme.colors.onSurface}
                  />
                  <Text style={[styles.actionText, dynamicStyles.actionText]}>Save</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.actionButton, dynamicStyles.actionButton]}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={22}
                    color={paperTheme.colors.onSurface}
                  />
                  <Text style={[styles.actionText, dynamicStyles.actionText]}>Share</Text>
                </TouchableOpacity>

                {/* Read Original Button */}
                <TouchableOpacity
                  onPress={handleReadOriginal}
                  style={[styles.readOriginalButton, dynamicStyles.readOriginalButton]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.readOriginalText, dynamicStyles.readOriginalText]}>
                    Read Original
                  </Text>
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={18}
                    color={paperTheme.colors.onPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
    position: 'relative',
  },
  heroBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroShareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  categoryContainer: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: 'row',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginTop: 16,
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
  },
  readOriginalText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
