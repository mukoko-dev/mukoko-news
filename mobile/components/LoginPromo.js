/**
 * LoginPromo Component
 * Encourages users to sign up/login to access unlimited articles
 * Uses ACCENT color (terracotta) for promo identity
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import mukokoTheme from '../theme';

/**
 * LoginPromo - Encourages user registration/login
 * Uses ACCENT (terracotta) color for unique promo identity
 *
 * @param {string} variant - 'full' | 'compact' | 'minimal' | 'banner'
 * @param {Function} onLoginPress - Optional callback when login is pressed
 * @param {Function} onSignUpPress - Optional callback when sign up is pressed
 * @param {number} articleLimit - Number of free articles (default: 20)
 */
export default function LoginPromo({
  variant = 'full',
  onLoginPress,
  onSignUpPress,
  articleLimit = 20,
  style,
}) {
  const navigation = useNavigation();
  const paperTheme = usePaperTheme();

  // Accent-tinted glass colors (terracotta) for promo identity
  const accentGlass = {
    background: paperTheme.colors.glassAccentCard || paperTheme.colors.surface,
    border: paperTheme.colors.glassAccentBorder || paperTheme.colors.outline,
    chip: paperTheme.colors.glassAccent || 'rgba(212, 99, 74, 0.08)',
    chipBorder: paperTheme.colors.glassAccentBorder || 'rgba(212, 99, 74, 0.15)',
  };

  // Use accent/tertiary color for buttons
  const accentColor = paperTheme.colors.tertiary || paperTheme.colors.accent;

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      // Navigate to Profile tab, then Login screen (nested navigation)
      navigation.navigate('Profile', { screen: 'Login' });
    }
  };

  const handleSignUp = () => {
    if (onSignUpPress) {
      onSignUpPress();
    } else {
      // Navigate to Profile tab, then Register screen (nested navigation)
      navigation.navigate('Profile', { screen: 'Register' });
    }
  };

  // Banner variant - slim banner at bottom of feed
  if (variant === 'banner') {
    return (
      <View style={[
        styles.bannerContainer,
        {
          backgroundColor: accentColor,
        },
        style
      ]}>
        <View style={styles.bannerContent}>
          <MaterialCommunityIcons
            name="lock-open-outline"
            size={20}
            color={paperTheme.colors.onTertiary}
          />
          <Text style={[styles.bannerText, { color: paperTheme.colors.onTertiary }]}>
            Sign up for unlimited access
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bannerButton, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
          onPress={handleSignUp}
          activeOpacity={0.7}
          accessibilityLabel="Join for free"
          accessibilityRole="button"
          accessibilityHint="Create a free account for unlimited access"
        >
          <Text style={[styles.bannerButtonText, { color: paperTheme.colors.onTertiary }]}>
            Join Free
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Minimal variant - inline prompt
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[
          styles.minimalContainer,
          {
            backgroundColor: accentGlass.chip,
            borderWidth: 1,
            borderColor: accentGlass.chipBorder,
          },
          style
        ]}
        onPress={handleSignUp}
        activeOpacity={0.7}
        accessibilityLabel="Create account for unlimited articles"
        accessibilityRole="button"
        accessibilityHint="Sign up to access unlimited news articles"
      >
        <MaterialCommunityIcons
          name="account-plus"
          size={20}
          color={accentColor}
        />
        <Text style={[styles.minimalText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Create account for unlimited articles
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={paperTheme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    );
  }

  // Compact variant - card with stats
  if (variant === 'compact') {
    return (
      <View style={[
        styles.compactContainer,
        {
          backgroundColor: accentGlass.background,
          borderWidth: 1,
          borderColor: accentGlass.border,
        },
        style
      ]}>
        <View style={styles.compactHeader}>
          <MaterialCommunityIcons
            name="newspaper-variant-multiple"
            size={28}
            color={accentColor}
          />
          <View style={styles.compactHeaderText}>
            <Text style={[styles.compactTitle, { color: paperTheme.colors.onSurface }]}>
              You've reached your free limit
            </Text>
            <Text style={[styles.compactSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
              {articleLimit} articles available to guests
            </Text>
          </View>
        </View>
        <View style={styles.compactButtons}>
          <TouchableOpacity
            style={[styles.compactButtonPrimary, { backgroundColor: accentColor }]}
            onPress={handleSignUp}
            activeOpacity={0.7}
            accessibilityLabel="Sign up for free"
            accessibilityRole="button"
            accessibilityHint="Create a free account to access unlimited articles"
          >
            <Text style={[styles.compactButtonText, { color: paperTheme.colors.onTertiary }]}>
              Sign Up Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.compactButtonSecondary, { borderColor: accentColor }]}
            onPress={handleLogin}
            activeOpacity={0.7}
            accessibilityLabel="Log in to your account"
            accessibilityRole="button"
            accessibilityHint="Sign in to your existing account"
          >
            <Text style={[styles.compactButtonTextSecondary, { color: accentColor }]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full variant - promotional card
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: accentGlass.background,
        borderWidth: 1,
        borderColor: accentGlass.border,
      },
      style
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: accentGlass.chip }]}>
          <MaterialCommunityIcons
            name="gift-outline"
            size={16}
            color={accentColor}
          />
          <Text style={[styles.badgeText, { color: accentColor }]}>FREE ACCOUNT</Text>
        </View>
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: accentGlass.chip }]}>
        <MaterialCommunityIcons
          name="newspaper-variant-multiple-outline"
          size={48}
          color={accentColor}
        />
      </View>

      {/* Title */}
      <Text
        style={[styles.title, { color: paperTheme.colors.onSurface }]}
        accessibilityRole="header"
      >
        Unlock Unlimited News
      </Text>
      <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
        You're viewing {articleLimit} free articles. Sign up to access all stories from 50+ African news sources.
      </Text>

      {/* Benefits */}
      <View style={styles.benefits}>
        {[
          { icon: 'infinity', text: 'Unlimited articles' },
          { icon: 'bookmark-multiple', text: 'Save articles to read later' },
          { icon: 'bell-outline', text: 'Breaking news alerts' },
          { icon: 'tune', text: 'Personalized feed' },
        ].map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <MaterialCommunityIcons
              name={benefit.icon}
              size={20}
              color={accentColor}
            />
            <Text style={[styles.benefitText, { color: paperTheme.colors.onSurface }]}>
              {benefit.text}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
          onPress={handleSignUp}
          activeOpacity={0.7}
          accessibilityLabel="Create free account"
          accessibilityRole="button"
          accessibilityHint="Sign up for unlimited access to news articles"
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={22}
            color={paperTheme.colors.onTertiary}
          />
          <Text style={[styles.primaryButtonText, { color: paperTheme.colors.onTertiary }]}>
            Create Free Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
          accessibilityLabel="Log in to existing account"
          accessibilityRole="button"
          accessibilityHint="Sign in if you already have an account"
        >
          <Text style={[styles.secondaryButtonText, { color: accentColor }]}>
            Already have an account? Log In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ============ FULL VARIANT ============
  container: {
    borderRadius: 16,
    padding: mukokoTheme.spacing.lg,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12, // Increased from 11 for WCAG readability
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 0.5,
  },
  iconContainer: {
    alignSelf: 'center',
    padding: mukokoTheme.spacing.lg,
    borderRadius: 50,
    marginBottom: mukokoTheme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: mukokoTheme.spacing.md,
  },
  benefits: {
    marginBottom: mukokoTheme.spacing.lg,
    gap: mukokoTheme.spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  buttons: {
    gap: mukokoTheme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,  // Accessibility: minimum 48px touch target
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.xl,
    borderRadius: 26,
    gap: mukokoTheme.spacing.sm,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  secondaryButton: {
    alignItems: 'center',
    minHeight: 48,  // Accessibility: minimum touch target
    justifyContent: 'center',
    paddingVertical: mukokoTheme.spacing.md,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // ============ COMPACT VARIANT ============
  compactContainer: {
    borderRadius: 12,
    padding: mukokoTheme.spacing.md,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
  },
  compactHeaderText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  compactSubtitle: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  compactButtons: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.md,
  },
  compactButtonPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,  // Accessibility: minimum touch target
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: 24,
  },
  compactButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,  // Accessibility: minimum touch target
    paddingVertical: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: 24,
    borderWidth: 2,
  },
  compactButtonText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  compactButtonTextSecondary: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ BANNER VARIANT ============
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,  // Accessibility: comfortable touch target
    paddingHorizontal: mukokoTheme.spacing.lg,
    paddingVertical: mukokoTheme.spacing.md,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.sm,
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    flex: 1,
  },
  bannerText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  bannerButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: mukokoTheme.spacing.lg,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 20,
  },
  bannerButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,  // Accessibility: comfortable touch target
    paddingHorizontal: mukokoTheme.spacing.lg,
    paddingVertical: mukokoTheme.spacing.md,
    borderRadius: 26,
    marginHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.md,
  },
  minimalText: {
    flex: 1,
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
