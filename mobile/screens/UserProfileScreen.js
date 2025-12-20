/**
 * UserProfileScreen - WeChat-inspired clean profile design
 * Menu-driven layout with mineral-colored icons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme as usePaperTheme,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useLayout } from '../components/layout';
import { user as userAPI, auth } from '../api/client';

const AVATAR_SIZE = mukokoTheme.layout.emojiXL + 36; // 100px

export default function UserProfileScreen({ navigation, route }) {
  const { username } = route.params || {};
  const insets = useSafeAreaInsets();
  const paperTheme = usePaperTheme();
  const layout = useLayout();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? mukokoTheme.layout.bottomPaddingMobile : mukokoTheme.layout.bottomPaddingDesktop;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user has a session
      const sessionResult = await auth.getSession();

      if (!sessionResult.error && sessionResult.data?.user && sessionResult.data.user.username) {
        // Authenticated user
        const actualUsername = username || sessionResult.data.user.username;
        const profileResult = await userAPI.getPublicProfile(actualUsername);
        if (profileResult.error) throw new Error('User not found');
        setProfile(profileResult.data);

        const statsResult = await userAPI.getPublicStats(actualUsername);
        if (!statsResult.error) setStats(statsResult.data);
      } else {
        // Anonymous user
        setProfile({
          username: 'Guest',
          displayName: 'Guest User',
          bio: 'Sign in to personalize your experience',
          isAnonymous: true,
        });
        setStats({
          articlesRead: 0,
          bookmarksCount: 0,
          likesGiven: 0,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = async (action) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (action) {
      case 'saved':
        // Navigate to saved articles
        break;
      case 'history':
        // Navigate to reading history
        break;
      case 'stats':
        // Navigate to stats screen
        break;
      case 'settings':
        navigation.navigate('ProfileSettings');
        break;
      case 'help':
        // Navigate to help
        break;
      case 'about':
        // Navigate to about
        break;
      default:
        break;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: paperTheme.colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={mukokoTheme.layout.emojiLarge}
          color={paperTheme.colors.error}
        />
        <Text style={[styles.errorText, { color: paperTheme.colors.onSurfaceVariant }]}>
          {error || 'User not found'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={loadProfile}
        >
          <Text style={[styles.retryButtonText, { color: paperTheme.colors.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = profile.display_name || profile.displayName || profile.username;
  const avatarUrl = profile.avatar_url || profile.avatarUrl;
  const mukokoId = `mukokoid:${profile.username}`;

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: paperTheme.colors.surface }]}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                <Text style={[styles.avatarInitials, { color: paperTheme.colors.primary }]}>
                  {getInitials(displayName)}
                </Text>
              </View>
            )}

            {/* Name and ID */}
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: paperTheme.colors.onSurface }]}>
                {displayName}
              </Text>
              <Text style={[styles.mukokoId, { color: paperTheme.colors.onSurfaceVariant }]}>
                Mukoko ID: {profile.username}
              </Text>
            </View>

            {/* QR Code Icon */}
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => handleMenuPress('qr')}
            >
              <MaterialCommunityIcons
                name="qrcode"
                size={mukokoTheme.layout.badgeMedium}
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text style={[styles.bio, { color: paperTheme.colors.onSurfaceVariant }]}>
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Content & Services Section */}
        <View style={[styles.menuSection, { backgroundColor: paperTheme.colors.surface }]}>
          <MenuItem
            icon="bookmark"
            iconColor="#FFD740"
            iconBg="rgba(255, 215, 64, 0.15)"
            label="Saved Articles"
            value={formatNumber(stats?.bookmarksCount || 0)}
            onPress={() => handleMenuPress('saved')}
            paperTheme={paperTheme}
          />

          <Divider style={styles.divider} />

          <MenuItem
            icon="history"
            iconColor="#00B0FF"
            iconBg="rgba(0, 176, 255, 0.15)"
            label="Reading History"
            value={formatNumber(stats?.articlesRead || 0)}
            onPress={() => handleMenuPress('history')}
            paperTheme={paperTheme}
          />
        </View>

        {/* Stats Section */}
        <View style={[styles.menuSection, { backgroundColor: paperTheme.colors.surface }]}>
          <MenuItem
            icon="chart-line"
            iconColor="#64FFDA"
            iconBg="rgba(100, 255, 218, 0.15)"
            label="My Stats"
            onPress={() => handleMenuPress('stats')}
            paperTheme={paperTheme}
            showChevron
          />
        </View>

        {/* Settings Section */}
        <View style={[styles.menuSection, { backgroundColor: paperTheme.colors.surface }]}>
          <MenuItem
            icon="cog"
            iconColor="#B388FF"
            iconBg="rgba(179, 136, 255, 0.15)"
            label="Settings"
            onPress={() => handleMenuPress('settings')}
            paperTheme={paperTheme}
            showChevron
          />

          <Divider style={styles.divider} />

          <MenuItem
            icon="help-circle"
            iconColor={paperTheme.colors.onSurfaceVariant}
            iconBg={paperTheme.colors.surfaceVariant}
            label="Help & Feedback"
            onPress={() => handleMenuPress('help')}
            paperTheme={paperTheme}
            showChevron
          />

          <Divider style={styles.divider} />

          <MenuItem
            icon="information"
            iconColor={paperTheme.colors.onSurfaceVariant}
            iconBg={paperTheme.colors.surfaceVariant}
            label="About Mukoko"
            onPress={() => handleMenuPress('about')}
            paperTheme={paperTheme}
            showChevron
          />
        </View>

        {/* Login Prompt for Guests */}
        {profile.isAnonymous && (
          <TouchableOpacity
            style={[styles.loginPrompt, { backgroundColor: paperTheme.colors.primaryContainer }]}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Text style={[styles.loginPromptText, { color: paperTheme.colors.primary }]}>
              Sign in to save articles and track your reading
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * MenuItem Component - Reusable menu item with icon
 */
function MenuItem({ icon, iconColor, iconBg, label, value, onPress, paperTheme, showChevron = true }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon Circle */}
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons
          name={icon}
          size={mukokoTheme.layout.emojiMedium}
          color={iconColor}
        />
      </View>

      {/* Label */}
      <Text style={[styles.menuLabel, { color: paperTheme.colors.onSurface }]}>
        {label}
      </Text>

      {/* Value or Chevron */}
      {value ? (
        <Text style={[styles.menuValue, { color: paperTheme.colors.onSurfaceVariant }]}>
          {value}
        </Text>
      ) : showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={mukokoTheme.layout.badgeMedium}
          color={paperTheme.colors.onSurfaceVariant}
        />
      ) : null}
    </TouchableOpacity>
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
    gap: mukokoTheme.spacing.md,
    padding: mukokoTheme.spacing.xl,
  },
  errorText: {
    fontSize: mukokoTheme.typography.bodyMedium,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    marginTop: mukokoTheme.spacing.sm,
  },
  retryButtonText: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom set dynamically
  },

  // Profile Header
  profileHeader: {
    padding: mukokoTheme.spacing.lg,
    marginBottom: mukokoTheme.spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: mukokoTheme.typography.displaySmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  profileInfo: {
    flex: 1,
    marginLeft: mukokoTheme.spacing.lg,
  },
  displayName: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  mukokoId: {
    fontSize: mukokoTheme.typography.bodySmall,
  },
  qrButton: {
    width: mukokoTheme.touchTargets.minimum,
    height: mukokoTheme.touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bio: {
    fontSize: mukokoTheme.typography.bodyMedium,
    lineHeight: 20,
  },

  // Menu Sections
  menuSection: {
    marginBottom: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.lg,
    minHeight: mukokoTheme.layout.emojiXL,
  },
  menuIconContainer: {
    width: mukokoTheme.layout.actionButtonSize,
    height: mukokoTheme.layout.actionButtonSize,
    borderRadius: mukokoTheme.layout.actionButtonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: mukokoTheme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  menuValue: {
    fontSize: mukokoTheme.typography.bodySmall,
    marginRight: mukokoTheme.spacing.xs,
  },
  divider: {
    marginLeft: mukokoTheme.layout.actionButtonSize + mukokoTheme.spacing.md + mukokoTheme.spacing.lg,
  },

  // Login Prompt
  loginPrompt: {
    margin: mukokoTheme.spacing.lg,
    padding: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: mukokoTheme.typography.bodyMedium,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
});
