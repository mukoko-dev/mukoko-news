import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

/**
 * Admin Header Component
 * Provides secondary navigation for admin screens
 * Responsive: horizontal tabs on mobile, sidebar-like on tablet/web
 */
export default function AdminHeader({ navigation, currentScreen }) {
  const theme = useTheme();
  const isWideScreen = width >= 768;

  const navItems = [
    { screen: 'AdminDashboard', label: 'Dashboard', icon: 'view-dashboard' },
    { screen: 'AdminUsers', label: 'Users', icon: 'account-group' },
    { screen: 'AdminSources', label: 'Sources', icon: 'rss' },
    { screen: 'AdminAnalytics', label: 'Analytics', icon: 'chart-line' },
    { screen: 'AdminSystem', label: 'System', icon: 'cog' },
  ];

  const NavItem = ({ item }) => {
    const isActive = currentScreen === item.screen;

    return (
      <TouchableRipple
        onPress={() => navigation.navigate(item.screen)}
        style={[
          styles.navItem,
          isWideScreen && styles.navItemWide,
          isActive && {
            backgroundColor: theme.colors.primaryContainer,
            borderBottomColor: theme.colors.primary,
            borderBottomWidth: isWideScreen ? 0 : 3,
          },
        ]}
        rippleColor={theme.colors.primary + '20'}
      >
        <View style={styles.navItemContent}>
          <MaterialCommunityIcons
            name={item.icon}
            size={isWideScreen ? 20 : 22}
            color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text
            variant={isWideScreen ? 'labelMedium' : 'labelSmall'}
            style={[
              styles.navLabel,
              { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant },
              isActive && { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      {/* Admin Title - only on wide screens */}
      {isWideScreen && (
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="shield-crown"
            size={20}
            color={theme.colors.primary}
          />
          <Text variant="titleSmall" style={{ fontWeight: '700', marginLeft: 8 }}>
            Admin Panel
          </Text>
        </View>
      )}

      {/* Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.navContainer,
          isWideScreen && styles.navContainerWide,
        ]}
      >
        {navItems.map((item) => (
          <NavItem key={item.screen} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
      },
    }),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  navContainerWide: {
    paddingHorizontal: 16,
    gap: 8,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    minWidth: 70,
  },
  navItemWide: {
    borderRadius: 8,
    minWidth: 100,
  },
  navItemContent: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    textAlign: 'center',
  },
});
