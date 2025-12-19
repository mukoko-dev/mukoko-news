/**
 * UserProfileScreen - TikTok-inspired profile design
 * Clean, professional layout with stats and content tabs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { mukokoTheme } from '../theme';
import { useLayout } from '../components/layout';
import { user as userAPI, auth } from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 100;
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

export default function UserProfileScreen({ navigation, route }) {
  const { username } = route.params || {};
  const insets = useSafeAreaInsets();
  const paperTheme = usePaperTheme();
  const layout = useLayout();

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? 100 : 24;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (isOwnProfile && activeTab) {
      loadArticles(activeTab);
    }
  }, [activeTab, isOwnProfile]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user has a session
      const sessionResult = await auth.getSession();

      if (!sessionResult.error && sessionResult.data?.user && sessionResult.data.user.username) {
        // Authenticated user - load their profile
        const actualUsername = username || sessionResult.data.user.username;
        const profileResult = await userAPI.getPublicProfile(actualUsername);
        if (profileResult.error) throw new Error('User not found');
        setProfile(profileResult.data);

        const statsResult = await userAPI.getPublicStats(actualUsername);
        if (!statsResult.error) setStats(statsResult.data);

        setIsOwnProfile(sessionResult.data.user.username === actualUsername);
      } else {
        // Anonymous user - show session info
        const sessionId = sessionResult.data?.sessionId || 'anonymous';
        setProfile({
          username: 'Guest',
          displayName: 'Guest User',
          bio: 'Browse and enjoy Mukoko News. Sign in to personalize your experience.',
          isAnonymous: true,
          sessionId: sessionId.substring(0, 8), // Show truncated session ID
        });
        setStats({
          articlesRead: 0,
          bookmarksCount: 0,
          likesGiven: 0,
        });
        setIsOwnProfile(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // Show anonymous profile on error
      setProfile({
        username: 'Guest',
        displayName: 'Guest User',
        bio: 'Browse and enjoy Mukoko News.',
        isAnonymous: true,
      });
      setStats({
        articlesRead: 0,
        bookmarksCount: 0,
        likesGiven: 0,
      });
      setIsOwnProfile(true);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (tab) => {
    if (!isOwnProfile) return;
    setArticlesLoading(true);
    try {
      const result = await userAPI.getActivity(username, tab, 30);
      if (!result.error && result.data) {
        setArticles(result.data[tab] || result.data.history || []);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleTabPress = useCallback((tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Dynamic styles
  const dynamicStyles = {
    container: { backgroundColor: paperTheme.colors.background },
    headerBg: { backgroundColor: paperTheme.colors.surface },
    text: { color: paperTheme.colors.onSurface },
    textMuted: { color: paperTheme.colors.onSurfaceVariant },
    tabActive: { borderBottomColor: paperTheme.colors.primary },
    glass: {
      backgroundColor: paperTheme.colors.glassCard || 'rgba(255,255,255,0.9)',
      borderColor: paperTheme.colors.glassBorder || 'rgba(0,0,0,0.06)',
    },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={paperTheme.colors.error}
        />
        <Text style={[styles.errorText, dynamicStyles.textMuted]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={loadProfile}
          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
        >
          <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <MaterialCommunityIcons
          name="account-off"
          size={48}
          color={paperTheme.colors.onSurfaceVariant}
        />
        <Text style={[styles.errorText, dynamicStyles.textMuted]}>
          User not found
        </Text>
      </View>
    );
  }

  const displayName = profile.display_name || profile.displayName || profile.username;
  const avatarUrl = profile.avatar_url || profile.avatarUrl;

  const renderArticleGrid = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('ArticleDetail', {
          source: item.source,
          slug: item.slug,
        });
      }}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.gridImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.gridPlaceholder, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons
            name="newspaper"
            size={24}
            color={paperTheme.colors.onSurfaceVariant}
          />
        </View>
      )}
      <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const tabs = [
    { id: 'bookmarks', icon: 'bookmark', label: 'Saved' },
    { id: 'likes', icon: 'heart', label: 'Liked' },
    { id: 'history', icon: 'history', label: 'History' },
  ];

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>

        <Text style={[styles.headerUsername, dynamicStyles.text]}>
          @{profile.username}
        </Text>

        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProfileSettings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={paperTheme.colors.onSurface}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, { borderColor: paperTheme.colors.primary }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                  <Text style={[styles.avatarInitials, { color: paperTheme.colors.primary }]}>
                    {getInitials(displayName)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Name */}
          <Text style={[styles.displayName, dynamicStyles.text]}>
            {displayName}
          </Text>
          {profile.bio && (
            <Text style={[styles.bio, dynamicStyles.textMuted]}>
              {profile.bio}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {formatNumber(stats?.bookmarks || 0)}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.textMuted]}>
                Saved
              </Text>
            </TouchableOpacity>

            <View style={[styles.statDivider, { backgroundColor: paperTheme.colors.outline }]} />

            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {formatNumber(stats?.likes || 0)}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.textMuted]}>
                Likes
              </Text>
            </TouchableOpacity>

            <View style={[styles.statDivider, { backgroundColor: paperTheme.colors.outline }]} />

            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={[styles.statValue, dynamicStyles.text]}>
                {formatNumber(stats?.articles_read || 0)}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.textMuted]}>
                Read
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {isOwnProfile ? (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: paperTheme.colors.surfaceVariant }]}
              onPress={() => navigation.navigate('ProfileSettings')}
              activeOpacity={0.8}
            >
              <Text style={[styles.editButtonText, dynamicStyles.text]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.followButton, { backgroundColor: paperTheme.colors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.followButtonText, { color: paperTheme.colors.onPrimary }]}>
                  Follow
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="share-outline"
                  size={20}
                  color={paperTheme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tabs */}
        {isOwnProfile && (
          <>
            <View style={[styles.tabBar, { borderBottomColor: paperTheme.colors.outline }]}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && [styles.tabActive, dynamicStyles.tabActive],
                  ]}
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={22}
                    color={
                      activeTab === tab.id
                        ? paperTheme.colors.primary
                        : paperTheme.colors.onSurfaceVariant
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Content Grid */}
            {articlesLoading ? (
              <View style={styles.gridLoading}>
                <ActivityIndicator size="small" color={paperTheme.colors.primary} />
              </View>
            ) : articles.length > 0 ? (
              <FlatList
                data={articles}
                renderItem={renderArticleGrid}
                keyExtractor={(item) => item.id?.toString() || item.slug}
                numColumns={GRID_COLUMNS}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.gridRow}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name={activeTab === 'bookmarks' ? 'bookmark-outline' : activeTab === 'likes' ? 'heart-outline' : 'clock-outline'}
                  size={48}
                  color={paperTheme.colors.onSurfaceVariant}
                />
                <Text style={[styles.emptyTitle, dynamicStyles.textMuted]}>
                  {activeTab === 'bookmarks' && 'No saved articles'}
                  {activeTab === 'likes' && 'No liked articles'}
                  {activeTab === 'history' && 'No reading history'}
                </Text>
                <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
                  Start exploring to fill this up
                </Text>
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: paperTheme.colors.primary }]}
                  onPress={() => navigation.navigate('Home')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.exploreButtonText, { color: paperTheme.colors.onPrimary }]}>
                    Explore Articles
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Private Profile Message */}
        {!isOwnProfile && (
          <View style={styles.privateProfile}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={48}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text style={[styles.privateTitle, dynamicStyles.textMuted]}>
              Private Activity
            </Text>
            <Text style={[styles.privateSubtitle, dynamicStyles.textMuted]}>
              Only {profile.username} can see their saved and liked articles
            </Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    marginTop: mukokoTheme.spacing.sm,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUsername: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom is set dynamically based on layout (tab bar visibility)
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  displayName: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    paddingHorizontal: 32,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },

  // Action Buttons
  editButton: {
    paddingHorizontal: 80,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  followButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  followButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },

  // Grid
  gridLoading: {
    padding: 40,
    alignItems: 'center',
  },
  gridContainer: {
    padding: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.2,
    marginBottom: GRID_GAP,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 24,
  },
  gridTitle: {
    fontSize: 11,
    color: '#fff',
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    lineHeight: 14,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Private Profile
  privateProfile: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  privateTitle: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    marginTop: 8,
  },
  privateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
