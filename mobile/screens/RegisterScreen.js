import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Icon,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { mukokoTheme } from '../theme';
import { auth } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import AuthMigrationModal, { useAuthMigrationModal } from '../components/AuthMigrationModal';

// Logo asset
const MukokoLogo = require('../assets/mukoko-icon-dark.png');

/**
 * RegisterScreen - Clean, minimal registration with status feedback
 *
 * Features:
 * - Simple email/password form (no optional fields upfront)
 * - Password strength indicator
 * - Clear loading and error states
 * - Success animation before navigation
 * - Responsive layout
 */
export default function RegisterScreen({ navigation }) {
  const paperTheme = usePaperTheme();
  const { refreshAuth } = useAuth();

  // Auth migration modal
  const { showModal, dismissModal } = useAuthMigrationModal();

  // Form state - simplified to just required fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');

  // Responsive
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const handleMigrationContinue = () => {
    dismissModal();
    navigation.navigate('Bytes');
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isWideScreen = dimensions.width >= 600;
  const cardMaxWidth = isWideScreen ? 400 : '100%';

  // Password validation
  const passwordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 8) return { level: 1, text: 'Too short', color: mukokoTheme.colors.error };
    if (password.length < 10) return { level: 2, text: 'Weak', color: mukokoTheme.colors.warning };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { level: 2, text: 'Medium', color: mukokoTheme.colors.warning };
    }
    return { level: 3, text: 'Strong', color: mukokoTheme.colors.success };
  };

  const strength = passwordStrength();

  const handleRegister = async () => {
    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      setStatus('error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      setStatus('error');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setStatus('error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // Register user
      const result = await auth.signUp(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setStatus('error');
        return;
      }

      // Show success state
      setStatus('success');

      // Refresh auth context
      if (refreshAuth) {
        await refreshAuth();
      }

      // Navigate to onboarding after brief success animation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }, 1000);
    } catch (err) {
      console.error('[RegisterScreen] Error:', err);
      setError('Connection error. Please check your internet and try again.');
      setStatus('error');
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Bytes');
    }
  };

  // Dynamic colors
  const colors = {
    bg: paperTheme.colors.background,
    surface: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    textMuted: paperTheme.colors.onSurfaceVariant,
    primary: paperTheme.colors.primary,
    error: paperTheme.colors.error,
    success: mukokoTheme.colors.success,
  };

  // Success state - show checkmark with welcome message
  if (status === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.statusContainer}>
          <View style={[styles.successCircle, { backgroundColor: colors.success + '20' }]}>
            <Icon source="check" size={48} color={colors.success} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Account created!
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
            Let's personalize your experience...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWideScreen && styles.scrollContentWide,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon source="arrow-left" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={MukokoLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Mukoko News"
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Join Mukoko News today
          </Text>
        </View>

        {/* Form Card */}
        <Surface
          style={[
            styles.card,
            { backgroundColor: colors.surface, maxWidth: cardMaxWidth },
          ]}
          elevation={1}
        >
          {/* Error Message */}
          {status === 'error' && error && (
            <View style={[styles.banner, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
              <Icon source="alert-circle" size={20} color={colors.error} />
              <Text style={[styles.bannerText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Email Field */}
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (status === 'error') setStatus('idle');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            style={styles.input}
            outlineColor={colors.textMuted + '40'}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={status === 'loading'}
            left={<TextInput.Icon icon="email-outline" color={colors.textMuted} />}
          />

          {/* Password Field */}
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (status === 'error') setStatus('idle');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            outlineColor={colors.textMuted + '40'}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={status === 'loading'}
            left={<TextInput.Icon icon="lock-outline" color={colors.textMuted} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                color={colors.textMuted}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          strength.level >= level
                            ? strength.color
                            : colors.textMuted + '30',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.text}
              </Text>
            </View>
          )}

          {/* Confirm Password Field */}
          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (status === 'error') setStatus('idle');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            outlineColor={colors.textMuted + '40'}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={status === 'loading'}
            left={<TextInput.Icon icon="lock-check-outline" color={colors.textMuted} />}
            onSubmitEditing={handleRegister}
          />

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchContainer}>
              <Icon
                source={password === confirmPassword ? 'check-circle' : 'close-circle'}
                size={16}
                color={password === confirmPassword ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.matchText,
                  { color: password === confirmPassword ? colors.success : colors.error },
                ]}
              >
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleRegister}
            disabled={
              status === 'loading' ||
              !email.trim() ||
              password.length < 8 ||
              password !== confirmPassword
            }
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {status === 'loading' ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size={20} color={colors.surface} />
                <Text style={[styles.buttonLabel, { color: colors.surface, marginLeft: 8 }]}>
                  Creating account...
                </Text>
              </View>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={status === 'loading'}
            >
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                {' '}Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Terms Notice */}
        <Text style={[styles.termsText, { color: colors.textMuted }]}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>

      {/* Auth Migration Modal */}
      <AuthMigrationModal
        visible={showModal}
        onDismiss={dismissModal}
        onContinue={handleMigrationContinue}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scrollContentWide: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignSelf: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    minWidth: 60,
    textAlign: 'right',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
  },
});
