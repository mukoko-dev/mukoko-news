/**
 * ProfileSettingsScreen - Clean modern settings design
 * Inspired by iOS/Android settings patterns
 * Features: Grouped sections, clean list items with icons and values
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text,
} from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import {
  User,
  Mail,
  AtSign,
  Moon,
  Sun,
  Vibrate,
  LogOut,
  Edit3,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Loader2,
  Bell,
  ShieldCheck,
  Link2,
  Info,
  CheckCircle2
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { mukokoTheme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout';
import { user as userAPI } from '../api/client';
import { LoadingState, TextInput } from '../components/ui';

export default function ProfileSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const paperTheme = usePaperTheme();
  const { isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const layout = useLayout();

  // On tablet/desktop, no bottom tab bar, so reduce padding
  const bottomPadding = layout.isMobile ? 100 : 24;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [error, setError] = useState(null);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [newUsername, setNewUsername] = useState('');

  // Edit mode states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);

  // Settings toggles
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Ref to track message timeout for cleanup
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    loadProfile();
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const loadProfile = async () => {
    setError(null);
    try {
      const result = await userAPI.getProfile();
      if (result.error) {
        // For anonymous users, create a guest profile
        setProfile({
          username: 'Guest',
          displayName: 'Guest User',
          bio: 'Sign in to personalize your settings',
          isAnonymous: true,
        });
        setDisplayName('Guest User');
        setBio('Sign in to personalize your settings');
        setLoading(false);
        return;
      }
      const data = result.data;
      setProfile(data);
      setDisplayName(data.name || data.displayName || data.display_name || '');
      setBio(data.bio || '');
    } catch (err) {
      console.error('Error loading profile:', err);
      // For errors, show guest profile
      setProfile({
        username: 'Guest',
        displayName: 'Guest User',
        bio: 'Sign in to personalize your settings',
        isAnonymous: true,
      });
      setDisplayName('Guest User');
      setBio('Sign in to personalize your settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage({ type, text });
    messageTimeoutRef.current = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await userAPI.updateProfile({
        name: displayName || undefined,
        bio: bio || undefined,
      });
      if (result.error) {
        showMessage('error', result.error);
      } else {
        showMessage('success', 'Profile updated');
        setEditingProfile(false);
        await loadProfile();
      }
    } catch (err) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername || !/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
      showMessage('error', 'Username must be 3-30 characters (letters, numbers, _ -)');
      return;
    }
    setSaving(true);
    if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await userAPI.updateUsername(newUsername);
      if (result.error) {
        showMessage('error', result.error);
      } else {
        showMessage('success', 'Username updated');
        setEditingUsername(false);
        setNewUsername('');
        await loadProfile();
      }
    } catch (err) {
      showMessage('error', 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleHapticToggle = (value) => {
    if (value) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHapticFeedback(value);
  };

  const handleSignOut = async () => {
    if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
  };

  // Dynamic styles
  const dynamicStyles = {
    container: { backgroundColor: paperTheme.colors.background },
    text: { color: paperTheme.colors.onSurface },
    textMuted: { color: paperTheme.colors.onSurfaceVariant },
    card: {
      backgroundColor: paperTheme.colors.surface,
      borderColor: paperTheme.colors.outline,
    },
    divider: { backgroundColor: paperTheme.colors.outline },
    input: {
      backgroundColor: paperTheme.colors.surfaceVariant,
      color: paperTheme.colors.onSurface,
    },
  };

  if (loading) {
    return <LoadingState message="Loading settings..." />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center gap-md px-xl bg-background">
        <AlertCircle size={48} color={paperTheme.colors.error} />
        <Text className="font-sans text-body-medium text-on-surface-variant text-center">
          {error}
        </Text>
        <Pressable
          className="flex-row items-center justify-center gap-sm py-sm px-lg rounded-button bg-tanzanite"
          onPress={loadProfile}
          accessibilityRole="button"
          accessibilityLabel="Retry loading settings"
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text className="font-sans-medium text-body-medium text-white">
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const email = profile?.email || '';

  // Setting item component
  const SettingItem = ({ Icon, iconColor, label, value, onPress, rightElement, showChevron = true }) => (
    <Pressable
      className="flex-row items-center py-md px-lg"
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        className="w-9 h-9 rounded-lg items-center justify-center mr-md"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-medium text-body-medium text-on-surface">{label}</Text>
      </View>
      {value && (
        <Text className="font-sans text-body-small text-on-surface-variant mr-sm">
          {value}
        </Text>
      )}
      {rightElement}
      {showChevron && onPress && (
        <ChevronRight
          size={22}
          color={paperTheme.colors.onSurfaceVariant}
        />
      )}
    </Pressable>
  );

  // Divider between sections
  const SectionDivider = () => (
    <View style={[styles.sectionDivider, dynamicStyles.divider]} />
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-lg py-md" style={{ paddingTop: insets.top + 8 }}>
        <Pressable
          className="w-10 h-10 items-center justify-center"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </Pressable>
        <Text className="font-serif-bold text-headline-small text-on-surface">Settings</Text>
        <Pressable
          className="w-10 h-10 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Info
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </Pressable>
      </View>

      {/* Toast Message */}
      {message.text !== '' && (
        <View
          className="flex-row items-center gap-sm py-sm px-lg mx-lg rounded-button"
          style={{
            backgroundColor: message.type === 'success'
              ? mukokoTheme.colors.success
              : mukokoTheme.colors.error,
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} color="#fff" />
          ) : (
            <AlertCircle size={18} color="#fff" />
          )}
          <Text className="font-sans-medium text-body-small text-white flex-1">{message.text}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email Display */}
        <View style={[styles.emailContainer, dynamicStyles.card]}>
          <Text style={[styles.emailText, dynamicStyles.text]}>{email}</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <SettingItem
            Icon={User}
            iconColor={paperTheme.colors.primary}
            label="Profile"
            onPress={() => setEditingProfile(!editingProfile)}
          />

          {/* Profile Edit Form */}
          {editingProfile && (
            <View style={styles.editForm}>
              <TextInput
                mode="flat"
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                style={[styles.input, dynamicStyles.input]}
                underlineColor="transparent"
                activeUnderlineColor={paperTheme.colors.primary}
              />
              <TextInput
                mode="flat"
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                maxLength={160}
                style={[styles.input, styles.bioInput, dynamicStyles.input]}
                underlineColor="transparent"
                activeUnderlineColor={paperTheme.colors.primary}
              />
              <Text style={[styles.charCount, dynamicStyles.textMuted]}>
                {bio.length}/160
              </Text>
              <Pressable
                className="py-md rounded-lg items-center"
                style={{ backgroundColor: paperTheme.colors.primary }}
                onPress={handleUpdateProfile}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} color="#fff" className="animate-spin" />
                ) : (
                  <Text className="font-sans-bold text-body-medium text-white">Save Changes</Text>
                )}
              </Pressable>
            </View>
          )}

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            Icon={AtSign}
            iconColor="#00B0FF"
            label="Username"
            value={`@${profile?.username || ''}`}
            onPress={() => setEditingUsername(!editingUsername)}
          />

          {/* Username Edit Form */}
          {editingUsername && (
            <View style={styles.editForm}>
              <View className="flex-row items-center gap-sm p-md rounded-lg mb-md" style={{ backgroundColor: `${mukokoTheme.colors.warning}15` }}>
                <AlertCircle
                  size={18}
                  color={mukokoTheme.colors.warning}
                />
                <Text className="flex-1 font-sans text-body-small" style={{ color: mukokoTheme.colors.warning }}>
                  Changing username will update your profile URL
                </Text>
              </View>
              <TextInput
                mode="flat"
                label="New Username"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
                style={[styles.input, dynamicStyles.input]}
                underlineColor="transparent"
                activeUnderlineColor={paperTheme.colors.primary}
                left={<TextInput.Affix text="@" />}
              />
              <Pressable
                className="py-md rounded-lg items-center"
                style={{ backgroundColor: paperTheme.colors.primary }}
                onPress={handleUpdateUsername}
                disabled={saving || !newUsername}
              >
                {saving ? (
                  <Loader2 size={16} color="#fff" className="animate-spin" />
                ) : (
                  <Text className="font-sans-bold text-body-medium text-white">Update Username</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <SectionDivider />

        {/* Preferences Section */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <SettingItem
            Icon={isDark ? Moon : Sun}
            iconColor={isDark ? '#7C83FD' : '#FFB74D'}
            label="Appearance"
            value={isDark ? 'Dark' : 'System'}
            onPress={handleThemeToggle}
            showChevron={false}
            rightElement={null}
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            Icon={Bell}
            iconColor="#FF7043"
            label="Notifications"
            onPress={() => {}}
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            Icon={ShieldCheck}
            iconColor="#26A69A"
            label="Privacy"
            onPress={() => {}}
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            Icon={Link2}
            iconColor="#5C6BC0"
            label="Shared links"
            onPress={() => {}}
          />
        </View>

        <SectionDivider />

        {/* Haptic Feedback */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <View className="flex-row items-center py-md px-lg">
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-md" style={{ backgroundColor: 'rgba(156, 39, 176, 0.15)' }}>
              <Vibrate size={20} color="#9C27B0" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-body-medium text-on-surface">Haptic feedback</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={handleHapticToggle}
              trackColor={{ true: paperTheme.colors.primary }}
              thumbColor={hapticFeedback ? paperTheme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <SectionDivider />

        {/* Log Out */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <Pressable
            className="flex-row items-center py-md px-lg"
            onPress={handleSignOut}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-md" style={{ backgroundColor: 'rgba(244, 67, 54, 0.15)' }}>
              <LogOut size={20} color={mukokoTheme.colors.error} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-body-medium" style={{ color: mukokoTheme.colors.error }}>Log out</Text>
            </View>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, dynamicStyles.textMuted]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 0.3,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Email Container
  emailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  emailText: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },

  // Section Card
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sectionDivider: {
    height: 24,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
  settingValue: {
    fontSize: 15,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 4,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  itemDivider: {
    height: 1,
    marginLeft: 60,
  },

  // Edit Form
  editForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  input: {
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
