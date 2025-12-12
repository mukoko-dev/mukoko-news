import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import mukokoTheme from '../theme';
import AppHeader from '../components/AppHeader';
import ZimbabweFlagStrip from '../components/ZimbabweFlagStrip';

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

// Discover Stack (trending/featured)
function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DiscoverFeed" component={DiscoverScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
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

// Main Tab Navigator - 5 Tabs (Modern Mobile Pattern)
// Pattern: Home, Discover, Bytes (Center/Featured), Search, Profile
function MainTabs() {
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      setIsTabletOrDesktop(width >= 768);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: mukokoTheme.colors.primary,
        tabBarInactiveTintColor: mukokoTheme.colors.onSurfaceVariant,
        tabBarStyle: isTabletOrDesktop ? { display: 'none' } : {
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          backgroundColor: mukokoTheme.colors.surface,
          borderRadius: 24,
          height: 64,
          paddingBottom: 0,
          paddingTop: 4,
          borderWidth: 1,
          borderColor: mukokoTheme.colors.outlineVariant,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          paddingHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: mukokoTheme.fonts.medium.fontFamily,
          marginTop: 2,
          marginBottom: 6,
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

      {/* 2. Discover Tab - Explore/Trending content */}
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'fire' : 'fire'}
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
    </Tab.Navigator>
  );
}

// Root Navigator with Global Header and Footer
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
    backgroundColor: mukokoTheme.colors.background,
  },
  content: {
    flex: 1,
  },
});
