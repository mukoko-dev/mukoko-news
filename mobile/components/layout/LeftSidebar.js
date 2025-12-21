import React from 'react';
import { View, Pressable, Text as RNText } from 'react-native';
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
import Logo from '../Logo';
import CountryPickerButton from '../CountryPickerButton';

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
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function LeftSidebar({ currentRoute }) {
  const { isDark, toggleTheme, theme } = useTheme();
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

  // Use inverse theme color for icons
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  const activeIconColor = theme.colors.tanzanite;

  return (
    <View className="flex-1 pt-lg pb-lg" style={{ backgroundColor: theme.colors.background }}>
      {/* Logo Section */}
      <View className="px-lg pb-xl">
        <Pressable
          onPress={() => handleNavPress('Bytes')}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Logo size="md" theme={isDark ? 'light' : 'dark'} />
        </Pressable>
      </View>

      {/* Navigation Items */}
      <View className="flex-1 px-sm gap-xs">
        {navItems.map((item) => {
          const isActive = activeRoute === item.name;
          const IconComponent = item.icon;

          // Special handling for Pulse - show country picker instead
          if (item.name === 'Pulse') {
            return (
              <View
                key={item.name}
                className={`flex-row items-center py-md px-md rounded-button gap-lg min-h-[52px] ${
                  isActive ? 'bg-surface-variant' : ''
                }`}
              >
                <CountryPickerButton compact={false} showLabel={true} />
              </View>
            );
          }

          return (
            <Pressable
              key={item.name}
              className={`flex-row items-center py-md px-md rounded-button gap-lg min-h-[52px] ${
                isActive ? 'bg-surface-variant' : ''
              }`}
              onPress={() => handleNavPress(item.route)}
              accessibilityLabel={`Navigate to ${item.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <IconComponent
                size={24}
                color={isActive ? activeIconColor : iconColor}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <RNText
                className={`text-[15px] ${
                  isActive ? 'font-sans-bold' : 'font-sans'
                }`}
                style={{ color: isActive ? theme.colors.tanzanite : theme.colors['on-surface'] }}
              >
                {item.label}
              </RNText>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Section - Theme Toggle & Settings */}
      <View className="px-sm gap-xs">
        <View className="h-[1px] mx-md mb-md" style={{ backgroundColor: theme.colors.outline }} />

        {/* Theme Toggle */}
        <Pressable
          className="flex-row items-center py-md px-md rounded-button gap-lg min-h-[52px]"
          onPress={toggleTheme}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          accessibilityRole="button"
        >
          {isDark ? (
            <Sun size={24} color={iconColor} strokeWidth={1.5} />
          ) : (
            <Moon size={24} color={iconColor} strokeWidth={1.5} />
          )}
          <RNText className="text-[15px] font-sans" style={{ color: theme.colors['on-surface'] }}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </RNText>
        </Pressable>

        {/* Settings (navigates to profile settings) */}
        <Pressable
          className="flex-row items-center py-md px-md rounded-button gap-lg min-h-[52px]"
          onPress={() => {
            // Navigate to ProfileSettings screen within Profile tab
            navigationRef.navigate('Profile', {
              screen: 'ProfileSettings',
            });
          }}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Settings size={24} color={iconColor} strokeWidth={1.5} />
          <RNText className="text-[15px] font-sans" style={{ color: theme.colors['on-surface'] }}>
            Settings
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
