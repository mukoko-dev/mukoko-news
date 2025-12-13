import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { Divider, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import mukokoTheme from '../theme';
import Logo from './Logo';

export default function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();

  // Show header icons on web (tablet/desktop) - mobile uses compact icons
  const [isDesktop, setIsDesktop] = useState(Platform.OS === 'web');

  // Get navigation - useNavigation works at NavigationContainer level
  const navigation = useNavigation();

  // Get current route name from navigation state (works outside screen context)
  // This is safer than useRoute() which requires being inside a screen
  const routeName = useNavigationState((state) => {
    if (!state || !state.routes || state.routes.length === 0) return 'Home';
    const currentRoute = state.routes[state.index];
    // For nested navigators, get the deepest route name
    if (currentRoute.state && currentRoute.state.routes) {
      const nestedRoute = currentRoute.state.routes[currentRoute.state.index];
      return nestedRoute?.name || currentRoute.name;
    }
    return currentRoute.name;
  });

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
    try {
      navigation.navigate('Search');
      setMenuVisible(false);
    } catch {
      // Navigation not available
    }
  };

  const handleProfilePress = () => {
    try {
      navigation.navigate('Profile');
      setMenuVisible(false);
    } catch {
      // Navigation not available
    }
  };

  const handleTrendingPress = () => {
    try {
      // Navigate to Discover screen which shows trending content
      navigation.navigate('Discover');
      setMenuVisible(false);
    } catch {
      // Navigation not available
    }
  };

  const handleNavigate = (screenName) => {
    try {
      navigation.navigate(screenName);
      setMenuVisible(false);
    } catch {
      // Navigation not available
    }
  };

  const menuItems = [
    { label: 'Home', icon: 'home', screen: 'Home' },
    { label: 'Discover', icon: 'compass', screen: 'Discover' },
    { label: 'NewsBytes', icon: 'play-circle', screen: 'Bytes' },
    { label: 'Search', icon: 'magnify', screen: 'Search' },
    { label: 'Profile', icon: 'account-circle', screen: 'Profile' },
  ];

  // Dynamic styles based on theme
  const dynamicStyles = {
    header: {
      backgroundColor: isDark ? theme.colors.background : paperTheme.colors.background,
    },
    screenTitle: {
      color: paperTheme.colors.onSurface,
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
            >
              <MaterialCommunityIcons
                name="menu"
                size={24}
                color={paperTheme.colors.onSurface}
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
              <Logo size="sm" theme={isDark ? 'light' : 'dark'} />
            ) : (
              <Text style={[styles.screenTitle, dynamicStyles.screenTitle]}>{screenTitle}</Text>
            )}
          </TouchableOpacity>

          {/* Spacer - pushes logo to center on mobile, actions to right on desktop */}
          <View style={styles.spacer} />

          {/* Action buttons - Always show on mobile and desktop */}
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
                color={paperTheme.colors.primary}
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
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>

            {/* Theme Toggle - Now functional */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.actionButton}
              activeOpacity={0.7}
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
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
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
