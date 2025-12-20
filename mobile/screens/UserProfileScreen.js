/**
 * UserProfileScreen - WeChat-inspired clean profile design
 * Uses reusable ProfileHeader, MenuItem, and MenuSection components
 * shadcn-style with NativeWind + Lucide icons
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { Bookmark, Clock, LineChart, Settings, HelpCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLayout } from '../components/layout';
import { user as userAPI, auth } from '../api/client';
import ProfileHeader from '../components/ProfileHeader';
import MenuItem from '../components/MenuItem';
import MenuSection from '../components/MenuSection';
import { LoadingState, ErrorState } from '../components/ui';

export default function UserProfileScreen({ navigation, route }) {
  const { username } = route.params || {};
  const layout = useLayout();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? 100 : 24;

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
    return <LoadingState />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="Profile not found"
        message={error || 'User not found'}
        onRetry={loadProfile}
      />
    );
  }

  const displayName = profile.display_name || profile.displayName || profile.username;
  const avatarUrl = profile.avatar_url || profile.avatarUrl;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
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
            icon={Bookmark}
            iconColor="#FFD740"
            iconBg="rgba(255, 215, 64, 0.15)"
            label="Saved Articles"
            value={formatNumber(stats?.bookmarksCount || 0)}
            onPress={() => handleMenuPress('saved')}
          />

          <MenuItem
            icon={Clock}
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
            icon={LineChart}
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
            icon={Settings}
            iconColor="#B388FF"
            iconBg="rgba(179, 136, 255, 0.15)"
            label="Settings"
            onPress={() => handleMenuPress('settings')}
            showChevron
          />

          <MenuItem
            icon={HelpCircle}
            iconColor="#4a4a4a"
            iconBg="#F3F2EE"
            label="Help & Feedback"
            onPress={() => handleMenuPress('help')}
            showChevron
          />

          <MenuItem
            icon={Info}
            iconColor="#4a4a4a"
            iconBg="#F3F2EE"
            label="About Mukoko"
            onPress={() => handleMenuPress('about')}
            showChevron
          />
        </MenuSection>

        {/* Login Prompt for Guests */}
        {profile.isAnonymous && (
          <Pressable
            className="bg-tanzanite-container p-lg rounded-card mx-md"
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Text className="font-sans-medium text-body-medium text-tanzanite text-center">
              Sign in to save articles and track your reading
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

// All styles removed - using NativeWind classes instead
