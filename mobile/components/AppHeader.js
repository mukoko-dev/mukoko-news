import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, Platform, Linking } from 'react-native';
import { Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { navigate } from '../navigation/navigationRef';
import { useTheme } from '../contexts/ThemeContext';
import mukokoTheme from '../theme';
import Logo from './Logo';

export default function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();

  // Show header icons on web (tablet/desktop) - mobile uses compact icons
  const [isDesktop, setIsDesktop] = useState(Platform.OS === 'web');

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      // Desktop mode for full header actions with hamburger menu
      const isWeb = Platform.OS === 'web';
      setIsDesktop(isWeb && width >= 768);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  // Always show logo in header (route-independent for stability)

  // Navigation handlers
  const handleBytesPress = () => navigate('Bytes');
  const handleDiscoverPress = () => navigate('Discover');
  const handleSearchPress = () => navigate('Search');
  const handleInsightsPress = () => navigate('Insights');
  const handleProfilePress = () => navigate('Profile');
  const handleNavigate = (screenName) => {
    navigate(screenName);
    setMenuVisible(false);
  };

  // Hamburger menu items - Discover featured since it's header-only
  const menuItems = [
    { label: 'Bytes', icon: 'lightning-bolt-outline', screen: 'Bytes', path: '/' },
    { label: 'Discover', icon: 'compass-outline', screen: 'Discover', path: '/discover' },
    { label: 'Search', icon: 'magnify', screen: 'Search', path: '/search' },
    { label: 'Insights', icon: 'chart-line', screen: 'Insights', path: '/insights' },
    { label: 'Profile', icon: 'account-circle-outline', screen: 'Profile', path: '/profile' },
  ];

  // Handle navigation with proper URL updates on web
  const handleMenuNavigate = (item) => {
    setMenuVisible(false);

    // On web, update the URL
    if (Platform.OS === 'web' && item.path) {
      window.history.pushState({}, '', item.path);
    }

    // Handle nested navigation (e.g., Insights inside Discover stack)
    if (item.nested) {
      navigate(item.screen, { screen: item.nested });
    } else {
      navigate(item.screen);
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    header: {
      backgroundColor: isDark ? theme.colors.background : paperTheme.colors.background,
    },
    menuContainer: {
      backgroundColor: isDark ? 'rgba(45, 45, 52, 0.95)' : paperTheme.colors.surface,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      borderWidth: isDark ? 1 : 0,
    },
    menuLabel: {
      color: paperTheme.colors.onSurface,
    },
  };

  return (
      <>
        <View style={[styles.header, dynamicStyles.header]}>
          {/* Hamburger Menu Button - Desktop Only */}
          {isDesktop && (
            <TouchableOpacity
              onPress={() => setMenuVisible(!menuVisible)}
              style={styles.hamburgerButton}
              activeOpacity={0.7}
              accessibilityLabel={menuVisible ? 'Close navigation menu' : 'Open navigation menu'}
              accessibilityRole="button"
              accessibilityState={{ expanded: menuVisible }}
            >
              <MaterialCommunityIcons
                name="menu"
                size={24}
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>
          )}

          {/* Logo - Taps go to Bytes (home/default) */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={handleBytesPress}
            activeOpacity={0.7}
          >
            <Logo size="sm" theme={isDark ? 'light' : 'dark'} />
          </TouchableOpacity>

          {/* Spacer - pushes logo to center on mobile, actions to right on desktop */}
          <View style={styles.spacer} />

          {/* Action buttons - Always show on mobile and desktop */}
          <View style={styles.actions}>
            {/* Discover Icon - Header-only access to browse content */}
            <TouchableOpacity
              onPress={handleDiscoverPress}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityLabel="Browse and discover content"
              accessibilityRole="button"
              accessibilityHint="Navigate to discover screen"
            >
              <MaterialCommunityIcons
                name="compass-outline"
                size={22}
                color={paperTheme.colors.primary}
              />
            </TouchableOpacity>

            {/* Search Icon */}
            <TouchableOpacity
              onPress={handleSearchPress}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityLabel="Search articles"
              accessibilityRole="button"
              accessibilityHint="Navigate to search screen"
            >
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>

            {/* Theme Toggle - Now functional */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              accessibilityRole="button"
              accessibilityHint="Toggles between light and dark color themes"
            >
              <MaterialCommunityIcons
                name={isDark ? 'weather-sunny' : 'weather-night'}
                size={22}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {/* Profile/Login Icon */}
            <TouchableOpacity
              onPress={handleProfilePress}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityLabel="View profile"
              accessibilityRole="button"
              accessibilityHint="Navigate to your profile and account settings"
            >
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={22}
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Menu for Desktop */}
        {isDesktop && (
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <View style={[styles.menuContainer, dynamicStyles.menuContainer]}>
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.screen}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuNavigate(item)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Navigate to ${item.label}`}
                      accessibilityRole="link"
                      accessibilityHint={`Opens the ${item.label.toLowerCase()} page`}
                    >
                      <View style={styles.menuIcon}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={paperTheme.colors.primary}
                        />
                      </View>
                      <Text style={[styles.menuLabel, dynamicStyles.menuLabel]}>{item.label}</Text>
                    </TouchableOpacity>
                    {index < menuItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: mukokoTheme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: mukokoTheme.spacing.md,
    // No border - seamless design
  },
  hamburgerButton: {
    marginRight: mukokoTheme.spacing.sm,
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 12,
    marginHorizontal: 0,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    backgroundColor: mukokoTheme.colors.surface,
    borderRadius: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.md,
    minHeight: 44, // WCAG touch target minimum
  },
  menuIcon: {
    marginRight: mukokoTheme.spacing.sm,
    width: 24,
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
});
