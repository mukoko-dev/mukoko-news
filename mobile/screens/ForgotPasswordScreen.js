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

// Logo asset
const MukokoLogo = require('../assets/mukoko-logo-compact.png');

/**
 * ForgotPasswordScreen - Two-step password reset flow
 *
 * Step 1: Enter email to receive reset code
 * Step 2: Enter code and new password
 *
 * Features:
 * - Clear step indicators
 * - Status feedback for each action
 * - Responsive layout
 */
export default function ForgotPasswordScreen({ navigation }) {
  const paperTheme = usePaperTheme();

  // Step state
  const [step, setStep] = useState(1); // 1 = email, 2 = reset code

  // Form state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');

  // Responsive
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isWideScreen = dimensions.width >= 600;
  const cardMaxWidth = isWideScreen ? 400 : '100%';

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

  const handleRequestCode = async () => {
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

    setStatus('loading');
    setError('');

    try {
      const result = await auth.forgotPassword(email.trim());

      if (result.error) {
        setError(result.error);
        setStatus('error');
        return;
      }

      // Move to step 2
      setStatus('idle');
      setStep(2);
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      setError('Connection error. Please try again.');
      setStatus('error');
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim()) {
      setError('Please enter the reset code');
      setStatus('error');
      return;
    }

    if (code.length !== 6) {
      setError('Reset code must be 6 digits');
      setStatus('error');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setStatus('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const result = await auth.resetPassword(email.trim(), code.trim(), newPassword);

      if (result.error) {
        setError(result.error);
        setStatus('error');
        return;
      }

      // Show success and redirect to login
      setStatus('success');
      setTimeout(() => {
        navigation.navigate('Login', { resetSuccess: true });
      }, 1500);
    } catch (err) {
      console.error('[ForgotPassword] Reset error:', err);
      setError('Connection error. Please try again.');
      setStatus('error');
    }
  };

  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setStatus('idle');
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.statusContainer}>
          <View style={[styles.successCircle, { backgroundColor: colors.success + '20' }]}>
            <Icon source="check" size={48} color={colors.success} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Password reset!
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
            Redirecting to sign in...
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
          accessibilityLabel={step === 2 ? 'Go back to email' : 'Go back'}
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
            {step === 1 ? 'Forgot password?' : 'Reset password'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {step === 1
              ? "We'll send you a reset code"
              : `Enter the code sent to ${email}`}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View
            style={[
              styles.stepLine,
              { backgroundColor: step >= 2 ? colors.primary : colors.textMuted + '40' },
            ]}
          />
          <View
            style={[
              styles.stepDot,
              { backgroundColor: step >= 2 ? colors.primary : colors.textMuted + '40' },
            ]}
          />
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

          {step === 1 ? (
            // Step 1: Enter Email
            <>
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
                onSubmitEditing={handleRequestCode}
              />

              <Button
                mode="contained"
                onPress={handleRequestCode}
                disabled={status === 'loading' || !email.trim()}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {status === 'loading' ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size={20} color={colors.surface} />
                    <Text style={[styles.buttonLabel, { color: colors.surface, marginLeft: 8 }]}>
                      Sending code...
                    </Text>
                  </View>
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </>
          ) : (
            // Step 2: Enter Code and New Password
            <>
              {/* Success message for code sent */}
              <View style={[styles.banner, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
                <Icon source="email-check" size={20} color={colors.success} />
                <Text style={[styles.bannerText, { color: colors.success }]}>
                  Reset code sent! Check your email.
                </Text>
              </View>

              {/* Reset Code Field */}
              <TextInput
                mode="outlined"
                label="6-digit Code"
                value={code}
                onChangeText={(text) => {
                  // Only allow digits
                  const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
                  setCode(digits);
                  if (status === 'error') setStatus('idle');
                }}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.input, styles.codeInput]}
                outlineColor={colors.textMuted + '40'}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                disabled={status === 'loading'}
              />

              {/* New Password Field */}
              <TextInput
                mode="outlined"
                label="New Password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
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
                onSubmitEditing={handleResetPassword}
              />

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  <Icon
                    source={newPassword === confirmPassword ? 'check-circle' : 'close-circle'}
                    size={16}
                    color={newPassword === confirmPassword ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      { color: newPassword === confirmPassword ? colors.success : colors.error },
                    ]}
                  >
                    {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleResetPassword}
                disabled={
                  status === 'loading' ||
                  code.length !== 6 ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {status === 'loading' ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size={20} color={colors.surface} />
                    <Text style={[styles.buttonLabel, { color: colors.surface, marginLeft: 8 }]}>
                      Resetting...
                    </Text>
                  </View>
                ) : (
                  'Reset Password'
                )}
              </Button>

              {/* Resend Code */}
              <TouchableOpacity
                onPress={() => {
                  setStep(1);
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                style={styles.resendButton}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Didn't receive code? Send again
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              Remember your password?
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
      </ScrollView>
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
    marginBottom: 16,
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
    fontSize: 14,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
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
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
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
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
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
