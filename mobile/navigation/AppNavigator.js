import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import AppHeader from '../components/AppHeader';
import ZimbabweFlagStrip from '../components/ZimbabweFlagStrip';
import { navigationRef } from './navigationRef';
import linking from './linking';

// Screens
import NewsBytesScreen from '../screens/NewsBytesScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import HomeScreen from '../screens/HomeScreen';
// InsightsScreen removed - insights now integrated into SearchScreen

// Admin Screens
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminSourcesScreen,
  AdminAnalyticsScreen,
  AdminSystemScreen,
} from '../screens/admin';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bytes Stack (core feature - default landing)
function BytesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BytesFeed" component={NewsBytesScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// Discover Stack (header-only access)
function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverFeed" component={DiscoverScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// Search Stack
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchFeed" component={SearchScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// Insights Stack removed - insights now integrated into SearchScreen

// Pulse Stack (personalized feed - header access only)
function PulseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PulseFeed" component={HomeScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// Profile/Auth Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack (protected)
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminSources" component={AdminSourcesScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
      <Stack.Screen name="AdminSystem" component={AdminSystemScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
// Pattern: Bytes (default) → Search → Profile [+ Admin]
// Discover is header-only (hamburger menu)
// Insights is integrated into Search (shows when search is empty)
function MainTabs() {
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(false);
  const { isDark } = useTheme();
  const paperTheme = usePaperTheme();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      setIsTabletOrDesktop(width >= 768);
    };
    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  const getTabBarStyle = () => {
    if (isTabletOrDesktop) {
      return { display: 'none' };
    }
    return {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderRadius: 24,
      height: 72,
      paddingBottom: 8,
      paddingTop: 8,
      borderWidth: 1,
      borderColor: paperTheme.colors.glassBorder || paperTheme.colors.outline,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
    };
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
        tabBarStyle: getTabBarStyle(),
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: mukokoTheme.fonts.medium.fontFamily,
          marginTop: 2,
        },
      }}
    >
      {/* 1. Bytes - Core feature, default landing */}
      <Tab.Screen
        name="Bytes"
        component={BytesStack}
        options={{
          tabBarLabel: 'Bytes',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'lightning-bolt' : 'lightning-bolt-outline'}
              size={26}
              color={focused ? mukokoTheme.colors.accent : color}
            />
          ),
        }}
      />

      {/* 2. Search (includes Insights when empty) */}
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Discover - Hidden tab for navigation purposes */}
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      {/* 5. Pulse - Hidden tab for personalized feed */}
      <Tab.Screen
        name="Pulse"
        component={PulseStack}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />

      {/* 6. Admin (admins only) */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'shield-crown' : 'shield-crown-outline'}
                size={24}
                color={focused ? mukokoTheme.colors.accent : color}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const paperTheme = usePaperTheme();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setIsNavigationReady(true)}
      documentTitle={{
        formatter: (options, route) => {
          const routeName = route?.name;
          const baseTitle = 'Mukoko News';

          switch (routeName) {
            case 'BytesFeed':
              return `${baseTitle} - Zimbabwe's News, Your Way`;
            case 'ArticleDetail':
              return options?.title ? `${options.title} | ${baseTitle}` : baseTitle;
            case 'DiscoverFeed':
              return `Discover | ${baseTitle}`;
            case 'PulseFeed':
              return `Pulse | ${baseTitle}`;
            // InsightsFeed removed - insights now in SearchFeed
            case 'SearchFeed':
              return `Search | ${baseTitle}`;
            case 'Login':
              return `Sign In | ${baseTitle}`;
            case 'Register':
              return `Create Account | ${baseTitle}`;
            case 'AdminDashboard':
              return `Admin Dashboard | ${baseTitle}`;
            default:
              return baseTitle;
          }
        },
      }}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        edges={['bottom']}
      >
        <ZimbabweFlagStrip />
        {isNavigationReady && <AppHeader />}
        <View style={styles.content}>
          <MainTabs />
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
