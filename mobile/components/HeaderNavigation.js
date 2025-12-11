import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Appbar, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import mukokoTheme from '../theme';

// Import logo image
const logoIcon = require('../assets/mukoko-logo-compact.png');

/**
 * Mukoko News Header Navigation Component
 *
 * Top navigation bar with logo, search, insights, and profile actions
 * Designed for both mobile and desktop web views
 *
 * Props:
 * - navigation: React Navigation object
 * - currentRoute: Current route name
 * - isAuthenticated: Boolean for auth state
 * - onSearchPress: Callback for search action
 * - onInsightsPress: Callback for insights/trending action
 * - showBack: Show back button (optional)
 * - title: Custom title text (optional, overrides logo)
 */
export default function HeaderNavigation({
  navigation,
  currentRoute = 'Home',
  isAuthenticated = false,
  onSearchPress,
  onInsightsPress,
  showBack = false,
  title,
}) {
  const handleHomePress = () => {
    navigation.navigate('Home');
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleInsightsPress = () => {
    if (onInsightsPress) {
      onInsightsPress();
    } else {
      navigation.navigate('Discover');
    }
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Login');
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={mukokoTheme.colors.primary}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Appbar.Header style={styles.header} elevated>
          {/* Back Button (conditional) */}
          {showBack ? (
            <Appbar.BackAction
              onPress={handleBackPress}
              color={mukokoTheme.colors.onPrimary}
            />
          ) : null}

          {/* Logo or Title */}
          {title ? (
            <Appbar.Content
              title={title}
              titleStyle={styles.titleText}
              color={mukokoTheme.colors.onPrimary}
            />
          ) : (
            <TouchableOpacity
              onPress={handleHomePress}
              activeOpacity={0.7}
              accessible
              accessibilityLabel="Go to home"
              style={styles.logoContainer}
            >
              <Image
                source={logoIcon}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Mukoko</Text>
              <Text style={styles.flagEmoji}>🇿🇼</Text>
            </TouchableOpacity>
          )}

          {/* Spacer to push actions to right */}
          <View style={styles.spacer} />

          {/* Actions */}
          <View style={styles.actions}>
            {/* Trending/Insights Button */}
            <IconButton
              icon="chart-line"
              iconColor={mukokoTheme.colors.onPrimary}
              size={22}
              onPress={handleInsightsPress}
              accessible
              accessibilityLabel="View trending news"
              style={styles.iconButton}
            />

            {/* Search Button */}
            <IconButton
              icon="magnify"
              iconColor={mukokoTheme.colors.onPrimary}
              size={22}
              onPress={handleSearchPress}
              accessible
              accessibilityLabel="Search news"
              style={styles.iconButton}
            />

            {/* Profile/Auth Button */}
            <IconButton
              icon={isAuthenticated ? 'account-circle' : 'account-circle-outline'}
              iconColor={mukokoTheme.colors.onPrimary}
              size={22}
              onPress={handleProfilePress}
              accessible
              accessibilityLabel={
                isAuthenticated ? 'View profile' : 'Sign in'
              }
              style={styles.iconButton}
            />
          </View>
        </Appbar.Header>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: mukokoTheme.colors.primary,
  },
  header: {
    backgroundColor: mukokoTheme.colors.primary,
    elevation: 4,
    paddingHorizontal: mukokoTheme.spacing.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.xs,
    paddingHorizontal: mukokoTheme.spacing.sm,
    gap: mukokoTheme.spacing.xs,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoText: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: mukokoTheme.colors.onPrimary,
    letterSpacing: -0.3,
  },
  flagEmoji: {
    fontSize: 16,
    marginLeft: 2,
  },
  titleText: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    fontWeight: mukokoTheme.fonts.serifBold.fontWeight,
    color: mukokoTheme.colors.onPrimary,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
  },
});
