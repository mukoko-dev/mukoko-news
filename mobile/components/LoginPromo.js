/**
 * LoginPromo Component
 * Encourages users to sign up/login to access unlimited articles
 * Uses PRIMARY color tint for brand consistency
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
 * Uses PRIMARY (purple) color for brand consistency
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

  // Primary-tinted glass colors
  const primaryGlass = {
    background: paperTheme.colors.glassCard || paperTheme.colors.surface,
    border: paperTheme.colors.glassBorder || paperTheme.colors.outline,
    chip: paperTheme.colors.glass || 'rgba(94, 87, 114, 0.08)',
    chipBorder: paperTheme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
  };

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSignUp = () => {
    if (onSignUpPress) {
      onSignUpPress();
    } else {
      navigation.navigate('Register');
    }
  };

  // Banner variant - slim banner at bottom of feed
  if (variant === 'banner') {
    return (
      <View style={[
        styles.bannerContainer,
        {
          backgroundColor: paperTheme.colors.primary,
        },
        style
      ]}>
        <View style={styles.bannerContent}>
          <MaterialCommunityIcons
            name="lock-open-outline"
            size={20}
            color={paperTheme.colors.onPrimary}
          />
          <Text style={[styles.bannerText, { color: paperTheme.colors.onPrimary }]}>
            Sign up for unlimited access
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bannerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={handleSignUp}
          activeOpacity={0.7}
        >
          <Text style={[styles.bannerButtonText, { color: paperTheme.colors.onPrimary }]}>
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
            backgroundColor: primaryGlass.chip,
            borderWidth: 1,
            borderColor: primaryGlass.chipBorder,
          },
          style
        ]}
        onPress={handleSignUp}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="account-plus"
          size={18}
          color={paperTheme.colors.primary}
        />
        <Text style={[styles.minimalText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Create account for unlimited articles
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
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
          backgroundColor: primaryGlass.background,
          borderWidth: 1,
          borderColor: primaryGlass.border,
        },
        style
      ]}>
        <View style={styles.compactHeader}>
          <MaterialCommunityIcons
            name="newspaper-variant-multiple"
            size={24}
            color={paperTheme.colors.primary}
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
            style={[styles.compactButtonPrimary, { backgroundColor: paperTheme.colors.primary }]}
            onPress={handleSignUp}
            activeOpacity={0.7}
          >
            <Text style={[styles.compactButtonText, { color: paperTheme.colors.onPrimary }]}>
              Sign Up Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.compactButtonSecondary, { borderColor: paperTheme.colors.primary }]}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={[styles.compactButtonTextSecondary, { color: paperTheme.colors.primary }]}>
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
        backgroundColor: primaryGlass.background,
        borderWidth: 1,
        borderColor: primaryGlass.border,
      },
      style
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: primaryGlass.chip }]}>
          <MaterialCommunityIcons
            name="gift-outline"
            size={14}
            color={paperTheme.colors.primary}
          />
          <Text style={[styles.badgeText, { color: paperTheme.colors.primary }]}>FREE ACCOUNT</Text>
        </View>
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: primaryGlass.chip }]}>
        <MaterialCommunityIcons
          name="newspaper-variant-multiple-outline"
          size={48}
          color={paperTheme.colors.primary}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
        Unlock Unlimited News
      </Text>
      <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
        You're viewing {articleLimit} free articles. Sign up to access all stories from 30+ Zimbabwe news sources.
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
              size={18}
              color={paperTheme.colors.primary}
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
          style={[styles.primaryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={handleSignUp}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={20}
            color={paperTheme.colors.onPrimary}
          />
          <Text style={[styles.primaryButtonText, { color: paperTheme.colors.onPrimary }]}>
            Create Free Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryButtonText, { color: paperTheme.colors.primary }]}>
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
    fontSize: 11,
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
    gap: mukokoTheme.spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mukokoTheme.spacing.md,
    borderRadius: 24,
    gap: mukokoTheme.spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 14,
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
    gap: mukokoTheme.spacing.sm,
  },
  compactButtonPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 20,
  },
  compactButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  compactButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  compactButtonTextSecondary: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ BANNER VARIANT ============
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    marginHorizontal: mukokoTheme.spacing.md,
    marginVertical: mukokoTheme.spacing.sm,
    borderRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    flex: 1,
  },
  bannerText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  bannerButton: {
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.xs,
    borderRadius: 16,
  },
  bannerButtonText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mukokoTheme.spacing.md,
    paddingVertical: mukokoTheme.spacing.sm,
    borderRadius: 24,
    marginHorizontal: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.sm,
  },
  minimalText: {
    flex: 1,
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
