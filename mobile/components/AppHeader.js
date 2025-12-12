import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import mukokoTheme from '../theme';
import Logo from './Logo';

// Check if running on web platform
const isWeb = Platform.OS === 'web';

// Log platform for debugging
console.log('[AppHeader] Platform.OS:', Platform.OS, 'isWeb:', isWeb);

export default function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  // On web, always show header icons (no bottom tab bar on web)
  // On native mobile, hide icons (use bottom tab bar) unless tablet/desktop (768px+)
  // Default to true on web to ensure icons show immediately
  const [showHeaderActions, setShowHeaderActions] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      // On web: always show icons
      // On native: show only if tablet/desktop width
      setShowHeaderActions(isWeb || width >= 768);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  try {
    const navigation = useNavigation();
    const route = useRoute();

    // Don't show header on NewsBytes screen (full-screen experience)
    if (route.name === 'BytesFeed' || route.name === 'Bytes') {
      return null;
    }

    const handleSearchPress = () => {
      try {
        navigation.navigate('Search');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Search not available');
      }
    };

    const handleProfilePress = () => {
      try {
        navigation.navigate('Profile');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Profile not available');
      }
    };

    const handleTrendingPress = () => {
      try {
        // Navigate to Discover screen which shows trending content
        navigation.navigate('Discover');
        setMenuVisible(false);
      } catch (e) {
        console.log('Navigation to Discover not available');
      }
    };

    const handleNavigate = (screenName) => {
      try {
        navigation.navigate(screenName);
        setMenuVisible(false);
      } catch (e) {
        console.log(`Navigation to ${screenName} not available`);
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

          {/* Logo - clickable to go home */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => handleNavigate('Home')}
            activeOpacity={0.7}
          >
            <Logo size="sm" theme="dark" />
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
  } catch (error) {
    // If navigation context is not available, return a simple header
    return (
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo size="sm" />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: mukokoTheme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: mukokoTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outline,
  },
  hamburgerButton: {
    marginRight: mukokoTheme.spacing.sm,
    padding: 8,
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
    gap: 2,
  },
  actionButton: {
    padding: 8,
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
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: mukokoTheme.colors.outline,
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
