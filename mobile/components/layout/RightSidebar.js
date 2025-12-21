import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TrendingUp, Hash, ExternalLink } from 'lucide-react-native';
import { navigate } from '../../navigation/navigationRef';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { categories as categoriesAPI, insights as insightsAPI } from '../../api/client';
import Logo from '../Logo';

/**
 * RightSidebar - Instagram-style suggestions sidebar for desktop
 *
 * Features:
 * - User profile mini-card (if logged in)
 * - Trending topics/hashtags
 * - Quick category access
 * - Footer links
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function RightSidebar() {
  const { theme, isDark } = useTheme();
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
          { id: 1, tag: 'Africa', count: 156 },
          { id: 2, tag: 'Business', count: 89 },
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

  const iconColor = theme.colors['on-surface-variant'];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
    >
      {/* User Profile Card (if logged in) */}
      {isAuthenticated && user && (
        <Pressable
          className="flex-row items-center p-md rounded-button mb-xl gap-md bg-surface-variant"
          onPress={() => navigate('Profile')}
          accessibilityLabel={`View profile for ${user.username}`}
          accessibilityRole="button"
        >
          <View className="w-[44px] h-[44px] rounded-full items-center justify-center bg-tanzanite/10">
            <RNText className="font-sans-bold text-[18px]" style={{ color: theme.colors.tanzanite }}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </RNText>
          </View>
          <View className="flex-1">
            <RNText className="font-sans-bold text-[14px] mb-[2px] text-on-surface" numberOfLines={1}>
              {user.username}
            </RNText>
            <RNText className="font-sans text-[12px] text-on-surface-variant" numberOfLines={1}>
              {user.email}
            </RNText>
          </View>
        </Pressable>
      )}

      {/* Login Prompt (if not logged in) */}
      {!isAuthenticated && (
        <View className="p-lg rounded-button mb-xl items-center bg-surface-variant">
          <RNText className="font-sans-bold text-[16px] mb-xs text-on-surface">
            Welcome to Mukoko
          </RNText>
          <RNText className="font-sans text-[13px] text-center mb-md text-on-surface-variant">
            Sign in to save articles and personalize your feed
          </RNText>
          <Pressable
            className="px-xl py-sm rounded-button bg-tanzanite"
            onPress={() => navigate('Profile')}
          >
            <RNText className="font-sans-bold text-[14px] text-on-primary">
              Sign In
            </RNText>
          </Pressable>
        </View>
      )}

      {/* Trending Topics */}
      <View className="mb-xl">
        <View className="flex-row items-center gap-sm mb-md">
          <TrendingUp size={18} color={iconColor} strokeWidth={1.5} />
          <RNText className="font-sans-bold text-[13px] uppercase text-on-surface-variant" style={{ letterSpacing: 0.5 }}>
            Trending
          </RNText>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.tanzanite} />
        ) : (
          <View className="gap-sm">
            {trending.map((item) => (
              <Pressable
                key={item.id}
                className="py-sm"
                onPress={() => handleTrendingPress(item.tag)}
              >
                <View className="flex-row items-center gap-xs">
                  <Hash size={14} color={theme.colors.tanzanite} strokeWidth={2} />
                  <RNText className="font-sans-medium text-[14px] text-on-surface">
                    {item.tag}
                  </RNText>
                </View>
                <RNText className="font-sans text-[12px] mt-[2px] ml-[18px] text-on-surface-variant">
                  {item.count} articles
                </RNText>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Categories */}
      <View className="mb-xl">
        <View className="flex-row items-center gap-sm mb-md">
          <ExternalLink size={18} color={iconColor} strokeWidth={1.5} />
          <RNText className="font-sans-bold text-[13px] uppercase text-on-surface-variant" style={{ letterSpacing: 0.5 }}>
            Categories
          </RNText>
        </View>

        <View className="flex-row flex-wrap gap-sm">
          {categories.map((category, index) => (
            <Pressable
              key={category.slug || index}
              className="px-md py-sm rounded-[16px] bg-surface-variant"
              onPress={() => handleCategoryPress(category)}
            >
              <RNText className="font-sans text-[13px] text-on-surface">
                {category.name || category}
              </RNText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="mt-xl pt-lg items-center">
        <View className="flex-row items-center gap-sm mb-sm">
          <Logo size="icon" theme={isDark ? 'light' : 'dark'} />
          <RNText className="font-sans-bold text-[14px] text-on-surface-variant">
            Mukoko News
          </RNText>
        </View>
        <RNText className="font-sans text-[12px] mb-sm text-on-surface-variant">
          Africa's News, Your Way
        </RNText>
        <RNText className="font-sans text-[11px] text-on-surface-variant">
          © 2025 Mukoko News
        </RNText>
      </View>
    </ScrollView>
  );
}
