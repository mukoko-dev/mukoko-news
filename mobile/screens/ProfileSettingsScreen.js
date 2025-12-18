/**
 * ProfileSettingsScreen - Clean modern settings design
 * Inspired by iOS/Android settings patterns
 * Features: Grouped sections, clean list items with icons and values
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Switch,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { mukokoTheme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout';
import { user as userAPI } from '../api/client';

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
        setError('Please log in to access settings.');
        return;
      }
      const data = result.data;
      setProfile(data);
      setDisplayName(data.name || data.displayName || data.display_name || '');
      setBio(data.bio || '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
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
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={paperTheme.colors.error}
        />
        <Text style={[styles.errorText, dynamicStyles.textMuted]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={loadProfile}
          accessibilityRole="button"
          accessibilityLabel="Retry loading settings"
        >
          <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const email = profile?.email || '';

  // Setting item component
  const SettingItem = ({ icon, iconColor, label, value, onPress, rightElement, showChevron = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, dynamicStyles.text]}>{label}</Text>
      </View>
      {value && (
        <Text style={[styles.settingValue, dynamicStyles.textMuted]}>{value}</Text>
      )}
      {rightElement}
      {showChevron && onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={paperTheme.colors.onSurfaceVariant}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
        <TouchableOpacity
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      {/* Toast Message */}
      {message.text !== '' && (
        <View
          style={[
            styles.toast,
            message.type === 'success'
              ? { backgroundColor: mukokoTheme.colors.success }
              : { backgroundColor: mukokoTheme.colors.error },
          ]}
        >
          <MaterialCommunityIcons
            name={message.type === 'success' ? 'check-circle' : 'alert-circle'}
            size={18}
            color="#fff"
          />
          <Text style={styles.toastText}>{message.text}</Text>
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
            icon="account-outline"
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
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: paperTheme.colors.primary }]}
                onPress={handleUpdateProfile}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            icon="at"
            iconColor="#00B0FF"
            label="Username"
            value={`@${profile?.username || ''}`}
            onPress={() => setEditingUsername(!editingUsername)}
          />

          {/* Username Edit Form */}
          {editingUsername && (
            <View style={styles.editForm}>
              <View style={[styles.warningBox, { backgroundColor: `${mukokoTheme.colors.warning}15` }]}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={18}
                  color={mukokoTheme.colors.warning}
                />
                <Text style={[styles.warningText, { color: mukokoTheme.colors.warning }]}>
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
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: paperTheme.colors.primary }]}
                onPress={handleUpdateUsername}
                disabled={saving || !newUsername}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Username</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <SectionDivider />

        {/* Preferences Section */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <SettingItem
            icon={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
            iconColor={isDark ? '#7C83FD' : '#FFB74D'}
            label="Appearance"
            value={isDark ? 'Dark' : 'System'}
            onPress={handleThemeToggle}
            showChevron={false}
            rightElement={
              <View style={styles.dropdownIcon}>
                <MaterialCommunityIcons
                  name="unfold-more-horizontal"
                  size={20}
                  color={paperTheme.colors.onSurfaceVariant}
                />
              </View>
            }
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            icon="bell-outline"
            iconColor="#FF7043"
            label="Notifications"
            onPress={() => {}}
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            icon="shield-lock-outline"
            iconColor="#26A69A"
            label="Privacy"
            onPress={() => {}}
          />

          <View style={[styles.itemDivider, dynamicStyles.divider]} />

          <SettingItem
            icon="link-variant"
            iconColor="#5C6BC0"
            label="Shared links"
            onPress={() => {}}
          />
        </View>

        <SectionDivider />

        {/* Haptic Feedback */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
              <MaterialCommunityIcons name="vibrate" size={20} color="#9C27B0" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Haptic feedback</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={handleHapticToggle}
              color={paperTheme.colors.primary}
            />
          </View>
        </View>

        <SectionDivider />

        {/* Log Out */}
        <View style={[styles.sectionCard, dynamicStyles.card]}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
              <MaterialCommunityIcons name="logout" size={20} color={mukokoTheme.colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: mukokoTheme.colors.error }]}>Log out</Text>
            </View>
          </TouchableOpacity>
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
