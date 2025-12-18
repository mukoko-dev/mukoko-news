/**
 * OnboardingScreen - Post-signup onboarding flow
 *
 * 3-step flow for authenticated users:
 * 1. Country selection (Pan-African)
 * 2. Username selection
 * 3. Category interests
 *
 * WCAG AA compliant accessibility
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Icon } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mukokoTheme } from '../theme';
import { categories as categoriesAPI, countries as countriesAPI, user as userAPI } from '../api/client';

// Logo asset
const MukokoLogo = require('../assets/mukoko-logo-compact.png');

const AUTH_TOKEN_KEY = '@mukoko_auth_token';

// Minimum touch target size for WCAG compliance (44x44 dp)
const MIN_TOUCH_TARGET = 44;

const { width } = Dimensions.get('window');

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

  // Load countries and categories on mount
  useEffect(() => {
    loadData();
  }, []);

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

      // If deselecting the primary country, clear primary
      if (primaryCountry === countryCode && !newSelection.includes(countryCode)) {
        setPrimaryCountry(null);
      }

      // Auto-set first selected as primary if none set
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
      // Country selection - can skip
      setStep(2);
    } else if (step === 2) {
      // Username validation
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
      // Category selection - require at least 3
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Update username
      const usernameResult = await userAPI.updateProfile({ username });

      if (usernameResult.error) {
        setError(usernameResult.error || 'Failed to update username');
        setLoading(false);
        return;
      }

      // Save country preferences
      if (selectedCountries.length > 0) {
        await countriesAPI.setUserPreferences(
          selectedCountries.map((code, index) => ({
            country_id: code,
            is_primary: code === primaryCountry,
            priority: selectedCountries.length - index,
          }))
        );
      }

      // Update category interests
      for (const categoryId of selectedCategories) {
        await userAPI.addCategoryInterest(categoryId, 10);
      }

      // Navigate to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  // Calculate card width for country grid (3 columns)
  const countryCardWidth = (width - mukokoTheme.spacing.lg * 2 - mukokoTheme.spacing.xl * 2 - mukokoTheme.spacing.sm * 2) / 3;

  // Calculate card width for category grid (2 columns)
  const categoryCardWidth = (width - mukokoTheme.spacing.lg * 2 - mukokoTheme.spacing.xl * 2 - mukokoTheme.spacing.sm) / 2;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          <Text
            variant="headlineLarge"
            style={styles.title}
            accessibilityRole="header"
          >
            Welcome!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {step === 1 && "Choose countries you want news from"}
            {step === 2 && "Let's personalize your experience"}
            {step === 3 && "Choose topics you care about"}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <Surface
            style={styles.errorBanner}
            elevation={0}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.errorText}>{error}</Text>
          </Surface>
        )}

        {/* Step 1: Country Selection */}
        {step === 1 && (
          <Surface style={styles.card} elevation={2}>
            <View style={styles.stepHeader}>
              <Text variant="titleLarge" style={styles.stepTitle}>
                Select Your Countries
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                Get news from countries you care about. Long press to set your primary country.
              </Text>
            </View>

            {/* Country Grid */}
            <View
              style={styles.countryGrid}
              accessibilityRole="group"
              accessibilityLabel="Country selection grid"
            >
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
                    accessibilityLabel={`${country.name}${isPrimary ? ', primary country' : isSelected ? ', selected' : ''}`}
                    accessibilityHint={isSelected ? 'Long press to set as primary' : 'Double tap to select'}
                    delayLongPress={500}
                  >
                    <Text style={styles.countryEmoji} accessibilityElementsHidden>{country.emoji}</Text>
                    <Text
                      style={[
                        styles.countryName,
                        isSelected && styles.countryNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {country.name}
                    </Text>
                    {isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>★</Text>
                      </View>
                    )}
                    {isSelected && !isPrimary && (
                      <View style={styles.checkmark}>
                        <Icon source="check" size={14} color={mukokoTheme.colors.onPrimary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selection Counter */}
            <Text style={styles.selectionCounter}>
              {selectedCountries.length === 0 && 'No selection = news from all of Africa'}
              {selectedCountries.length > 0 &&
                `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected${primaryCountry ? ' • ★ = primary' : ''}`}
            </Text>

            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon="arrow-right"
              accessibilityLabel="Continue to username selection"
            >
              {selectedCountries.length === 0 ? 'Skip' : 'Continue'}
            </Button>
          </Surface>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <Surface style={styles.card} elevation={2}>
            <View style={styles.stepHeader}>
              <Icon source="account" size={48} color={mukokoTheme.colors.primary} accessibilityElementsHidden />
              <Text variant="titleLarge" style={styles.stepTitle}>
                Choose Your Username
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                This is how others will see you on Mukoko News
              </Text>
            </View>

            <TextInput
              mode="outlined"
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              style={styles.input}
              outlineColor={usernameError ? mukokoTheme.colors.error : mukokoTheme.colors.outline}
              activeOutlineColor={usernameError ? mukokoTheme.colors.error : mukokoTheme.colors.primary}
              selectionColor={mukokoTheme.colors.primary}
              cursorColor={mukokoTheme.colors.primary}
              error={!!usernameError}
              accessibilityLabel="Username input"
              accessibilityHint="Enter your desired username"
              right={
                checkingUsername ? (
                  <TextInput.Icon icon="loading" accessibilityLabel="Checking username availability" />
                ) : (
                  username.length >= 3 && !usernameError && (
                    <TextInput.Icon
                      icon={() => <Icon source="check" size={20} color={mukokoTheme.colors.success} />}
                      accessibilityLabel="Username is available"
                    />
                  )
                )
              }
            />
            {usernameError ? (
              <Text style={styles.helperTextError} accessibilityRole="alert">{usernameError}</Text>
            ) : (
              <Text style={styles.helperText}>
                Letters, numbers, and underscores only. Minimum 3 characters.
              </Text>
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleBack}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Go back to country selection"
              >
                Back
              </Button>
              <Button
                mode="contained"
                onPress={handleContinue}
                disabled={!username || username.length < 3 || !!usernameError || checkingUsername}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                icon="arrow-right"
                accessibilityLabel="Continue to topic selection"
              >
                {checkingUsername ? 'Checking...' : 'Continue'}
              </Button>
            </View>
          </Surface>
        )}

        {/* Step 3: Category Interests */}
        {step === 3 && (
          <Surface style={styles.card} elevation={2}>
            <View style={styles.stepHeader}>
              <Text variant="titleLarge" style={styles.stepTitle}>
                Select Your Interests
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                Choose at least 3 topics you'd like to follow (you can change these later)
              </Text>
            </View>

            {/* Category Grid */}
            <View
              style={styles.categoryGrid}
              accessibilityRole="group"
              accessibilityLabel="Topic selection grid"
            >
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
                    accessibilityHint={`Double tap to ${isSelected ? 'deselect' : 'select'} ${category.name}`}
                  >
                    <Text style={styles.categoryEmoji} accessibilityElementsHidden>{category.emoji || '📰'}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected && styles.categoryNameSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Icon source="check" size={16} color={mukokoTheme.colors.onPrimary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selection Counter */}
            <Text
              style={styles.selectionCounter}
              accessibilityRole="status"
              accessibilityLiveRegion="polite"
            >
              {selectedCategories.length === 0 && 'Select at least 3 topics'}
              {selectedCategories.length > 0 && selectedCategories.length < 3 &&
                `${selectedCategories.length} selected • ${3 - selectedCategories.length} more needed`}
              {selectedCategories.length >= 3 &&
                `${selectedCategories.length} topics selected`}
            </Text>

            {/* Navigation Buttons */}
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleBack}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Go back to username selection"
              >
                Back
              </Button>
              <Button
                mode="contained"
                onPress={handleContinue}
                disabled={selectedCategories.length < 3 || loading}
                loading={loading}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                icon="check"
                accessibilityLabel="Finish onboarding and start reading news"
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </Button>
            </View>
          </Surface>
        )}

        {/* Skip Option */}
        <Button
          mode="text"
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Skip setup and go directly to news feed"
        >
          Skip for now
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: mukokoTheme.spacing.lg,
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.xl,
  },
  progressBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: mukokoTheme.colors.surfaceVariant,
  },
  progressBarActive: {
    backgroundColor: mukokoTheme.colors.primary,
  },
  progressBarCurrent: {
    width: 48,
    backgroundColor: mukokoTheme.colors.primary,
  },
  header: {
    marginBottom: mukokoTheme.spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: mukokoTheme.spacing.md,
  },
  title: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginBottom: mukokoTheme.spacing.sm,
    color: mukokoTheme.colors.onBackground,
  },
  subtitle: {
    textAlign: 'center',
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  errorBanner: {
    padding: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    backgroundColor: `${mukokoTheme.colors.error}15`,
    borderWidth: 1,
    borderColor: `${mukokoTheme.colors.error}30`,
  },
  errorText: {
    color: mukokoTheme.colors.error,
    textAlign: 'center',
  },
  card: {
    padding: mukokoTheme.spacing.xl,
    borderRadius: mukokoTheme.roundness * 2,
    backgroundColor: mukokoTheme.colors.surface,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.lg,
  },
  stepTitle: {
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    textAlign: 'center',
    marginTop: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.sm,
  },
  stepSubtitle: {
    textAlign: 'center',
    color: mukokoTheme.colors.onSurfaceVariant,
  },
  input: {
    marginBottom: mukokoTheme.spacing.xs,
    backgroundColor: mukokoTheme.colors.surface,
  },
  helperText: {
    fontSize: 12,
    color: mukokoTheme.colors.onSurfaceVariant,
    marginBottom: mukokoTheme.spacing.lg,
  },
  helperTextError: {
    fontSize: 12,
    color: mukokoTheme.colors.error,
    marginBottom: mukokoTheme.spacing.lg,
  },

  // Country Grid (3 columns)
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.lg,
    justifyContent: 'center',
  },
  countryChip: {
    padding: mukokoTheme.spacing.sm,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 2,
    borderColor: mukokoTheme.colors.outline,
    backgroundColor: mukokoTheme.colors.background,
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
    color: mukokoTheme.colors.onSurface,
  },
  countryNameSelected: {
    color: mukokoTheme.colors.onPrimary,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Category Grid (2 columns)
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.lg,
    maxHeight: 400,
  },
  categoryChip: {
    padding: mukokoTheme.spacing.md,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 2,
    borderColor: mukokoTheme.colors.outline,
    backgroundColor: mukokoTheme.colors.background,
    alignItems: 'center',
    minHeight: 70,
    position: 'relative',
  },
  categoryChipSelected: {
    borderColor: mukokoTheme.colors.primary,
    backgroundColor: `${mukokoTheme.colors.primary}15`,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: mukokoTheme.spacing.xs,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: mukokoTheme.colors.onSurface,
  },
  categoryNameSelected: {
    color: mukokoTheme.colors.primary,
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
  selectionCounter: {
    textAlign: 'center',
    color: mukokoTheme.colors.onSurfaceVariant,
    marginBottom: mukokoTheme.spacing.lg,
  },
  button: {
    marginTop: mukokoTheme.spacing.md,
  },
  buttonContent: {
    paddingVertical: mukokoTheme.spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: mukokoTheme.spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  skipButton: {
    marginTop: mukokoTheme.spacing.lg,
    alignSelf: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
});
