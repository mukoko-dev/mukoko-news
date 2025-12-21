import React from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  Platform,
  Pressable,
  Text as RNText,
} from 'react-native';
import {
  LayoutDashboard,
  Users,
  Rss,
  LineChart,
  Settings,
  Shield,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * Admin Header Component
 * Provides secondary navigation for admin screens
 * Responsive: horizontal tabs on mobile, sidebar-like on tablet/web
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminHeader({ navigation, currentScreen }) {
  const theme = useTheme();
  const isWideScreen = width >= 768;

  const navItems = [
    { screen: 'AdminDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { screen: 'AdminUsers', label: 'Users', icon: Users },
    { screen: 'AdminSources', label: 'Sources', icon: Rss },
    { screen: 'AdminAnalytics', label: 'Analytics', icon: LineChart },
    { screen: 'AdminSystem', label: 'System', icon: Settings },
  ];

  const NavItem = ({ item }) => {
    const isActive = currentScreen === item.screen;
    const Icon = item.icon;

    return (
      <Pressable
        onPress={() => navigation.navigate(item.screen)}
        className={`
          px-lg py-md min-w-[70px]
          ${isWideScreen ? 'rounded-lg min-w-[100px]' : 'rounded-none'}
          ${isActive ? 'bg-tanzanite/10 border-b-[3px] border-b-tanzanite' : ''}
          ${isWideScreen && isActive ? 'border-b-0' : ''}
        `}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`${item.label} tab`}
      >
        <View className="items-center gap-[4px]">
          <Icon
            size={isWideScreen ? 20 : 22}
            color={isActive ? theme.colors.tanzanite : theme.colors['on-surface-variant']}
          />
          <RNText
            className={`
              text-center
              ${isWideScreen ? 'text-label-medium' : 'text-label-small'}
              ${isActive ? 'font-sans-bold text-tanzanite' : 'font-sans text-on-surface-variant'}
            `}
            numberOfLines={1}
          >
            {item.label}
          </RNText>
        </View>
      </Pressable>
    );
  };

  const containerClasses = `
    border-b border-outline-variant bg-surface
    ${Platform.OS === 'web' ? 'sticky top-0 z-[100]' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <View className={containerClasses}>
      {/* Admin Title - only on wide screens */}
      {isWideScreen && (
        <View className="flex-row items-center px-lg pt-md pb-sm">
          <Shield size={20} color={theme.colors.tanzanite} />
          <RNText className="font-sans-bold text-title-small ml-sm">
            Admin Panel
          </RNText>
        </View>
      )}

      {/* Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          paddingHorizontal: isWideScreen ? 16 : 8,
          gap: isWideScreen ? 8 : 0,
        }}
      >
        {navItems.map((item) => (
          <NavItem key={item.screen} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
