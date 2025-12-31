/**
 * OnboardingScreen - Post-signup slide-up modal onboarding flow
 *
 * Netflix-style slide-up modal with 3-step flow for authenticated users:
 * 1. Country selection (Pan-African)
 * 2. Username selection
 * 3. Category interests
 *
 * WCAG AA compliant accessibility
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Modal,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Check, Loader2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../constants/design-tokens';
import { categories as categoriesAPI, countries as countriesAPI, user as userAPI } from '../api/client';

// Logo asset
const MukokoLogo = require('../assets/mukoko-icon-dark.png');

// Minimum touch target size for WCAG compliance (44x44 dp)
const MIN_TOUCH_TARGET = 44;

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modal height (80% of screen for onboarding)
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

/**
 * ProgressIndicator - Step indicator dots
 */
function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <View
      className="flex-row gap-xs justify-center py-md"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full ${
            i < currentStep
              ? 'bg-tanzanite w-8'
              : i === currentStep - 1
                ? 'bg-tanzanite w-12'
                : 'bg-outline w-8'
          }`}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Immersive dark modal theme colors
  const modalColors = {
    background: '#1a1a2e',  // Dark immersive background
    text: '#FFFFFF',         // White text on dark
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.3)',
    primary: colors.primary,      // Use theme primary (Tanzanite)
    success: colors.success,      // Use theme success (Malachite)
    error: colors.error,          // Use theme error
    accent: colors.tertiary,      // Use theme accent (Terracotta)
  };

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [primaryCountry, setPrimaryCountry] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

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

  // Load countries and categories on mount
  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      if (__DEV__) {
        console.error('Failed to load onboarding data:', err);
      }
    }
  };

  const checkUsername = async (value) => {
    if (!value || value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
      return false;
    }

    setCheckingUsername(true);
    try {
      const { auth } = require('../api/client');
      const result = await auth.checkUsername(value);

      if (result.error || !result.data?.available) {
        setUsernameError(result.data?.error || result.error || 'Username is already taken');
        return false;
      }

      setUsernameError('');
      return true;
    } catch (err) {
      setUsernameError('Error checking username');
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    if (value.length >= 3) {
      checkUsername(value);
    } else if (value.length > 0) {
      setUsernameError('Username must be at least 3 characters');
    } else {
      setUsernameError('');
    }
  };

  const toggleCountry = (countryCode) => {
    setSelectedCountries((prev) => {
      const newSelection = prev.includes(countryCode)
        ? prev.filter((code) => code !== countryCode)
        : [...prev, countryCode];

      if (primaryCountry === countryCode && !newSelection.includes(countryCode)) {
        setPrimaryCountry(null);
      }

      if (!primaryCountry && newSelection.length > 0) {
        setPrimaryCountry(newSelection[0]);
      }

      return newSelection;
    });
  };

  const handleSetPrimary = (countryCode) => {
    if (selectedCountries.includes(countryCode)) {
      setPrimaryCountry(countryCode);
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = async () => {
    setError('');

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!username || username.length < 3) {
        setUsernameError('Username must be at least 3 characters');
        return;
      }

      const isAvailable = await checkUsername(username);
      if (!isAvailable) {
        return;
      }

      setStep(3);
    } else if (step === 3) {
      if (selectedCategories.length < 3) {
        setError('Please select at least 3 topics');
        return;
      }

      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const usernameResult = await userAPI.updateProfile({ username });

      if (usernameResult.error) {
        setError(usernameResult.error || 'Failed to update username');
        setLoading(false);
        return;
      }

      if (selectedCountries.length > 0) {
        await countriesAPI.setUserPreferences(
          selectedCountries.map((code, index) => ({
            country_id: code,
            is_primary: code === primaryCountry,
            priority: selectedCountries.length - index,
          }))
        );
      }

      for (const categoryId of selectedCategories) {
        await userAPI.addCategoryInterest(categoryId, 10);
      }

      animateClose(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      });
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    animateClose(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    });
  };

  // Calculate card widths
  const countryCardWidth = (width - spacing.xl * 2 - spacing.sm * 2) / 3;
  const categoryCardWidth = (width - spacing.xl * 2 - spacing.sm) / 2;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleSkip}
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
        <View className="w-12 h-1 rounded-full bg-outline self-center mt-md mb-sm" />

        {/* Close Button */}
        <Pressable
          className="absolute top-md right-md w-10 h-10 items-center justify-center rounded-full bg-surface-variant z-10"
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text className="text-white text-2xl">×</Text>
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={step} totalSteps={3} />

            {/* Header */}
            <View style={styles.header}>
              <Image
                source={MukokoLogo}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Mukoko News logo"
              />
              <Text style={styles.title} accessibilityRole="header">
                {step === 1 && "Choose Your Countries"}
                {step === 2 && "Create Your Profile"}
                {step === 3 && "Select Your Interests"}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1 && "Get news from countries you care about"}
                {step === 2 && "Pick a username for your account"}
                {step === 3 && "Choose at least 3 topics to follow"}
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Step 1: Country Selection */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.countryGrid} accessibilityRole="group">
                  {countries.map((country) => {
                    const isSelected = selectedCountries.includes(country.id || country.code);
                    const isPrimary = primaryCountry === (country.id || country.code);
                    return (
                      <TouchableOpacity
                        key={country.id || country.code}
                        onPress={() => toggleCountry(country.id || country.code)}
                        onLongPress={() => handleSetPrimary(country.id || country.code)}
                        style={[
                          styles.countryChip,
                          { width: countryCardWidth },
                          isSelected && styles.countryChipSelected,
                          isPrimary && styles.countryChipPrimary,
                        ]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${country.name}${isPrimary ? ', primary' : isSelected ? ', selected' : ''}`}
                        delayLongPress={500}
                      >
                        <Text style={styles.countryEmoji}>{country.emoji}</Text>
                        <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
                          {country.name}
                        </Text>
                        {isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>★</Text>
                          </View>
                        )}
                        {isSelected && !isPrimary && (
                          <View style={styles.checkmark}>
                            <Check size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.selectionHint}>
                  {selectedCountries.length === 0 && 'No selection = news from all of Africa'}
                  {selectedCountries.length > 0 &&
                    `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected`}
                </Text>
              </View>
            )}

            {/* Step 2: Username */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.usernameContainer}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={username}
                      onChangeText={handleUsernameChange}
                      autoCapitalize="none"
                      placeholder="Enter username"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      style={[
                        styles.input,
                        {
                          color: '#FFFFFF',
                          borderColor: usernameError
                            ? '#B3261E'
                            : 'rgba(255, 255, 255, 0.3)',
                        }
                      ]}
                      accessibilityLabel="Username input"
                    />
                    <View style={styles.inputIcon}>
                      {checkingUsername ? (
                        <Loader2 size={20} color="rgba(255, 255, 255, 0.7)" className="animate-spin" />
                      ) : (
                        username.length >= 3 && !usernameError && (
                          <Check size={20} color={colors.primary} />
                        )
                      )}
                    </View>
                  </View>
                  {usernameError ? (
                    <Text style={styles.helperTextError}>{usernameError}</Text>
                  ) : (
                    <Text style={styles.helperText}>
                      Letters, numbers, and underscores only. Min 3 characters.
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Step 3: Category Interests */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.categoryGrid} accessibilityRole="group">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => toggleCategory(category.id)}
                        style={[
                          styles.categoryChip,
                          { width: categoryCardWidth },
                          isSelected && styles.categoryChipSelected,
                        ]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={`${category.name}${isSelected ? ', selected' : ''}`}
                      >
                        <Text style={styles.categoryEmoji}>{category.emoji || '📰'}</Text>
                        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                          {category.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmark}>
                            <Check size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.selectionHint}>
                  {selectedCategories.length === 0 && 'Select at least 3 topics'}
                  {selectedCategories.length > 0 && selectedCategories.length < 3 &&
                    `${selectedCategories.length} selected • ${3 - selectedCategories.length} more needed`}
                  {selectedCategories.length >= 3 &&
                    `${selectedCategories.length} topics selected`}
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Actions */}
        <View className="p-lg pt-md border-t border-outline bg-surface">
          <View className="flex-row gap-md mb-md">
            {step > 1 && (
              <Pressable
                className="flex-1 py-md px-lg rounded-button border border-outline items-center justify-center min-h-touch"
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text className="font-sans-medium text-body-medium text-on-surface">Back</Text>
              </Pressable>
            )}
            <Pressable
              className={`flex-1 py-md px-lg rounded-button items-center justify-center min-h-touch ${
                loading ||
                (step === 2 && (!username || username.length < 3 || !!usernameError || checkingUsername)) ||
                (step === 3 && selectedCategories.length < 3)
                  ? 'bg-outline'
                  : 'bg-tanzanite'
              }`}
              onPress={handleContinue}
              disabled={
                loading ||
                (step === 2 && (!username || username.length < 3 || !!usernameError || checkingUsername)) ||
                (step === 3 && selectedCategories.length < 3)
              }
              accessibilityRole="button"
              accessibilityLabel={step === 3 ? 'Get Started' : step === 1 ? (selectedCountries.length === 0 ? 'Skip' : 'Next') : 'Next'}
            >
              {loading ? (
                <View className="flex-row items-center gap-sm">
                  <Loader2 size={16} color="#FFFFFF" className="animate-spin" />
                  <Text className="font-sans-bold text-body-medium text-white">Setting up...</Text>
                </View>
              ) : (
                <Text className="font-sans-bold text-body-medium text-white">
                  {step === 3 ? 'Get Started' : step === 1 && selectedCountries.length === 0 ? 'Skip' : 'Next'}
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            className="py-sm items-center min-h-touch justify-center"
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text className="font-sans text-label-large text-on-surface-variant">Skip for now</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

/**
 * NOTE: Static layout styles only - colors are passed via modalColors object.
 * This ensures theme consistency and allows for easy color changes.
 */
const styles = StyleSheet.create({
  // Modal backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    flex: 1,
  },

  // Modal container
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    // backgroundColor applied via modalColors in JSX
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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

  // Keyboard avoiding view
  keyboardView: {
    flex: 1,
  },

  // Modal content
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  // Progress indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBarActive: {
    backgroundColor: '#FFFFFF',
  },
  progressBarCurrent: {
    width: 48,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: 'NotoSerif-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Error banner
  errorBanner: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 99, 74, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 99, 74, 0.4)',
  },
  errorText: {
    color: '#d4634a',
    textAlign: 'center',
    fontSize: 14,
  },

  // Step content
  stepContent: {
    flex: 1,
  },

  // Country grid
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  countryChip: {
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    position: 'relative',
  },
  countryChipSelected: {
    borderColor: '#4B0082',
    backgroundColor: '#4B0082',
  },
  countryChipPrimary: {
    borderColor: '#004D40',
    backgroundColor: '#004D40',
  },
  countryEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  countryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  countryNameSelected: {
    color: '#FFFFFF',
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Username input
  usernameContainer: {
    marginTop: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    paddingRight: 40,
  },
  inputIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: spacing.lg,
  },
  helperTextError: {
    fontSize: 12,
    color: '#d4634a',
    marginBottom: spacing.lg,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minHeight: 70,
    position: 'relative',
  },
  categoryChipSelected: {
    borderColor: '#4B0082',
    backgroundColor: `${'#4B0082'}40`,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  categoryNameSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4B0082',
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
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
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
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
