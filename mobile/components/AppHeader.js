import React, { useState, useEffect } from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
import { Sun, Moon, Bell } from 'lucide-react-native';
import { navigationRef } from '../navigation/navigationRef';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import CountryPickerButton from './CountryPickerButton';

/**
 * Helper to safely get the current route name from navigation state
 * Uses navigationRef directly to avoid useNavigationState hook issues
 */
function getRouteNameFromState(state) {
  if (!state) return 'Bytes';

  // Get the current tab
  const currentRoute = state.routes?.[state.index];
  if (!currentRoute) return 'Bytes';

  // If tab has nested stack, get the nested route name
  const nestedState = currentRoute.state;
  if (nestedState && nestedState.routes) {
    const nestedRoute = nestedState.routes[nestedState.index];
    return nestedRoute?.name || currentRoute.name;
  }

  return currentRoute.name;
}

/**
 * AppHeader - Netflix-style minimal header
 *
 * Pattern:
 * - Left: Logo + Screen title (contextual)
 * - Right: Utility icons (Discover, Pulse, Theme)
 * - No hamburger menu (navigation via tabs)
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AppHeader() {
  const { isDark, toggleTheme, theme } = useTheme();
  const { user } = useAuth();
  const [routeName, setRouteName] = useState('Bytes');

  // Subscribe to navigation state changes using navigationRef
  useEffect(() => {
    // Get initial route name if available
    if (navigationRef.isReady()) {
      const state = navigationRef.getRootState();
      setRouteName(getRouteNameFromState(state));
    }

    // Subscribe to state changes
    const unsubscribe = navigationRef.addListener('state', (event) => {
      const state = event.data?.state;
      setRouteName(getRouteNameFromState(state));
    });

    return unsubscribe;
  }, []);

  // Screen titles mapping
  const getScreenTitle = () => {
    switch (routeName) {
      case 'Bytes':
      case 'BytesFeed':
        return 'Bytes';
      case 'Search':
      case 'SearchFeed':
        return 'Search';
      case 'Discover':
      case 'DiscoverFeed':
        return 'Discover';
      case 'Profile':
      case 'UserProfile':
        return user?.username || 'Profile';
      case 'Login':
        return 'Sign In';
      case 'Register':
        return 'Create Account';
      case 'Admin':
      case 'AdminDashboard':
        return 'Admin';
      case 'Pulse':
      case 'PulseFeed':
        return 'Pulse';
      case 'ArticleDetail':
        return null; // No title for article view - show logo only
      default:
        return null;
    }
  };

  const screenTitle = getScreenTitle();
  // Use inverse theme color for icons (light icons in dark mode, dark icons in light mode)
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <View
      className="flex-row items-center justify-between h-[56px] px-md"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Left: Logo + Title */}
      <View className="flex-row items-center gap-sm">
        <Logo size="icon" theme={isDark ? 'light' : 'dark'} />
        {screenTitle && (
          <RNText
            className="font-serif-bold text-[20px]"
            style={{ color: theme.colors['on-surface'], letterSpacing: 0, fontWeight: '600' }}
          >
            {screenTitle}
          </RNText>
        )}
      </View>

      {/* Right: Country Picker, Theme, Notifications */}
      <View className="flex-row items-center gap-[4px]">
        {/* Country Picker */}
        <CountryPickerButton compact={true} showLabel={false} />

        {/* Theme Toggle */}
        <Pressable
          onPress={toggleTheme}
          className="p-[10px] min-w-touch min-h-touch items-center justify-center"
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          accessibilityRole="button"
        >
          {isDark ? (
            <Sun size={22} color={iconColor} strokeWidth={1.5} />
          ) : (
            <Moon size={22} color={iconColor} strokeWidth={1.5} />
          )}
        </Pressable>

        {/* Notifications - Coming Soon */}
        <Pressable
          onPress={() => {}}
          className="p-[10px] min-w-touch min-h-touch items-center justify-center"
          accessibilityLabel="Notifications (Coming Soon)"
          accessibilityRole="button"
          accessibilityHint="Feature not yet available"
        >
          <Bell size={22} color={iconColor} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}
