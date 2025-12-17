import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Compass, Newspaper, Sun, Moon } from 'lucide-react-native';
import { navigate, navigationRef } from '../navigation/navigationRef';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import Logo from './Logo';

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
 */
export default function AppHeader() {
  const { isDark, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();
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
  const iconColor = paperTheme.colors.onSurfaceVariant;

  // Dynamic styles based on theme
  const dynamicStyles = {
    header: {
      backgroundColor: paperTheme.colors.background,
    },
    title: {
      color: paperTheme.colors.onSurface,
    },
  };

  return (
    <View style={[styles.header, dynamicStyles.header]}>
      {/* Left: Logo + Title */}
      <View style={styles.leftSection}>
        <Logo size="icon" theme={isDark ? 'light' : 'dark'} />
        {screenTitle && (
          <Text style={[styles.title, dynamicStyles.title]}>{screenTitle}</Text>
        )}
      </View>

      {/* Right: Utility Icons (Discover, Pulse, Theme) */}
      <View style={styles.rightSection}>
        {/* Discover */}
        <TouchableOpacity
          onPress={() => navigate('Discover')}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Discover content"
          accessibilityRole="button"
        >
          <Compass size={22} color={iconColor} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Pulse - Personalized Feed */}
        <TouchableOpacity
          onPress={() => navigate('Pulse')}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Pulse - Personalized feed"
          accessibilityRole="button"
        >
          <Newspaper size={22} color={iconColor} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          accessibilityRole="button"
        >
          {isDark ? (
            <Sun size={22} color={iconColor} strokeWidth={1.5} />
          ) : (
            <Moon size={22} color={iconColor} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: mukokoTheme.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
