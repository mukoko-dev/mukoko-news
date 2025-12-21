import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Zap, ZapOff, Globe, Search, Compass, User, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import mukokoTheme from '../theme';
import AppHeader from '../components/AppHeader';
import ZimbabweFlagStrip from '../components/ZimbabweFlagStrip';
import CountryPickerButton from '../components/CountryPickerButton';
import { ResponsiveLayout, LeftSidebar, RightSidebar, BREAKPOINTS } from '../components/layout';
import { navigationRef } from './navigationRef';
import linking from './linking';
import SplashScreen from '../components/SplashScreen';
import localPreferences from '../services/LocalPreferencesService';

// Screens
import NewsBytesScreen from '../screens/NewsBytesScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import HomeScreen from '../screens/HomeScreen';
// Auth screens removed - authentication handled by OIDC (id.mukoko.com)

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

// Profile Stack (auth handled by OIDC - id.mukoko.com)
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
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
function MainTabs({ currentRoute }) {
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(false);
  const { isDark, theme } = useTheme();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      setIsTabletOrDesktop(width >= BREAKPOINTS.mobile);
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
      position: 'relative',
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
      paddingHorizontal: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 8,
    };
  };

  // Use consistent icon color with header (inverse theme color)
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: theme.colors['on-surface-variant'],
        tabBarStyle: getTabBarStyle(),
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: mukokoTheme.fonts.medium.fontFamily,
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
          marginBottom: 0,
        },
      }}
    >
      {/* 1. Bytes - Core feature, default landing */}
      <Tab.Screen
        name="Bytes"
        component={BytesStack}
        options={{
          tabBarLabel: 'Bytes',
          tabBarIcon: ({ color, focused }) => {
            const Icon = focused ? Zap : ZapOff;
            return <Icon size={24} color={color} />;
          },
        }}
      />

      {/* 2. Pulse - Country-specific feed */}
      <Tab.Screen
        name="Pulse"
        component={PulseStack}
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color }) => (
            <Globe size={24} color={color} />
          ),
        }}
      />

      {/* 3. Search (includes Insights when empty) */}
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => (
            <Search size={24} color={color} />
          ),
        }}
      />

      {/* 4. Discover - Now visible in tab bar */}
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => (
            <Compass size={24} color={color} />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} />
          ),
        }}
      />

      {/* Admin (admins only) */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => (
              <ShieldCheck size={24} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Helper to get current route from navigation state
function getRouteFromState(state) {
  if (!state) return 'Bytes';
  const currentRoute = state.routes?.[state.index];
  return currentRoute?.name || 'Bytes';
}

// Root Navigator
export default function AppNavigator() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Bytes');
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Global splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [splashShownBefore, setSplashShownBefore] = useState(null);
  const [splashLoading, setSplashLoading] = useState(true);

  // Check if splash was shown before on mount
  useEffect(() => {
    const checkSplashStatus = async () => {
      try {
        await localPreferences.init();
        const onboardingDone = await localPreferences.isOnboardingCompleted();
        setSplashShownBefore(onboardingDone);

        // If onboarding was already done, don't show splash
        if (onboardingDone) {
          setShowSplash(false);
        }

        setSplashLoading(false);
      } catch (error) {
        console.error('[AppNavigator] Failed to check splash status:', error);
        setSplashShownBefore(false);
        setSplashLoading(false);
      }
    };

    checkSplashStatus();
  }, []);

  // Track screen width for responsive layout
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isTabletOrDesktop = screenWidth >= BREAKPOINTS.mobile;

  // Track current route for sidebar highlighting
  const handleStateChange = useCallback((state) => {
    if (state) {
      setCurrentRoute(getRouteFromState(state));
    }
  }, []);

  // Handle splash close
  const handleSplashClose = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Handle preferences set from splash
  const handlePreferencesSet = useCallback(async (preferences) => {
    console.log('[AppNavigator] User preferences set:', preferences);
    // Preferences are already saved by SplashScreen component
  }, []);

  // Show global splash screen for first-time users
  if (showSplash && !splashLoading) {
    const shouldShowCustomization = !isAuthenticated && !splashShownBefore;

    return (
      <SplashScreen
        isLoading={splashLoading}
        loadingMessage="Loading Mukoko News..."
        showCustomization={shouldShowCustomization}
        onClose={handleSplashClose}
        onPreferencesSet={handlePreferencesSet}
      />
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        setIsNavigationReady(true);
        const state = navigationRef.getRootState();
        if (state) {
          setCurrentRoute(getRouteFromState(state));
        }
      }}
      onStateChange={handleStateChange}
      documentTitle={{
        formatter: (options, route) => {
          const routeName = route?.name;
          const baseTitle = 'Mukoko News';

          switch (routeName) {
            case 'BytesFeed':
              return `${baseTitle} - Africa's News, Your Way`;
            case 'ArticleDetail':
              return options?.title ? `${options.title} | ${baseTitle}` : baseTitle;
            case 'DiscoverFeed':
              return `Discover | ${baseTitle}`;
            case 'PulseFeed':
              return `Pulse | ${baseTitle}`;
            // InsightsFeed removed - insights now in SearchFeed
            case 'SearchFeed':
              return `Search | ${baseTitle}`;
            // Auth screens removed - handled by OIDC
            case 'AdminDashboard':
              return `Admin Dashboard | ${baseTitle}`;
            default:
              return baseTitle;
          }
        },
      }}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
        edges={['bottom']}
      >
        <ZimbabweFlagStrip />
        {/* Only show AppHeader on mobile - tablet/desktop uses sidebar */}
        {isNavigationReady && !isTabletOrDesktop && <AppHeader />}
        <ResponsiveLayout
          leftSidebar={<LeftSidebar currentRoute={currentRoute} />}
          rightSidebar={<RightSidebar />}
        >
          <MainTabs currentRoute={currentRoute} />
        </ResponsiveLayout>
      </SafeAreaView>
    </NavigationContainer>
  );
}
