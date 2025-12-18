/**
 * AppFooter Component
 * Modern dark footer design inspired by professional news/government sites
 * Features: Newsletter signup, two-column navigation, social links
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

// Dark footer color palette
const FOOTER_COLORS = {
  background: '#0A0A14', // Deep dark navy/purple
  surface: '#141420', // Slightly lighter surface
  text: '#F5F5F5', // Light text
  textMuted: '#A0A0A8', // Muted gray text
  border: 'rgba(255, 255, 255, 0.08)', // Subtle border
  accent: mukokoTheme.colors.primary, // Brand tanzanite
  accentLight: '#B388FF', // Light tanzanite for dark mode
  inputBg: 'rgba(255, 255, 255, 0.06)', // Subtle input background
};

export default function AppFooter() {
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(false);
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      // Only show footer on tablet/desktop (768px+)
      setIsTabletOrDesktop(width >= 768);
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription?.remove();
  }, []);

  // Hide footer on mobile - bottom tab navigation is used instead
  if (!isTabletOrDesktop) {
    return null;
  }

  const handleNavigate = (screenName) => {
    try {
      navigation.navigate(screenName);
    } catch (e) {
      console.log(`Navigation to ${screenName} not available`);
    }
  };

  const handleExternalLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleNewsletterSubmit = () => {
    if (email && email.includes('@')) {
      // TODO: Implement newsletter signup
      console.log('Newsletter signup:', email);
      setEmail('');
    }
  };

  const leftNavLinks = [
    { label: 'NEWS', screen: 'Bytes' },
    { label: 'DISCOVER', screen: 'Discover' },
    { label: 'SEARCH', screen: 'Search' },
    { label: 'ABOUT', url: 'https://mukoko.com/about' },
    { label: 'CONTACT', url: 'https://mukoko.com/contact' },
  ];

  const rightNavLinks = [
    { label: 'PRIVACY', url: 'https://mukoko.com/privacy' },
    { label: 'TERMS', url: 'https://mukoko.com/terms' },
    { label: 'FAQ', url: 'https://mukoko.com/faq' },
    { label: 'SUPPORT', url: 'https://mukoko.com/support' },
    { label: 'CAREERS', url: 'https://mukoko.com/careers' },
  ];

  const socialLinks = [
    { icon: 'twitter', url: 'https://twitter.com/mukokonews' },
    { icon: 'instagram', url: 'https://instagram.com/mukokonews' },
    { icon: 'facebook', url: 'https://facebook.com/mukokonews' },
    { icon: 'youtube', url: 'https://youtube.com/@mukokonews' },
  ];

  return (
    <View style={styles.footer}>
      {/* Newsletter Section */}
      <View style={styles.newsletterSection}>
        <Text style={styles.newsletterTitle}>Subscribe to Mukoko News</Text>
        <View style={styles.newsletterForm}>
          <TextInput
            style={styles.emailInput}
            placeholder="Your email"
            placeholderTextColor={FOOTER_COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleNewsletterSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Main Footer Content */}
      <View style={styles.mainContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="hexagon-multiple"
              size={40}
              color={FOOTER_COLORS.accentLight}
            />
          </View>
          <Text style={styles.brandName}>MUKOKO NEWS</Text>
          <Text style={styles.tagline}>Zimbabwe's Digital News Platform</Text>
        </View>

        {/* Navigation Columns */}
        <View style={styles.navColumns}>
          {/* Left Column */}
          <View style={styles.navColumn}>
            {leftNavLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => link.url ? handleExternalLink(link.url) : handleNavigate(link.screen)}
                style={styles.navLink}
                activeOpacity={0.7}
              >
                <Text style={styles.navLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.navColumn}>
            {rightNavLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleExternalLink(link.url)}
                style={styles.navLink}
                activeOpacity={0.7}
              >
                <Text style={styles.navLinkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Social Links */}
        <View style={styles.socialLinks}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleExternalLink(social.url)}
              style={styles.socialButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={social.icon}
                size={22}
                color={FOOTER_COLORS.text}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 Mukoko News. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: FOOTER_COLORS.background,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },

  // Newsletter Section
  newsletterSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  newsletterTitle: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.serif.fontFamily,
    color: FOOTER_COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  newsletterForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    maxWidth: 420,
    width: '100%',
  },
  emailInput: {
    flex: 1,
    height: 48,
    backgroundColor: FOOTER_COLORS.inputBg,
    borderWidth: 1,
    borderColor: FOOTER_COLORS.border,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: FOOTER_COLORS.text,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  signUpButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: FOOTER_COLORS.accentLight,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    color: '#1A0033',
    letterSpacing: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: FOOTER_COLORS.border,
    marginBottom: 40,
  },

  // Main Content
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 80,
    marginBottom: 40,
    flexWrap: 'wrap',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    minWidth: 200,
  },
  logoContainer: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    color: FOOTER_COLORS.text,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: FOOTER_COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Navigation Columns
  navColumns: {
    flexDirection: 'row',
    gap: 60,
  },
  navColumn: {
    gap: 12,
  },
  navLink: {
    paddingVertical: 4,
  },
  navLinkText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    color: FOOTER_COLORS.textMuted,
    letterSpacing: 1.5,
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FOOTER_COLORS.border,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FOOTER_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    color: FOOTER_COLORS.textMuted,
    letterSpacing: 0.3,
  },
});
