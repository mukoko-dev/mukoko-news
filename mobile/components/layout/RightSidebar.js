import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { TrendingUp, Hash, ExternalLink, RefreshCw } from 'lucide-react-native';
import { navigate } from '../../navigation/navigationRef';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { categories as categoriesAPI, insights as insightsAPI } from '../../api/client';
import mukokoTheme from '../../theme';
import Logo from '../Logo';

/**
 * RightSidebar - Instagram-style suggestions sidebar for desktop
 *
 * Features:
 * - User profile mini-card (if logged in)
 * - Trending topics/hashtags
 * - Quick category access
 * - Footer links
 */
export default function RightSidebar() {
  const paperTheme = usePaperTheme();
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending topics and categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories from API
      const categoriesRes = await categoriesAPI.getAll();
      if (!categoriesRes.error && categoriesRes.data) {
        // Handle both array and object responses
        const catData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.categories || [];
        setCategories(catData.slice(0, 6)); // Top 6 categories
      }

      // Try to fetch trending categories from insights API
      try {
        const trendingRes = await insightsAPI.getTrendingCategories(5);
        if (!trendingRes.error && trendingRes.data) {
          const trendingData = Array.isArray(trendingRes.data)
            ? trendingRes.data
            : trendingRes.data.categories || [];
          setTrending(trendingData.map((item, index) => ({
            id: index + 1,
            tag: item.name || item.category || item,
            count: item.count || item.article_count || 0,
          })));
        }
      } catch {
        // Fallback to static trending if API fails
        setTrending([
          { id: 1, tag: 'Zimbabwe', count: 156 },
          { id: 2, tag: 'Harare', count: 89 },
          { id: 3, tag: 'Economy', count: 67 },
          { id: 4, tag: 'Sports', count: 45 },
          { id: 5, tag: 'Politics', count: 38 },
        ]);
      }
    } catch (error) {
      console.error('[RightSidebar] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle category press
  const handleCategoryPress = (category) => {
    navigate('Discover');
    // Category filtering would be handled by the Discover screen
  };

  // Handle trending topic press
  const handleTrendingPress = (tag) => {
    navigate('Search');
    // Search would be pre-filled with the tag
  };

  // Dynamic styles
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    sectionTitle: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    text: {
      color: paperTheme.colors.onSurface,
    },
    textSecondary: {
      color: paperTheme.colors.onSurfaceVariant,
    },
    card: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
    border: {
      borderColor: paperTheme.colors.outline,
    },
    chip: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
  };

  const iconColor = paperTheme.colors.onSurfaceVariant;

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* User Profile Card (if logged in) */}
      {isAuthenticated && user && (
        <TouchableOpacity
          style={[styles.profileCard, dynamicStyles.card]}
          onPress={() => navigate('Profile')}
          activeOpacity={0.7}
          accessibilityLabel={`View profile for ${user.username}`}
          accessibilityRole="button"
        >
          <View style={styles.profileAvatar}>
            <Text style={[styles.avatarText, { color: paperTheme.colors.primary }]}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, dynamicStyles.text]} numberOfLines={1}>
              {user.username}
            </Text>
            <Text style={[styles.profileEmail, dynamicStyles.textSecondary]} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Login Prompt (if not logged in) */}
      {!isAuthenticated && (
        <View style={[styles.loginPrompt, dynamicStyles.card]}>
          <Text style={[styles.loginPromptTitle, dynamicStyles.text]}>
            Welcome to Mukoko
          </Text>
          <Text style={[styles.loginPromptText, dynamicStyles.textSecondary]}>
            Sign in to save articles and personalize your feed
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: paperTheme.colors.primary }]}
            onPress={() => navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginButtonText, { color: paperTheme.colors.onPrimary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Trending Topics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={18} color={iconColor} strokeWidth={1.5} />
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Trending
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={paperTheme.colors.primary} />
        ) : (
          <View style={styles.trendingList}>
            {trending.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.trendingItem}
                onPress={() => handleTrendingPress(item.tag)}
                activeOpacity={0.7}
              >
                <View style={styles.trendingContent}>
                  <Hash size={14} color={paperTheme.colors.primary} strokeWidth={2} />
                  <Text style={[styles.trendingTag, dynamicStyles.text]}>
                    {item.tag}
                  </Text>
                </View>
                <Text style={[styles.trendingCount, dynamicStyles.textSecondary]}>
                  {item.count} articles
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ExternalLink size={18} color={iconColor} strokeWidth={1.5} />
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Categories
          </Text>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.slug || index}
              style={[styles.categoryChip, dynamicStyles.chip]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, dynamicStyles.text]}>
                {category.name || category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBrand}>
          <Logo size="icon" theme={isDark ? 'light' : 'dark'} />
          <Text style={[styles.footerBrandText, dynamicStyles.textSecondary]}>
            Mukoko News
          </Text>
        </View>
        <Text style={[styles.footerText, dynamicStyles.textSecondary]}>
          Zimbabwe's News, Your Way
        </Text>
        <Text style={[styles.footerCopyright, dynamicStyles.textSecondary]}>
          © 2025 Mukoko News
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: mukokoTheme.spacing.lg,
    paddingTop: mukokoTheme.spacing.xl,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    marginBottom: mukokoTheme.spacing.xl,
    gap: mukokoTheme.spacing.md,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },

  // Login Prompt
  loginPrompt: {
    padding: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    marginBottom: mukokoTheme.spacing.xl,
    alignItems: 'center',
  },
  loginPromptTitle: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  loginPromptText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  loginButton: {
    paddingHorizontal: mukokoTheme.spacing.xl,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Section
  section: {
    marginBottom: mukokoTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Trending
  trendingList: {
    gap: mukokoTheme.spacing.sm,
  },
  trendingItem: {
    paddingVertical: mukokoTheme.spacing.sm,
  },
  trendingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.xs,
  },
  trendingTag: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  trendingCount: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginTop: 2,
    marginLeft: 18, // Align with tag text
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },

  // Footer
  footer: {
    marginTop: mukokoTheme.spacing.xl,
    paddingTop: mukokoTheme.spacing.lg,
    alignItems: 'center',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.sm,
  },
  footerBrandText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  footerText: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginBottom: mukokoTheme.spacing.sm,
  },
  footerCopyright: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
