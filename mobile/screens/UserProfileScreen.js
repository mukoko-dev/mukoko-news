/**
 * UserProfileScreen - WeChat-inspired clean profile design
 * Uses reusable ProfileHeader, MenuItem, and MenuSection components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';
import { useLayout } from '../components/layout';
import { user as userAPI, auth } from '../api/client';
import ProfileHeader from '../components/ProfileHeader';
import MenuItem from '../components/MenuItem';
import MenuSection from '../components/MenuSection';

export default function UserProfileScreen({ navigation, route }) {
  const { username } = route.params || {};
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

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Component */}
        <ProfileHeader
          displayName={displayName}
          username={profile.username}
          bio={profile.bio}
          avatarUrl={avatarUrl}
          showQrButton={true}
          onQrPress={() => handleMenuPress('qr')}
        />

        {/* Content & Services Section */}
        <MenuSection>
          <MenuItem
            icon="bookmark"
            iconColor="#FFD740"
            iconBg="rgba(255, 215, 64, 0.15)"
            label="Saved Articles"
            value={formatNumber(stats?.bookmarksCount || 0)}
            onPress={() => handleMenuPress('saved')}
          />

          <MenuItem
            icon="history"
            iconColor="#00B0FF"
            iconBg="rgba(0, 176, 255, 0.15)"
            label="Reading History"
            value={formatNumber(stats?.articlesRead || 0)}
            onPress={() => handleMenuPress('history')}
          />
        </MenuSection>

        {/* Stats Section */}
        <MenuSection>
          <MenuItem
            icon="chart-line"
            iconColor="#64FFDA"
            iconBg="rgba(100, 255, 218, 0.15)"
            label="My Stats"
            onPress={() => handleMenuPress('stats')}
            showChevron
          />
        </MenuSection>

        {/* Settings Section */}
        <MenuSection>
          <MenuItem
            icon="cog"
            iconColor="#B388FF"
            iconBg="rgba(179, 136, 255, 0.15)"
            label="Settings"
            onPress={() => handleMenuPress('settings')}
            showChevron
          />

          <MenuItem
            icon="help-circle"
            iconColor={paperTheme.colors.onSurfaceVariant}
            iconBg={paperTheme.colors.surfaceVariant}
            label="Help & Feedback"
            onPress={() => handleMenuPress('help')}
            showChevron
          />

          <MenuItem
            icon="information"
            iconColor={paperTheme.colors.onSurfaceVariant}
            iconBg={paperTheme.colors.surfaceVariant}
            label="About Mukoko"
            onPress={() => handleMenuPress('about')}
            showChevron
          />
        </MenuSection>

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
