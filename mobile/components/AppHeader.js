import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import mukokoTheme from '../theme';
import Logo from './Logo';

export default function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  // On web, always show header icons (no bottom tab bar on web)
  // On native mobile, hide icons (use bottom tab bar) unless tablet/desktop (768px+)
  // Default to showing icons - web users need them, native will update via effect
  const [showHeaderActions, setShowHeaderActions] = useState(Platform.OS === 'web');

  // Get navigation - may be undefined if outside navigation context
  let navigation = null;
  let routeName = null;

  try {
    navigation = useNavigation();
    const route = useRoute();
    routeName = route?.name;
  } catch (e) {
    // Navigation context not available - that's ok, we can still render
  }

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      // On web: always show icons (no bottom tab bar)
      // On native: show only if tablet/desktop width (768px+)
      const isWeb = Platform.OS === 'web';
      setShowHeaderActions(isWeb || width >= 768);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  // Don't show header on NewsBytes screen (full-screen experience)
  if (routeName === 'BytesFeed' || routeName === 'Bytes') {
    return null;
  }

  // Screen title mapping
  const getScreenTitle = (route) => {
    const titles = {
      Home: null, // Show logo instead
      Discover: 'Discover',
      Search: 'Search',
      Profile: 'Profile',
      ArticleDetail: 'Article',
      Login: 'Sign In',
      Register: 'Create Account',
      ForgotPassword: 'Reset Password',
      Settings: 'Settings',
      UserProfile: 'Profile',
    };
    return titles[route] ?? null;
  };

  const screenTitle = getScreenTitle(routeName);
  const showLogo = !screenTitle; // Show logo when no title (Home screen)

  const handleSearchPress = () => {
    if (navigation) {
      try {
        navigation.navigate('Search');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Search not available');
      }
    }
  };

  const handleProfilePress = () => {
    if (navigation) {
      try {
        navigation.navigate('Profile');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Profile not available');
      }
    }
  };

  const handleTrendingPress = () => {
    if (navigation) {
      try {
        // Navigate to Discover screen which shows trending content
        navigation.navigate('Discover');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Discover not available');
      }
    }
  };

  const handleNavigate = (screenName) => {
    if (navigation) {
      try {
        navigation.navigate(screenName);
        setMenuVisible(false);
      } catch (e) {
        console.log(`Navigation to ${screenName} not available`);
      }
    }
  };

  const menuItems = [
    { label: 'Home', icon: 'home', screen: 'Home' },
    { label: 'Discover', icon: 'compass', screen: 'Discover' },
    { label: 'NewsBytes', icon: 'play-circle', screen: 'Bytes' },
    { label: 'Search', icon: 'magnify', screen: 'Search' },
    { label: 'Profile', icon: 'account-circle', screen: 'Profile' },
  ];

  return (
      <>
        <View style={styles.header}>
          {/* Hamburger Menu Button - Web/Tablet/Desktop Only */}
          {showHeaderActions && (
            <TouchableOpacity
              onPress={() => setMenuVisible(!menuVisible)}
              style={styles.hamburgerButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="menu"
                size={24}
                color={mukokoTheme.colors.onSurface}
              />
            </TouchableOpacity>
          )}

          {/* Logo or Screen Title */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => handleNavigate('Home')}
            activeOpacity={0.7}
          >
            {showLogo ? (
              <Logo size="sm" theme="dark" />
            ) : (
              <Text style={styles.screenTitle}>{screenTitle}</Text>
            )}
          </TouchableOpacity>

          {/* Spacer - pushes logo to center on mobile, actions to right on desktop */}
          <View style={styles.spacer} />

          {/* Action buttons - Show on Web/Tablet/Desktop (mobile uses bottom tab bar) */}
          {showHeaderActions && (
            <View style={styles.actions}>
              {/* Trending/Insights Icon - highlighted in brand color */}
              <TouchableOpacity
                onPress={handleTrendingPress}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={22}
                  color={mukokoTheme.colors.primary}
                />
              </TouchableOpacity>

              {/* Search Icon */}
              <TouchableOpacity
                onPress={handleSearchPress}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color={mukokoTheme.colors.onSurface}
                />
              </TouchableOpacity>

              {/* Theme Toggle (visual placeholder - future implementation) */}
              <TouchableOpacity
                onPress={() => {
                  // Theme toggle will be implemented with ThemeContext
                  console.log('Theme toggle - feature coming soon');
                }}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="white-balance-sunny"
                  size={22}
                  color={mukokoTheme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>

              {/* Profile/Login Icon */}
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={22}
                  color={mukokoTheme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dropdown Menu for Web/Tablet/Desktop */}
        {showHeaderActions && (
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
              <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.screen}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuIcon}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={mukokoTheme.colors.primary}
                        />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
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
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    color: mukokoTheme.colors.onSurface,
    letterSpacing: -0.3,
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
    padding: 10,
    marginHorizontal: 2,
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
