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
import mukokoTheme, { paperThemeDark } from '../theme';

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
    <View style={[styles.footer, { backgroundColor: paperThemeDark.colors.background }]}>
      {/* Newsletter Section */}
      <View style={styles.newsletterSection}>
        <Text style={[styles.newsletterTitle, { color: paperThemeDark.colors.onSurface }]}>
          Subscribe to Mukoko News
        </Text>
        <View style={styles.newsletterForm}>
          <TextInput
            style={[styles.emailInput, {
              backgroundColor: paperThemeDark.colors.glass,
              borderColor: paperThemeDark.colors.glassBorder,
              color: paperThemeDark.colors.onSurface,
            }]}
            placeholder="Your email"
            placeholderTextColor={paperThemeDark.colors.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: paperThemeDark.colors.primary }]}
            onPress={handleNewsletterSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.signUpButtonText, { color: paperThemeDark.colors.onPrimary }]}>
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: paperThemeDark.colors.outline }]} />

      {/* Main Footer Content */}
      <View style={styles.mainContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="hexagon-multiple"
              size={40}
              color={paperThemeDark.colors.primary}
            />
          </View>
          <Text style={[styles.brandName, { color: paperThemeDark.colors.onSurface }]}>
            MUKOKO NEWS
          </Text>
          <Text style={[styles.tagline, { color: paperThemeDark.colors.onSurfaceVariant }]}>
            Africa's Digital News Platform
          </Text>
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
                <Text style={[styles.navLinkText, { color: paperThemeDark.colors.onSurfaceVariant }]}>
                  {link.label}
                </Text>
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
                <Text style={[styles.navLinkText, { color: paperThemeDark.colors.onSurfaceVariant }]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { borderTopColor: paperThemeDark.colors.outline }]}>
        {/* Social Links */}
        <View style={styles.socialLinks}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleExternalLink(social.url)}
              style={[styles.socialButton, { backgroundColor: paperThemeDark.colors.surface }]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={social.icon}
                size={22}
                color={paperThemeDark.colors.onSurface}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Copyright */}
        <Text style={[styles.copyright, { color: paperThemeDark.colors.onSurfaceVariant }]}>
          © 2025 Mukoko News. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
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
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  signUpButton: {
    height: 48,
    paddingHorizontal: 24,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 1,
  },

  // Divider
  divider: {
    height: 1,
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
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
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
    letterSpacing: 1.5,
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    gap: 20,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    letterSpacing: 0.3,
  },
});
