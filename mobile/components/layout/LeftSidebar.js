import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import {
  Zap,
  Search,
  Compass,
  Newspaper,
  User,
  Settings,
  Sun,
  Moon,
  Shield,
} from 'lucide-react-native';
import { navigate, navigationRef } from '../../navigation/navigationRef';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import mukokoTheme from '../../theme';
import Logo from '../Logo';

/**
 * LeftSidebar - Instagram-style navigation sidebar for tablet/desktop
 *
 * Features:
 * - Logo at top
 * - Navigation items with icons and labels
 * - Active state highlighting
 * - Theme toggle
 * - Profile/settings access
 * - Admin link (if admin)
 */
export default function LeftSidebar({ currentRoute }) {
  const { isDark, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();
  const { user, isAdmin } = useAuth();

  // Get current route name for highlighting
  const getActiveRoute = () => {
    if (!navigationRef.isReady()) return 'Bytes';

    const state = navigationRef.getRootState();
    if (!state) return 'Bytes';

    const currentTab = state.routes?.[state.index];
    return currentTab?.name || 'Bytes';
  };

  const activeRoute = currentRoute || getActiveRoute();

  // Navigation items configuration
  const navItems = [
    {
      name: 'Bytes',
      label: 'Bytes',
      icon: Zap,
      route: 'Bytes',
    },
    {
      name: 'Search',
      label: 'Search',
      icon: Search,
      route: 'Search',
    },
    {
      name: 'Discover',
      label: 'Discover',
      icon: Compass,
      route: 'Discover',
    },
    {
      name: 'Pulse',
      label: 'Pulse',
      icon: Newspaper,
      route: 'Pulse',
    },
    {
      name: 'Profile',
      label: user?.username || 'Profile',
      icon: User,
      route: 'Profile',
    },
  ];

  // Add admin nav item if user is admin
  if (isAdmin) {
    navItems.push({
      name: 'Admin',
      label: 'Admin',
      icon: Shield,
      route: 'Admin',
    });
  }

  const handleNavPress = (route) => {
    navigate(route);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    navItemActive: {
      backgroundColor: paperTheme.colors.surfaceVariant,
    },
    label: {
      color: paperTheme.colors.onSurface,
    },
    labelActive: {
      color: paperTheme.colors.primary,
    },
    divider: {
      backgroundColor: paperTheme.colors.outline,
    },
  };

  const iconColor = paperTheme.colors.onSurfaceVariant;
  const activeIconColor = paperTheme.colors.primary;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <TouchableOpacity
          onPress={() => handleNavPress('Bytes')}
          activeOpacity={0.7}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Logo size="default" theme={isDark ? 'light' : 'dark'} />
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.name;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                isActive && [styles.navItemActive, dynamicStyles.navItemActive],
              ]}
              onPress={() => handleNavPress(item.route)}
              activeOpacity={0.7}
              accessibilityLabel={`Navigate to ${item.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <IconComponent
                size={24}
                color={isActive ? activeIconColor : iconColor}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <Text
                style={[
                  styles.navLabel,
                  dynamicStyles.label,
                  isActive && [styles.navLabelActive, dynamicStyles.labelActive],
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Section - Theme Toggle & Settings */}
      <View style={styles.bottomSection}>
        <View style={[styles.divider, dynamicStyles.divider]} />

        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          accessibilityRole="button"
        >
          {isDark ? (
            <Sun size={24} color={iconColor} strokeWidth={1.5} />
          ) : (
            <Moon size={24} color={iconColor} strokeWidth={1.5} />
          )}
          <Text style={[styles.navLabel, dynamicStyles.label]}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>

        {/* Settings (navigates to profile settings) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            navigate('Profile');
            // Small delay to navigate to settings within profile
            setTimeout(() => {
              navigate('ProfileSettings');
            }, 100);
          }}
          activeOpacity={0.7}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Settings size={24} color={iconColor} strokeWidth={1.5} />
          <Text style={[styles.navLabel, dynamicStyles.label]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: mukokoTheme.spacing.lg,
    paddingBottom: mukokoTheme.spacing.lg,
  },
  logoSection: {
    paddingHorizontal: mukokoTheme.spacing.lg,
    paddingBottom: mukokoTheme.spacing.xl,
  },
  navSection: {
    flex: 1,
    paddingHorizontal: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    gap: mukokoTheme.spacing.lg,
    minHeight: 52,
  },
  navItemActive: {
    borderRadius: mukokoTheme.roundness,
  },
  navLabel: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  navLabelActive: {
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  bottomSection: {
    paddingHorizontal: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
  },
});
