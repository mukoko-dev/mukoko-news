/**
 * LoginPromo Component
 * Large, attention-grabbing promo to encourage sign up via OIDC (id.mukoko.com)
 * Uses ACCENT color (terracotta) for promo identity
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import mukokoTheme from '../theme';

// OIDC Configuration
const OIDC_CONFIG = {
  issuer: 'https://id.mukoko.com',
  clientId: 'mukoko-news-mobile',
  redirectUri: Platform.select({
    web: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://news.mukoko.com/auth/callback',
    default: 'mukoko-news://auth/callback',
  }),
};

/**
 * LoginPromo - Large promotional component for user registration/login via OIDC
 * Designed to STAND OUT and capture attention
 *
 * @param {string} variant - 'hero' | 'card' | 'banner' | 'minimal'
 * @param {Function} onLoginPress - Optional callback when login is pressed
 * @param {Function} onSignUpPress - Optional callback when sign up is pressed
 * @param {number} articleLimit - Number of free articles (default: 20)
 */
export default function LoginPromo({
  variant = 'hero',
  onLoginPress,
  onSignUpPress,
  articleLimit = 20,
  style,
}) {
  const { theme } = useTheme();

  // Bold accent colors for prominence
  const accentColor = theme.colors.tertiary || '#D4634A';
  const accentDark = '#B84D38';

  // Redirect to OIDC provider for authentication
  const redirectToOIDC = async (prompt = 'login') => {
    const params = new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      redirect_uri: OIDC_CONFIG.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      prompt: prompt,
    });

    const authUrl = `${OIDC_CONFIG.issuer}/authorize?${params.toString()}`;

    try {
      await Linking.openURL(authUrl);
    } catch (error) {
      console.error('Failed to open OIDC auth URL:', error);
    }
  };

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      redirectToOIDC('login');
    }
  };

  const handleSignUp = () => {
    if (onSignUpPress) {
      onSignUpPress();
    } else {
      redirectToOIDC('create');
    }
  };

  // HERO variant - Full-width attention-grabbing promo
  if (variant === 'hero') {
    return (
      <View style={[styles.heroContainer, style]}>
        <LinearGradient
          colors={[accentColor, accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Decorative elements */}
          <View style={styles.heroDecorativeCircle} />
          <View style={styles.heroDecorativeCircle2} />

          {/* Content */}
          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="gift" size={16} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>FREE FOREVER</Text>
            </View>

            {/* Headline */}
            <Text style={styles.heroHeadline}>
              Join Africa's{'\n'}News Community
            </Text>

            <Text style={styles.heroSubheadline}>
              Get unlimited access to 50+ African news sources.
              Personalized. Real-time. Free.
            </Text>

            {/* Benefits grid */}
            <View style={styles.heroBenefits}>
              {[
                { icon: 'infinity', label: 'Unlimited' },
                { icon: 'lightning-bolt', label: 'Real-time' },
                { icon: 'tune-variant', label: 'Personalized' },
                { icon: 'bell-ring', label: 'Alerts' },
              ].map((benefit, index) => (
                <View key={index} style={styles.heroBenefitItem}>
                  <MaterialCommunityIcons name={benefit.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.heroBenefitText}>{benefit.label}</Text>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.heroPrimaryButton}
              onPress={handleSignUp}
              activeOpacity={0.9}
              accessibilityLabel="Create free account"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="account-plus" size={24} color={accentColor} />
              <Text style={[styles.heroPrimaryButtonText, { color: accentColor }]}>
                Create Free Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryButton}
              onPress={handleLogin}
              activeOpacity={0.7}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
            >
              <Text style={styles.heroSecondaryButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // CARD variant - Large card with visual impact
  if (variant === 'card') {
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface }, style]}>
        {/* Accent header strip */}
        <View style={[styles.cardHeader, { backgroundColor: accentColor }]}>
          <MaterialCommunityIcons name="star-circle" size={28} color="#FFFFFF" />
          <Text style={styles.cardHeaderText}>UNLOCK PREMIUM ACCESS</Text>
        </View>

        {/* Main content */}
        <View style={styles.cardContent}>
          <View style={styles.cardIconContainer}>
            <LinearGradient
              colors={[accentColor, accentDark]}
              style={styles.cardIconGradient}
            >
              <MaterialCommunityIcons name="newspaper-variant-multiple" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            Your Free News Pass
          </Text>

          <Text style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
            You're viewing {articleLimit} free articles. Create a free account for unlimited access to all stories.
          </Text>

          {/* Benefits */}
          <View style={styles.cardBenefits}>
            {[
              { icon: 'check-circle', text: 'Unlimited articles from 50+ sources' },
              { icon: 'check-circle', text: 'Personalized news feed' },
              { icon: 'check-circle', text: 'Save articles to read later' },
              { icon: 'check-circle', text: 'Breaking news alerts' },
            ].map((benefit, index) => (
              <View key={index} style={styles.cardBenefitRow}>
                <MaterialCommunityIcons name={benefit.icon} size={22} color={accentColor} />
                <Text style={[styles.cardBenefitText, { color: theme.colors.onSurface }]}>
                  {benefit.text}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cardPrimaryButton, { backgroundColor: accentColor }]}
            onPress={handleSignUp}
            activeOpacity={0.9}
            accessibilityLabel="Get free access"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="rocket-launch" size={22} color="#FFFFFF" />
            <Text style={styles.cardPrimaryButtonText}>Get Free Access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardSecondaryButton}
            onPress={handleLogin}
            activeOpacity={0.7}
            accessibilityLabel="Sign in"
            accessibilityRole="button"
          >
            <Text style={[styles.cardSecondaryButtonText, { color: accentColor }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // BANNER variant - Prominent horizontal banner
  if (variant === 'banner') {
    return (
      <TouchableOpacity
        style={[styles.bannerContainer, style]}
        onPress={handleSignUp}
        activeOpacity={0.9}
        accessibilityLabel="Sign up for unlimited access"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[accentColor, accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconBg}>
                <MaterialCommunityIcons name="lock-open-variant" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Unlock Unlimited Access</Text>
                <Text style={styles.bannerSubtitle}>Create a free account now</Text>
              </View>
            </View>
            <View style={styles.bannerButton}>
              <Text style={[styles.bannerButtonText, { color: accentColor }]}>Join Free</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={accentColor} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // MINIMAL variant - Subtle but noticeable
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[
          styles.minimalContainer,
          {
            backgroundColor: `${accentColor}15`,
            borderColor: `${accentColor}30`,
          },
          style,
        ]}
        onPress={handleSignUp}
        activeOpacity={0.8}
        accessibilityLabel="Create account for unlimited articles"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="account-plus" size={24} color={accentColor} />
        <View style={styles.minimalTextContainer}>
          <Text style={[styles.minimalTitle, { color: theme.colors.onSurface }]}>
            Create a free account
          </Text>
          <Text style={[styles.minimalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Get unlimited articles
          </Text>
        </View>
        <View style={[styles.minimalArrow, { backgroundColor: accentColor }]}>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  }

  // Default fallback to hero
  return null;
}

const styles = StyleSheet.create({
  // ============ HERO VARIANT ============
  heroContainer: {
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorativeCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubheadline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 320,
  },
  heroBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 28,
  },
  heroBenefitItem: {
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  heroBenefitText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
    width: '100%',
    maxWidth: 300,
    marginBottom: 12,
    borderWidth: 1,
  },
  heroPrimaryButtonText: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  heroSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  heroSecondaryButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textDecorationLine: 'underline',
  },

  // ============ CARD VARIANT ============
  cardContainer: {
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardIconContainer: {
    marginBottom: 16,
  },
  cardIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 26,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 300,
  },
  cardBenefits: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  cardBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardBenefitText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    flex: 1,
  },
  cardPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  cardPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  cardSecondaryButton: {
    paddingVertical: 12,
  },
  cardSecondaryButtonText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // ============ BANNER VARIANT ============
  bannerContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bannerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  bannerButtonText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // ============ MINIMAL VARIANT ============
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 2,
    gap: 14,
  },
  minimalTextContainer: {
    flex: 1,
  },
  minimalTitle: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  minimalSubtitle: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  minimalArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
