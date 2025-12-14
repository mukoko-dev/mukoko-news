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
import HomeScreen from '../screens/HomeScreen';
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
import InsightsScreen from '../screens/InsightsScreen';

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

// Home Stack (includes home and article details)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// NewsBytes Stack
function BytesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BytesFeed" component={NewsBytesScreen} />
    </Stack.Navigator>
  );
}

// Search Stack
function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SearchFeed" component={SearchScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

// Discover Stack (trending/featured/insights)
function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="InsightsFeed" component={InsightsScreen} />
      <Stack.Screen name="DiscoverFeed" component={DiscoverScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="SearchFeed" component={SearchScreen} />
    </Stack.Navigator>
  );
}

// Profile/Auth Stack
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack (protected - only visible to admins)
function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminSources" component={AdminSourcesScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
      <Stack.Screen name="AdminSystem" component={AdminSystemScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator - 5 Tabs (Modern Mobile Pattern) + Admin tab for admins
// Pattern: Home, Discover, Bytes (Center/Featured), Search, Profile, [Admin]
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

  // Dynamic tab bar styles based on theme - using glass effect colors
  const getTabBarStyle = () => {
    if (isTabletOrDesktop) {
      return { display: 'none' };
    }

    return {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      // Glass effect with purple tinge from theme
      backgroundColor: paperTheme.colors.glassCard || paperTheme.colors.surface,
      borderRadius: 24,
      height: 76,  // Increased from 64 to 76 for better text display
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
          paddingVertical: 6,
          paddingHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12, // Increased from 11 for WCAG readability
          fontFamily: mukokoTheme.fonts.medium.fontFamily,
          marginTop: 4,
          marginBottom: 4,
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Insights Tab - Analytics/Trending content */}
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chart-line' : 'chart-line-variant'}
              size={24}
              color={focused ? mukokoTheme.colors.accent : color}
            />
          ),
        }}
      />

      {/* 3. NewsBytes Tab (Center - Featured) */}
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

      {/* 4. Search Tab */}
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'magnify' : 'magnify'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Profile Tab */}
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

      {/* 6. Admin Tab (only for admins) */}
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

// Root Navigator with Global Header and Footer
export default function AppNavigator() {
  const paperTheme = usePaperTheme();

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      documentTitle={{
        formatter: (options, route) => {
          // Custom page titles for SEO
          const routeName = route?.name;
          const baseTitle = 'Mukoko News';

          switch (routeName) {
            case 'HomeFeed':
              return `${baseTitle} - Zimbabwe's News, Your Way`;
            case 'ArticleDetail':
              return options?.title ? `${options.title} | ${baseTitle}` : baseTitle;
            case 'InsightsFeed':
              return `Insights | ${baseTitle}`;
            case 'BytesFeed':
              return `NewsBytes | ${baseTitle}`;
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
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background }
        ]}
        edges={['bottom']}
      >
        <ZimbabweFlagStrip />
        <AppHeader />
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
