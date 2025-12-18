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
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Modal,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput, Icon } from 'react-native-paper';
import { mukokoTheme } from '../theme';
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
      style={styles.progressContainer}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressBar,
            i < currentStep && styles.progressBarActive,
            i === currentStep - 1 && styles.progressBarCurrent,
          ]}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      console.error('Failed to load onboarding data:', err);
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
  const countryCardWidth = (width - mukokoTheme.spacing.xl * 2 - mukokoTheme.spacing.sm * 2) / 3;
  const categoryCardWidth = (width - mukokoTheme.spacing.xl * 2 - mukokoTheme.spacing.sm) / 2;

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
        <View style={styles.handleBar} />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon source="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

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
                            <Icon source="check" size={14} color="#FFFFFF" />
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
                  <TextInput
                    mode="outlined"
                    label="Username"
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    style={styles.input}
                    outlineColor="rgba(255, 255, 255, 0.3)"
                    activeOutlineColor={mukokoTheme.colors.primary}
                    textColor="#FFFFFF"
                    theme={{
                      colors: {
                        onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                        background: 'transparent',
                      },
                    }}
                    error={!!usernameError}
                    accessibilityLabel="Username input"
                    right={
                      checkingUsername ? (
                        <TextInput.Icon icon="loading" color="rgba(255, 255, 255, 0.7)" />
                      ) : (
                        username.length >= 3 && !usernameError && (
                          <TextInput.Icon icon="check" color={mukokoTheme.colors.success} />
                        )
                      )
                    }
                  />
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
                            <Icon source="check" size={16} color="#FFFFFF" />
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
        <View style={styles.bottomActions}>
          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                step === 2 && (!username || username.length < 3 || !!usernameError || checkingUsername) && styles.primaryButtonDisabled,
                step === 3 && selectedCategories.length < 3 && styles.primaryButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={
                loading ||
                (step === 2 && (!username || username.length < 3 || !!usernameError || checkingUsername)) ||
                (step === 3 && selectedCategories.length < 3)
              }
              accessibilityRole="button"
              accessibilityLabel={step === 3 ? 'Get Started' : step === 1 ? (selectedCountries.length === 0 ? 'Skip' : 'Next') : 'Next'}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Setting up...' : step === 3 ? 'Get Started' : step === 1 && selectedCountries.length === 0 ? 'Skip' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

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
    backgroundColor: '#1a1a2e',
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
    paddingHorizontal: mukokoTheme.spacing.xl,
    paddingTop: mukokoTheme.spacing.md,
    paddingBottom: mukokoTheme.spacing.md,
  },

  // Progress indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.lg,
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
    marginBottom: mukokoTheme.spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: mukokoTheme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.xs,
    fontFamily: mukokoTheme.fonts.serifBold?.fontFamily,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Error banner
  errorBanner: {
    padding: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.lg,
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
    gap: mukokoTheme.spacing.sm,
    justifyContent: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  countryChip: {
    padding: mukokoTheme.spacing.sm,
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
    borderColor: mukokoTheme.colors.primary,
    backgroundColor: mukokoTheme.colors.primary,
  },
  countryChipPrimary: {
    borderColor: mukokoTheme.colors.success || '#779b63',
    backgroundColor: mukokoTheme.colors.success || '#779b63',
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
    marginTop: mukokoTheme.spacing.lg,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: mukokoTheme.spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: mukokoTheme.spacing.lg,
  },
  helperTextError: {
    fontSize: 12,
    color: '#d4634a',
    marginBottom: mukokoTheme.spacing.lg,
  },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.md,
  },
  categoryChip: {
    padding: mukokoTheme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minHeight: 70,
    position: 'relative',
  },
  categoryChipSelected: {
    borderColor: mukokoTheme.colors.primary,
    backgroundColor: `${mukokoTheme.colors.primary}40`,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: mukokoTheme.spacing.xs,
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
    top: mukokoTheme.spacing.xs,
    right: mukokoTheme.spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: mukokoTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Selection hint
  selectionHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: mukokoTheme.spacing.sm,
  },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: mukokoTheme.spacing.xl,
    paddingTop: mukokoTheme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : mukokoTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.sm,
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
    paddingVertical: mukokoTheme.spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
