import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { navigate } from '../navigation/navigationRef';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import Logo from './Logo';

/**
 * AppHeader - Netflix-style minimal header
 *
 * Pattern:
 * - Left: Logo + Screen title (contextual)
 * - Right: Utility icons (theme toggle, notifications)
 * - No hamburger menu (navigation via tabs)
 */
export default function AppHeader() {
  const { isDark, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();
  const { user } = useAuth();

  // Get current route name from navigation state
  const routeName = useNavigationState((state) => {
    if (!state) return 'Bytes';

    // Get the current tab
    const currentRoute = state.routes[state.index];
    if (!currentRoute) return 'Bytes';

    // If tab has nested stack, get the nested route name
    const nestedState = currentRoute.state;
    if (nestedState && nestedState.routes) {
      const nestedRoute = nestedState.routes[nestedState.index];
      return nestedRoute?.name || currentRoute.name;
    }

    return currentRoute.name;
  });

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
      case 'ArticleDetail':
        return null; // No title for article view - show logo only
      default:
        return null;
    }
  };

  const screenTitle = getScreenTitle();

  // Dynamic styles based on theme
  const dynamicStyles = {
    header: {
      backgroundColor: isDark ? paperTheme.colors.background : paperTheme.colors.background,
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

      {/* Right: Utility Icons (Discover, Theme, Personalized) */}
      <View style={styles.rightSection}>
        {/* Discover */}
        <TouchableOpacity
          onPress={() => navigate('Discover')}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Discover content"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="compass-outline"
            size={22}
            color={paperTheme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={22}
            color={paperTheme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>

        {/* Personalized Feed */}
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Personalized feed"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="star-four-points-outline"
            size={22}
            color={paperTheme.colors.onSurfaceVariant}
          />
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
