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
const MukokoLogo = require('../assets/mukoko-logo-compact.png');

/**
 * LoginScreen - Clean, minimal login with status feedback
 *
 * Features:
 * - Simple email/password form
 * - Clear loading and error states
 * - Success animation before navigation
 * - Responsive layout
 */
export default function LoginScreen({ navigation, route }) {
  const paperTheme = usePaperTheme();
  const { refreshAuth } = useAuth();

  // Auth migration modal
  const { showModal, dismissModal } = useAuthMigrationModal();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Responsive
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Check for reset success message
  useEffect(() => {
    let timeoutId;
    if (route.params?.resetSuccess) {
      setResetSuccess(true);
      timeoutId = setTimeout(() => setResetSuccess(false), 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [route.params?.resetSuccess]);

  const isWideScreen = dimensions.width >= 600;
  const cardMaxWidth = isWideScreen ? 400 : '100%';

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      setStatus('error');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const result = await auth.signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setStatus('error');
        return;
      }

      // Show success state briefly
      setStatus('success');

      // Refresh auth context
      if (refreshAuth) {
        await refreshAuth();
      }

      // Navigate after brief success animation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Bytes' }],
        });
      }, 800);
    } catch (err) {
      console.error('[LoginScreen] Error:', err);
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

  const handleMigrationContinue = () => {
    dismissModal();
    navigation.navigate('Bytes');
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

  // Success state - show checkmark
  if (status === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.statusContainer}>
          <View style={[styles.successCircle, { backgroundColor: colors.success + '20' }]}>
            <Icon source="check" size={48} color={colors.success} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Welcome back!
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
            Signing you in...
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
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Sign in to continue
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
          {/* Reset Success Message */}
          {resetSuccess && (
            <View style={[styles.banner, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
              <Icon source="check-circle" size={20} color={colors.success} />
              <Text style={[styles.bannerText, { color: colors.success }]}>
                Password reset successful! Sign in with your new password.
              </Text>
            </View>
          )}

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
            onSubmitEditing={handleLogin}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotButton}
            disabled={status === 'loading'}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={status === 'loading' || !email.trim() || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {status === 'loading' ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size={20} color={colors.surface} />
                <Text style={[styles.buttonLabel, { color: colors.surface, marginLeft: 8 }]}>
                  Signing in...
                </Text>
              </View>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.textMuted }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={status === 'loading'}
            >
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                {' '}Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
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
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
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
