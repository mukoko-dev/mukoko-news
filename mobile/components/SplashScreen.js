/**
 * SplashScreen Component
 * Slide-up modal for Pan-African branding and public customization
 *
 * Features:
 * - Netflix-style slide-up modal
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
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Text, ActivityIndicator, useTheme as usePaperTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography } from '../styles/globalStyles';
import mukokoTheme from '../theme';
import { countries as countriesAPI, categories as categoriesAPI } from '../api/client';
import localPreferences from '../services/LocalPreferencesService';

// Logo asset
const MukokoLogo = require('../assets/mukoko-icon-dark.png');

// Auto-close timeout (60 seconds)
const AUTO_CLOSE_TIMEOUT = 60000;

// Minimum touch target size for WCAG compliance (44x44 dp)
const MIN_TOUCH_TARGET = 44;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modal dimensions
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.72;
const MODAL_MAX_WIDTH = 480;  // Max width for responsive design on large screens
const MODAL_BOTTOM_MARGIN = 24; // Lift modal up from bottom edge

/**
 * CountrySelectionGrid - Grid of countries for selection
 */
function CountrySelectionGrid({ countries, selectedCountries, onToggle, theme }) {
  // Use modal max width for responsive calculations on large screens
  const containerWidth = Math.min(SCREEN_WIDTH, MODAL_MAX_WIDTH);
  const cardWidth = (containerWidth - spacing.xl * 2 - spacing.sm * 2) / 3;

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
                  : 'rgba(255, 255, 255, 0.1)',
                borderColor: isSelected
                  ? theme.colors.primary
                  : 'rgba(255, 255, 255, 0.2)',
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
                { color: isSelected ? theme.colors.onPrimary : '#FFFFFF' },
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
function CategorySelectionGrid({ categories, selectedCategories, onToggle, theme }) {
  // Use modal max width for responsive calculations on large screens
  const containerWidth = Math.min(SCREEN_WIDTH, MODAL_MAX_WIDTH);
  const cardWidth = (containerWidth - spacing.xl * 2 - spacing.sm) / 2;

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
                  : 'rgba(255, 255, 255, 0.1)',
                borderColor: isSelected
                  ? theme.colors.primary
                  : 'rgba(255, 255, 255, 0.2)',
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
                { color: isSelected ? theme.colors.onPrimary : '#FFFFFF' },
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
function ProgressIndicator({ currentStep, totalSteps }) {
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
              backgroundColor: i < currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
              width: i === currentStep - 1 ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * FeatureItem - Feature list item with icon
 * Uses brighter icon colors for visibility on dark background
 */
function FeatureItem({ icon, text, iconColor }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

/**
 * SplashScreen - Slide-up modal with Pan-African branding and customization
 */
export default function SplashScreen({
  isLoading = true,
  loadingMessage = 'Loading news...',
  showCustomization = true,
  onClose,
  onPreferencesSet,
}) {
  const paperTheme = usePaperTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Step management (0 = loading/intro, 1 = countries, 2 = categories)
  const [step, setStep] = useState(0);

  // Data
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // State
  const [dataLoaded, setDataLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(AUTO_CLOSE_TIMEOUT / 1000);

  // Refs
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Animate modal entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load countries and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const countriesResult = await countriesAPI.getAll({ withStats: true });
        if (countriesResult.data?.countries) {
          const enabledCountries = countriesResult.data.countries
            .filter(c => c.enabled !== false)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
          setCountries(enabledCountries);
        }

        const categoriesResult = await categoriesAPI.getAll();
        if (categoriesResult.data?.categories) {
          setCategories(categoriesResult.data.categories);
        }

        // Load stored preferences using LocalPreferencesService for consistent storage keys
        await localPreferences.init();
        const [storedCountries, storedCategories] = await Promise.all([
          localPreferences.getSelectedCountries(),
          localPreferences.getSelectedCategories(),
        ]);

        if (storedCountries && storedCountries.length > 0) {
          setSelectedCountries(storedCountries);
        }
        if (storedCategories && storedCategories.length > 0) {
          setSelectedCategories(storedCategories);
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

  // Auto-close timer
  useEffect(() => {
    if (!isLoading && showCustomization && step > 0) {
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

      timerRef.current = setTimeout(() => {
        handleClose();
      }, AUTO_CLOSE_TIMEOUT);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isLoading, showCustomization, step]);

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

  const animateClose = useCallback((callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
    });
  }, [slideAnim, fadeAnim]);

  const handleClose = useCallback(async () => {
    try {
      // Save preferences using LocalPreferencesService for consistent storage keys
      await Promise.all([
        localPreferences.setSelectedCountries(selectedCountries),
        localPreferences.setSelectedCategories(selectedCategories),
        localPreferences.setOnboardingCompleted(true),
      ]);
    } catch (error) {
      console.error('[SplashScreen] Failed to save preferences:', error);
    }

    animateClose(() => {
      if (onPreferencesSet) {
        onPreferencesSet({
          countries: selectedCountries,
          categories: selectedCategories,
        });
      }
      if (onClose) {
        onClose();
      }
    });
  }, [selectedCountries, selectedCategories, onPreferencesSet, onClose, animateClose]);

  const handleGetStarted = useCallback(() => {
    resetTimer();
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleClose();
    }
  }, [step, resetTimer, handleClose]);

  const handleBack = useCallback(() => {
    resetTimer();
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    }
  }, [step, resetTimer]);

  // Render loading state (full screen)
  if (isLoading || (showCustomization && !dataLoaded)) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}
        accessibilityRole="alert"
        accessibilityLabel="Loading Mukoko News"
        accessibilityLiveRegion="polite"
      >
        <Image
          source={MukokoLogo}
          style={styles.loadingLogo}
          resizeMode="contain"
          accessibilityLabel="Mukoko News logo"
        />
        <Text style={[styles.loadingBrand, { color: paperTheme.colors.onSurface }]}>
          Mukoko News
        </Text>
        <Text style={[styles.loadingTagline, { color: paperTheme.colors.onSurfaceVariant }]}>
          Africa's News, Your Way
        </Text>
        <ActivityIndicator
          size="large"
          color={paperTheme.colors.primary}
          style={styles.loadingSpinner}
        />
        <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
          {loadingMessage}
        </Text>
      </View>
    );
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Close modal"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Slide-up Modal */}
      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close and continue to news"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 0: Intro/Welcome */}
          {step === 0 && (
            <View style={styles.introContent}>
              {/* Beta badge */}
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>NEW</Text>
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>
                Personalize Your{'\n'}News Feed
              </Text>

              {/* Features - using bright colors for dark mode visibility */}
              <View style={styles.featureList}>
                <FeatureItem
                  icon="earth"
                  text="Choose countries you want news from"
                  iconColor="#B388FF"  // Tanzanite light for dark mode
                />
                <FeatureItem
                  icon="star-outline"
                  text="Discover stories that matter to you"
                  iconColor="#FFD740"  // Gold light for dark mode
                />
                <FeatureItem
                  icon="lightning-bolt"
                  text="Or quickly browse all African news"
                  iconColor="#69F0AE"  // Success green for dark mode
                />
              </View>
            </View>
          )}

          {/* Step 1: Country Selection */}
          {step === 1 && (
            <View style={styles.selectionContent}>
              <ProgressIndicator currentStep={1} totalSteps={2} />
              <Text style={styles.selectionTitle}>Choose Your Countries</Text>
              <Text style={styles.selectionSubtitle}>
                Select countries to see news from (or skip for all Africa)
              </Text>

              <CountrySelectionGrid
                countries={countries}
                selectedCountries={selectedCountries}
                onToggle={toggleCountry}
                theme={paperTheme}
              />

              <Text style={styles.selectionHint}>
                {selectedCountries.length === 0
                  ? 'No selection = news from all of Africa'
                  : `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected`}
              </Text>
            </View>
          )}

          {/* Step 2: Category Selection */}
          {step === 2 && (
            <View style={styles.selectionContent}>
              <ProgressIndicator currentStep={2} totalSteps={2} />
              <Text style={styles.selectionTitle}>Select Your Interests</Text>
              <Text style={styles.selectionSubtitle}>
                Pick topics you care about for a personalized feed
              </Text>

              <CategorySelectionGrid
                categories={categories}
                selectedCategories={selectedCategories}
                onToggle={toggleCategory}
                theme={paperTheme}
              />

              <Text style={styles.selectionHint}>
                {selectedCategories.length === 0
                  ? 'No selection = all news topics'
                  : `${selectedCategories.length} ${selectedCategories.length === 1 ? 'topic' : 'topics'} selected`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {step > 0 && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGetStarted}
                accessibilityRole="button"
                accessibilityLabel={step === 2 ? 'Get Started' : 'Next'}
              >
                <Text style={styles.primaryButtonText}>
                  {step === 2 ? 'Get Started' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 0 && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              accessibilityRole="button"
              accessibilityLabel="Personalize your feed"
            >
              <Text style={styles.primaryButtonText}>Personalize</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Skip customization"
          >
            <Text style={styles.skipButtonText}>
              {step === 0 ? 'Skip and show all news' : `Auto-continue in ${timeRemaining}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Loading screen (full screen)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  loadingBrand: {
    fontSize: 28,
    fontFamily: mukokoTheme.fonts.serifBold?.fontFamily,
    marginBottom: spacing.xs,
  },
  loadingTagline: {
    fontSize: 16,
    marginBottom: spacing.xxl,
  },
  loadingSpinner: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },

  // Modal backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    flex: 1,
  },

  // Modal container - centered with max-width for large screens
  modalContainer: {
    position: 'absolute',
    bottom: MODAL_BOTTOM_MARGIN,
    left: 0,
    right: 0,
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    maxWidth: MODAL_MAX_WIDTH,
    width: Platform.OS === 'web' ? '100%' : undefined,
    height: MODAL_HEIGHT,
    backgroundColor: '#1A0033',  // Tanzanite dark (on-brand)
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: Platform.OS === 'web' ? 24 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 24 : 0,
    overflow: 'hidden',
  },

  // Handle bar
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Close button
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal content
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Intro content
  introContent: {
    paddingTop: spacing.xl,
  },
  betaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.lg,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: spacing.xl,
    fontFamily: mukokoTheme.fonts.serifBold?.fontFamily,
  },

  // Feature list
  featureList: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // Selection content
  selectionContent: {
    paddingTop: spacing.md,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: mukokoTheme.fonts.serifBold?.fontFamily,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Progress indicator
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

  // Selection grids
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  gridItem: {
    padding: spacing.sm,
    borderRadius: 12,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  gridCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category items
  categoryItem: {
    padding: spacing.md,
    borderRadius: 12,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Selection hint
  selectionHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A0033',  // Tanzanite dark (on-brand)
  },
  backButton: {
    flex: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
