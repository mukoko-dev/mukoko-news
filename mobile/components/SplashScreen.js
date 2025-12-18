/**
 * SplashScreen Component
 * Initial loading screen with Pan-African branding and public customization
 *
 * Features:
 * - Mukoko News logo and Pan-African tagline
 * - Country selection (step 1)
 * - Category selection (step 2)
 * - Close button for early skip
 * - 60 second auto-close timeout
 * - WCAG AA compliant accessibility
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator, useTheme as usePaperTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, typography, layout } from '../styles/globalStyles';
import mukokoTheme from '../theme';
import ZimbabweFlagStrip from './ZimbabweFlagStrip';
import { countries as countriesAPI, categories as categoriesAPI } from '../api/client';

// Storage keys for guest preferences
const GUEST_COUNTRIES_KEY = '@mukoko_guest_countries';
const GUEST_CATEGORIES_KEY = '@mukoko_guest_categories';
const SPLASH_SHOWN_KEY = '@mukoko_splash_shown';

// Logo asset
const MukokoLogo = require('../assets/mukoko-logo-compact.png');

// Auto-close timeout (60 seconds)
const AUTO_CLOSE_TIMEOUT = 60000;

// Minimum touch target size for WCAG compliance (44x44 dp)
const MIN_TOUCH_TARGET = 44;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * CountrySelectionGrid - Grid of countries for selection
 */
function CountrySelectionGrid({
  countries,
  selectedCountries,
  onToggle,
  theme,
}) {
  const cardWidth = (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 3;

  return (
    <View
      style={styles.selectionGrid}
      accessibilityRole="group"
      accessibilityLabel="Country selection grid"
    >
      {countries.map((country) => {
        const isSelected = selectedCountries.includes(country.id || country.code);
        return (
          <TouchableOpacity
            key={country.id || country.code}
            onPress={() => onToggle(country.id || country.code)}
            style={[
              styles.gridItem,
              { width: cardWidth },
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.glass || 'rgba(94, 87, 114, 0.08)',
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${country.name}${isSelected ? ', selected' : ''}`}
            accessibilityHint={`Double tap to ${isSelected ? 'deselect' : 'select'} ${country.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.gridEmoji} accessibilityElementsHidden>{country.emoji}</Text>
            <Text
              style={[
                styles.gridName,
                { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface },
              ]}
              numberOfLines={1}
            >
              {country.name}
            </Text>
            {isSelected && (
              <View style={styles.gridCheck}>
                <MaterialCommunityIcons name="check" size={14} color={theme.colors.onPrimary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * CategorySelectionGrid - Grid of categories for selection
 */
function CategorySelectionGrid({
  categories,
  selectedCategories,
  onToggle,
  theme,
}) {
  const cardWidth = (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 2;

  return (
    <View
      style={styles.selectionGrid}
      accessibilityRole="group"
      accessibilityLabel="Category selection grid"
    >
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id || category.slug);
        return (
          <TouchableOpacity
            key={category.id || category.slug}
            onPress={() => onToggle(category.id || category.slug)}
            style={[
              styles.categoryItem,
              { width: cardWidth },
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.glass || 'rgba(94, 87, 114, 0.08)',
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.glassBorder || 'rgba(94, 87, 114, 0.12)',
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${category.name}${isSelected ? ', selected' : ''}`}
            accessibilityHint={`Double tap to ${isSelected ? 'deselect' : 'select'} ${category.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.categoryEmoji} accessibilityElementsHidden>{category.emoji || '📰'}</Text>
            <Text
              style={[
                styles.categoryName,
                { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface },
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
            {isSelected && (
              <View style={styles.categoryCheck}>
                <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * ProgressIndicator - Step indicator dots
 */
function ProgressIndicator({ currentStep, totalSteps, theme }) {
  return (
    <View
      style={styles.progressContainer}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              backgroundColor: i < currentStep
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              width: i === currentStep - 1 ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * SplashScreen - Initial loading screen with Pan-African branding and customization
 *
 * @param {boolean} isLoading - Whether to show loading indicator
 * @param {string} loadingMessage - Custom loading message
 * @param {boolean} showCustomization - Whether to show country/category selection
 * @param {Function} onClose - Callback when user closes or timeout expires
 * @param {Function} onPreferencesSet - Callback when user sets preferences
 */
export default function SplashScreen({
  isLoading = true,
  loadingMessage = 'Loading news...',
  showCustomization = true,
  onClose,
  onPreferencesSet,
}) {
  const paperTheme = usePaperTheme();
  const [logoAnim] = useState(new Animated.Value(0));
  const [contentAnim] = useState(new Animated.Value(0));

  // Step management (0 = loading, 1 = countries, 2 = categories)
  const [step, setStep] = useState(0);

  // Data
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // State
  const [dataLoaded, setDataLoaded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(AUTO_CLOSE_TIMEOUT / 1000);

  // Refs
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Animate logo entrance
  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate content when step changes
  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  // Load countries and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load countries
        const countriesResult = await countriesAPI.getAll({ withStats: true });
        if (countriesResult.data?.countries) {
          // Sort by priority, show enabled only
          const enabledCountries = countriesResult.data.countries
            .filter(c => c.enabled !== false)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
          setCountries(enabledCountries);
        }

        // Load categories
        const categoriesResult = await categoriesAPI.getAll();
        if (categoriesResult.data?.categories) {
          setCategories(categoriesResult.data.categories);
        }

        // Check for existing guest preferences
        const [storedCountries, storedCategories] = await Promise.all([
          AsyncStorage.getItem(GUEST_COUNTRIES_KEY),
          AsyncStorage.getItem(GUEST_CATEGORIES_KEY),
        ]);

        if (storedCountries) {
          setSelectedCountries(JSON.parse(storedCountries));
        }
        if (storedCategories) {
          setSelectedCategories(JSON.parse(storedCategories));
        }

        setDataLoaded(true);
      } catch (error) {
        console.error('[SplashScreen] Failed to load data:', error);
        setDataLoaded(true);
      }
    };

    if (showCustomization) {
      loadData();
    }
  }, [showCustomization]);

  // Move to step 1 when loading is complete and data is loaded
  useEffect(() => {
    if (!isLoading && dataLoaded && showCustomization && step === 0) {
      setStep(1);
    }
  }, [isLoading, dataLoaded, showCustomization, step]);

  // Auto-close timer
  useEffect(() => {
    if (!isLoading && showCustomization && step > 0) {
      // Start countdown timer
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-close after timeout
      timerRef.current = setTimeout(() => {
        handleClose();
      }, AUTO_CLOSE_TIMEOUT);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isLoading, showCustomization, step]);

  // Reset timer when user interacts
  const resetTimer = useCallback(() => {
    setTimeRemaining(AUTO_CLOSE_TIMEOUT / 1000);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, AUTO_CLOSE_TIMEOUT);
    }
  }, []);

  const toggleCountry = useCallback((countryCode) => {
    resetTimer();
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        return prev.filter(c => c !== countryCode);
      }
      return [...prev, countryCode];
    });
  }, [resetTimer]);

  const toggleCategory = useCallback((categoryId) => {
    resetTimer();
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(c => c !== categoryId);
      }
      return [...prev, categoryId];
    });
  }, [resetTimer]);

  const handleClose = useCallback(async () => {
    // Save preferences to AsyncStorage for guests
    try {
      await Promise.all([
        AsyncStorage.setItem(GUEST_COUNTRIES_KEY, JSON.stringify(selectedCountries)),
        AsyncStorage.setItem(GUEST_CATEGORIES_KEY, JSON.stringify(selectedCategories)),
        AsyncStorage.setItem(SPLASH_SHOWN_KEY, 'true'),
      ]);
    } catch (error) {
      console.error('[SplashScreen] Failed to save preferences:', error);
    }

    // Call callbacks
    if (onPreferencesSet) {
      onPreferencesSet({
        countries: selectedCountries,
        categories: selectedCategories,
      });
    }
    if (onClose) {
      onClose();
    }
  }, [selectedCountries, selectedCategories, onPreferencesSet, onClose]);

  const handleNext = useCallback(() => {
    resetTimer();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleClose();
    }
  }, [step, resetTimer, handleClose]);

  const handleBack = useCallback(() => {
    resetTimer();
    if (step === 2) {
      setStep(1);
    }
  }, [step, resetTimer]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // Render loading state
  if (isLoading || (showCustomization && !dataLoaded)) {
    return (
      <View
        style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
        accessibilityRole="alert"
        accessibilityLabel="Loading Mukoko News"
        accessibilityLiveRegion="polite"
      >
        <ZimbabweFlagStrip />

        <View style={styles.content}>
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
              Africa's News, Your Way
            </Text>
          </Animated.View>

          <View style={styles.descriptionSection}>
            <Text style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}>
              Stay informed with news from 50+ trusted African sources,
              across 22 countries, all in one place.
            </Text>
          </View>

          <View
            style={styles.loadingSection}
            accessibilityRole="progressbar"
            accessibilityLabel={loadingMessage}
          >
            <ActivityIndicator
              size="large"
              color={paperTheme.colors.primary}
              accessibilityElementsHidden
            />
            <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
              {loadingMessage}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Powered by Nyuchi Tech • Made for Africa 🌍
          </Text>
        </View>
      </View>
    );
  }

  // Render customization steps
  return (
    <View
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
      accessibilityRole="dialog"
      accessibilityLabel={step === 1 ? "Select your countries" : "Select your interests"}
    >
      <ZimbabweFlagStrip />

      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: paperTheme.colors.surface }]}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Close and continue to news"
        accessibilityHint="Skips customization and shows all news"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons
          name="close"
          size={24}
          color={paperTheme.colors.onSurface}
        />
      </TouchableOpacity>

      {/* Timer indicator */}
      <View style={styles.timerContainer} accessibilityElementsHidden>
        <Text style={[styles.timerText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Auto-continue in {timeRemaining}s
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.headerSection,
            { opacity: contentAnim },
          ]}
        >
          <Image
            source={MukokoLogo}
            style={styles.logoSmall}
            resizeMode="contain"
            accessibilityLabel="Mukoko News logo"
          />

          <ProgressIndicator
            currentStep={step}
            totalSteps={2}
            theme={paperTheme}
          />

          <Text
            style={[styles.stepTitle, { color: paperTheme.colors.onSurface }]}
            accessibilityRole="header"
          >
            {step === 1 ? 'Choose Your Countries' : 'Select Your Interests'}
          </Text>
          <Text style={[styles.stepSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            {step === 1
              ? 'Select countries to see news from (or skip for all Africa)'
              : 'Pick topics you care about for a personalized feed'}
          </Text>
        </Animated.View>

        {/* Step 1: Country Selection */}
        {step === 1 && (
          <Animated.View style={{ opacity: contentAnim }}>
            <CountrySelectionGrid
              countries={countries}
              selectedCountries={selectedCountries}
              onToggle={toggleCountry}
              theme={paperTheme}
            />

            <Text style={[styles.selectionHint, { color: paperTheme.colors.onSurfaceVariant }]}>
              {selectedCountries.length === 0
                ? 'No selection = news from all of Africa'
                : `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected`}
            </Text>
          </Animated.View>
        )}

        {/* Step 2: Category Selection */}
        {step === 2 && (
          <Animated.View style={{ opacity: contentAnim }}>
            <CategorySelectionGrid
              categories={categories}
              selectedCategories={selectedCategories}
              onToggle={toggleCategory}
              theme={paperTheme}
            />

            <Text style={[styles.selectionHint, { color: paperTheme.colors.onSurfaceVariant }]}>
              {selectedCategories.length === 0
                ? 'No selection = all news topics'
                : `${selectedCategories.length} ${selectedCategories.length === 1 ? 'topic' : 'topics'} selected`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: paperTheme.colors.background }]}>
        <View style={styles.buttonRow}>
          {step > 1 && (
            <Button
              mode="outlined"
              onPress={handleBack}
              style={[styles.button, styles.buttonBack]}
              contentStyle={styles.buttonContent}
              accessibilityLabel="Go back to country selection"
            >
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.button, step === 1 && styles.buttonFull]}
            contentStyle={styles.buttonContent}
            icon={step === 2 ? 'check' : 'arrow-right'}
            accessibilityLabel={step === 1 ? 'Continue to topic selection' : 'Start reading news'}
          >
            {step === 1 ? 'Next' : 'Get Started'}
          </Button>
        </View>

        <TouchableOpacity
          onPress={handleClose}
          style={styles.skipLink}
          accessibilityRole="button"
          accessibilityLabel="Skip customization"
        >
          <Text style={[styles.skipText, { color: paperTheme.colors.primary }]}>
            Skip and show all news
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footerCompact}>
        <Text style={[styles.footerText, { color: paperTheme.colors.onSurfaceVariant }]}>
          Powered by Nyuchi Tech • Made for Africa 🌍
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: spacing.md,
    zIndex: 100,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Timer
  timerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 68 : 48,
    left: spacing.md,
    zIndex: 100,
  },
  timerText: {
    ...typography.bodySmall,
    fontSize: 12,
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
  logoSmall: {
    width: 60,
    height: 60,
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

  // Header Section (customization)
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.headlineMedium,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.bodyMedium,
    textAlign: 'center',
    maxWidth: 300,
  },

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
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

  // Selection Grids
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  gridItem: {
    padding: spacing.sm,
    borderRadius: mukokoTheme.roundness.md || 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    position: 'relative',
  },
  gridEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  gridName: {
    fontSize: 11,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  gridCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category Items (larger)
  categoryItem: {
    padding: spacing.md,
    borderRadius: mukokoTheme.roundness.md || 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  categoryCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Selection Hint
  selectionHint: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Loading Section
  loadingSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodyMedium,
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  buttonFull: {
    flex: 1,
  },
  buttonBack: {
    flex: 0.4,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  skipLink: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipText: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerCompact: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySmall,
  },
});
