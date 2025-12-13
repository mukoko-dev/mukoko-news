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
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { articles as articlesAPI } from '../api/client';

/**
 * ArticleDetailScreen - Full article view
 *
 * Features:
 * - Full article content with image
 * - Like, save, share actions
 * - Comments section
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
    backBar: {
      backgroundColor: paperTheme.colors.background,
      borderBottomColor: paperTheme.colors.outline,
    },
    backIcon: {
      color: paperTheme.colors.onSurface,
    },
    backText: {
      color: paperTheme.colors.onSurface,
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
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    },
    articleImage: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
    metaSource: {
      color: paperTheme.colors.primary,
    },
    metaDivider: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    metaDate: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    articleTitle: {
      color: paperTheme.colors.onSurface,
    },
    articleDescription: {
      color: paperTheme.colors.onSurfaceVariant,
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
        // Fetch by source and slug
        result = await articlesAPI.getBySourceSlug(source, slug);
      } else if (articleId) {
        // Fetch by ID (fallback)
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

        // Track article view
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

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      const result = await articlesAPI.toggleLike(article.id);
      if (result.error) {
        // Revert on error
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        console.error('[ArticleDetail] Like error:', result.error);
      }
    } catch (error) {
      console.error('[ArticleDetail] Like error:', error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Profile');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistic update
      setIsSaved(!isSaved);

      const result = await articlesAPI.toggleBookmark(article.id);
      if (result.error) {
        // Revert on error
        setIsSaved(isSaved);
        console.error('[ArticleDetail] Save error:', result.error);
      }
    } catch (error) {
      console.error('[ArticleDetail] Save error:', error);
      setIsSaved(isSaved);
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
      } else {
        console.error('[ArticleDetail] Cannot open URL:', article.original_url);
      }
    } catch (error) {
      console.error('[ArticleDetail] Open URL error:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
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

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Back Button Bar */}
      <View style={[styles.backBar, dynamicStyles.backBar, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={dynamicStyles.backIcon.color}
          />
          <Text style={[styles.backText, dynamicStyles.backText]}>Back</Text>
        </TouchableOpacity>

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <IconButton
            icon="share-variant-outline"
            iconColor={paperTheme.colors.onSurface}
            size={22}
            onPress={handleShare}
            style={styles.headerIcon}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
          <View style={[styles.articleContainer, dynamicStyles.articleContainer]}>
            {/* Article Image */}
            {article.image_url && (
              <Image
                source={{ uri: article.image_url }}
                style={[styles.articleImage, dynamicStyles.articleImage]}
                resizeMode="cover"
              />
            )}

            <View style={styles.articleContent}>
              {/* Article Meta */}
              <View style={styles.metaContainer}>
                <Text style={[styles.metaSource, dynamicStyles.metaSource]}>{article.source || 'Unknown'}</Text>
                <Text style={[styles.metaDivider, dynamicStyles.metaDivider]}>•</Text>
                <Text style={[styles.metaDate, dynamicStyles.metaDate]}>{formatDate(article.published_at)}</Text>
              </View>

              {/* Article Title */}
              <Text style={[styles.articleTitle, dynamicStyles.articleTitle]}>{article.title}</Text>

              {/* Article Description */}
              {article.description && (
                <Text style={[styles.articleDescription, dynamicStyles.articleDescription]}>{article.description}</Text>
              )}

              {/* Article Full Content */}
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
                  <IconButton
                    icon={isLiked ? 'heart' : 'heart-outline'}
                    iconColor={isLiked ? paperTheme.colors.error : paperTheme.colors.onSurface}
                    size={24}
                    style={styles.actionIcon}
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
                  <IconButton
                    icon={isSaved ? 'bookmark' : 'bookmark-outline'}
                    iconColor={isSaved ? paperTheme.colors.tertiary : paperTheme.colors.onSurface}
                    size={24}
                    style={styles.actionIcon}
                  />
                  <Text style={[styles.actionText, dynamicStyles.actionText]}>Save</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.actionButton, dynamicStyles.actionButton]}
                  activeOpacity={0.7}
                >
                  <IconButton
                    icon="share-variant-outline"
                    iconColor={paperTheme.colors.onSurface}
                    size={24}
                    style={styles.actionIcon}
                  />
                  <Text style={[styles.actionText, dynamicStyles.actionText]}>Share</Text>
                </TouchableOpacity>

                {/* Read Original Button */}
                <TouchableOpacity
                  onPress={handleReadOriginal}
                  style={[styles.actionButton, styles.readOriginalButton, dynamicStyles.readOriginalButton]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.readOriginalText, dynamicStyles.readOriginalText]}>Read Original</Text>
                  <IconButton
                    icon="open-in-new"
                    iconColor={paperTheme.colors.onPrimary}
                    size={20}
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingBottom: mukokoTheme.spacing.xs,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.xs,
    gap: mukokoTheme.spacing.xs,
  },
  backText: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: mukokoTheme.spacing.xl,
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
    fontWeight: mukokoTheme.fonts.serifBold.fontWeight,
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
  articleContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: mukokoTheme.spacing.md,
    marginTop: mukokoTheme.spacing.md,
    borderWidth: 1,
  },
  articleImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  articleContent: {
    padding: mukokoTheme.spacing.lg,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  metaSource: {
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontWeight: mukokoTheme.fonts.medium.fontWeight,
    fontSize: 14,
  },
  metaDivider: {
    marginHorizontal: mukokoTheme.spacing.xs,
    fontSize: 14,
  },
  metaDate: {
    fontSize: 14,
  },
  articleTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontWeight: mukokoTheme.fonts.serifBold.fontWeight,
    fontSize: 28,
    lineHeight: 36,
    marginBottom: mukokoTheme.spacing.md,
  },
  articleDescription: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: mukokoTheme.spacing.lg,
  },
  contentContainer: {
    marginBottom: mukokoTheme.spacing.lg,
  },
  contentParagraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: mukokoTheme.spacing.md,
  },
  actionsDivider: {
    marginVertical: mukokoTheme.spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.xs,
  },
  actionIcon: {
    margin: 0,
    padding: 0,
  },
  actionText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontWeight: mukokoTheme.fonts.medium.fontWeight,
    marginLeft: -4,
  },
  readOriginalButton: {
    marginLeft: 'auto',
  },
  readOriginalText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    fontWeight: mukokoTheme.fonts.medium.fontWeight,
    marginHorizontal: mukokoTheme.spacing.sm,
  },
});
