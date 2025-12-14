/**
 * SplashScreen Component
 * Initial loading screen with Mukoko News branding and feature hints
 *
 * Displays:
 * - Mukoko News logo and tagline
 * - Brief description of the app
 * - Feature hints (Login, Insights)
 * - Loading indicator
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Text, ActivityIndicator, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, layout } from '../styles/globalStyles';
import mukokoTheme from '../theme';
import ZimbabweFlagStrip from './ZimbabweFlagStrip';

// Logo asset
const MukokoLogo = require('../assets/mukoko-logo-compact.png');

/**
 * Feature hint item for the splash screen
 */
function FeatureHint({ icon, title, description, color, delay = 0 }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.featureHint, { opacity: fadeAnim }]}
      accessibilityRole="text"
    >
      <View style={[styles.featureIcon, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
}

/**
 * SplashScreen - Initial loading screen with branding
 *
 * @param {boolean} isLoading - Whether to show loading indicator
 * @param {string} loadingMessage - Custom loading message
 * @param {boolean} showFeatures - Whether to show feature hints
 */
export default function SplashScreen({
  isLoading = true,
  loadingMessage = 'Loading news...',
  showFeatures = true,
}) {
  const paperTheme = usePaperTheme();
  const [logoAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate logo entrance
    Animated.spring(logoAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      {/* Zimbabwe Flag Strip at top */}
      <ZimbabweFlagStrip />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo and Tagline */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={MukokoLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Mukoko News logo"
          />
          <Text
            style={[styles.brandName, { color: paperTheme.colors.onSurface }]}
            accessibilityRole="header"
          >
            Mukoko News
          </Text>
          <Text
            style={[styles.tagline, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Zimbabwe's News, Your Way
          </Text>
        </Animated.View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}>
            Stay informed with news from 30+ trusted Zimbabwe sources,
            all in one place. Curated for you.
          </Text>
        </View>

        {/* Feature Hints */}
        {showFeatures && (
          <View style={styles.featuresSection}>
            <FeatureHint
              icon="account-circle"
              title="Create an Account"
              description="Personalized feed, save articles, and sync across devices"
              color={mukokoTheme.colors.primary}
              delay={200}
            />
            <FeatureHint
              icon="chart-line"
              title="Discover Insights"
              description="Trending topics, analytics, and what Zimbabwe is reading"
              color={mukokoTheme.colors.accent}
              delay={400}
            />
            <FeatureHint
              icon="lightning-bolt"
              title="NewsBytes"
              description="Swipe through quick news summaries, TikTok-style"
              color={mukokoTheme.colors.success}
              delay={600}
            />
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator
              size="small"
              color={paperTheme.colors.primary}
            />
            <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
              {loadingMessage}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Gradient */}
      <LinearGradient
        colors={[`${paperTheme.colors.background}00`, paperTheme.colors.background]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Powered by Nyuchi Tech • Made in Zimbabwe 🇿🇼
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  brandName: {
    ...typography.displayMedium,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.titleMedium,
    textAlign: 'center',
  },

  // Description
  descriptionSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  description: {
    ...typography.bodyLarge,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 26,
  },

  // Features Section
  featuresSection: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.titleSmall,
    color: mukokoTheme.colors.onSurface,
    marginBottom: 2,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: mukokoTheme.colors.onSurfaceVariant,
  },

  // Loading Section
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
  },

  // Bottom Gradient
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySmall,
  },
});
