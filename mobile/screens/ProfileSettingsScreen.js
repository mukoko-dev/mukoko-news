/**
 * ProfileSettingsScreen - Modern settings design
 * Clean, grouped settings with profile card header
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Switch,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { mukokoTheme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { user as userAPI } from '../api/client';

const AVATAR_SIZE = 80;

export default function ProfileSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const paperTheme = usePaperTheme();
  const { isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();

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

  useEffect(() => {
    loadProfile();
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
      setDisplayName(data.displayName || data.display_name || '');
      setBio(data.bio || '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await userAPI.updateProfile({
        displayName: displayName || undefined,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
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
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
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

  const displayNameValue = profile?.display_name || profile?.displayName || profile?.username || '';
  const avatarUrl = profile?.avatar_url || profile?.avatarUrl;

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
            name="arrow-left"
            size={24}
            color={paperTheme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
        <View style={styles.headerButton} />
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, dynamicStyles.card]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[paperTheme.colors.primary, paperTheme.colors.tertiary]}
                style={styles.avatarRing}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: paperTheme.colors.primaryContainer }]}>
                    <Text style={[styles.avatarInitials, { color: paperTheme.colors.primary }]}>
                      {getInitials(displayNameValue)}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, dynamicStyles.text]}>
                {displayNameValue}
              </Text>
              <Text style={[styles.profileUsername, dynamicStyles.textMuted]}>
                @{profile?.username}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>ACCOUNT</Text>

          {/* Edit Profile */}
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.card]}
            onPress={() => setEditingProfile(!editingProfile)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="account-edit-outline"
                size={22}
                color={paperTheme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Edit Profile</Text>
              <Text style={[styles.settingValue, dynamicStyles.textMuted]}>
                Name and bio
              </Text>
            </View>
            <MaterialCommunityIcons
              name={editingProfile ? 'chevron-up' : 'chevron-right'}
              size={24}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Profile Edit Form */}
          {editingProfile && (
            <View style={[styles.editForm, dynamicStyles.card]}>
              <TextInput
                mode="flat"
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                style={[styles.input, dynamicStyles.input]}
                underlineColor="transparent"
                activeUnderlineColor={paperTheme.colors.primary}
                selectionColor={paperTheme.colors.primary}
                cursorColor={paperTheme.colors.primary}
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
                selectionColor={paperTheme.colors.primary}
                cursorColor={paperTheme.colors.primary}
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

          {/* Change Username */}
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.card]}
            onPress={() => setEditingUsername(!editingUsername)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="at"
                size={22}
                color={paperTheme.colors.tertiary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Username</Text>
              <Text style={[styles.settingValue, dynamicStyles.textMuted]}>
                @{profile?.username}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={editingUsername ? 'chevron-up' : 'chevron-right'}
              size={24}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Username Edit Form */}
          {editingUsername && (
            <View style={[styles.editForm, dynamicStyles.card]}>
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
                selectionColor={paperTheme.colors.primary}
                cursorColor={paperTheme.colors.primary}
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

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>PREFERENCES</Text>

          {/* Dark Mode */}
          <View style={[styles.settingItem, dynamicStyles.card]}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
                size={22}
                color={isDark ? '#7C83FD' : '#FFB74D'}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Dark Mode</Text>
              <Text style={[styles.settingValue, dynamicStyles.textMuted]}>
                {isDark ? 'On' : 'Off'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              color={paperTheme.colors.primary}
            />
          </View>

          {/* Notifications - Placeholder */}
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.card]}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={paperTheme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Notifications</Text>
              <Text style={[styles.settingValue, dynamicStyles.textMuted]}>
                Coming soon
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>ABOUT</Text>

          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.card]}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={22}
                color={paperTheme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Privacy Policy</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.card]}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color={paperTheme.colors.primary}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Terms of Service</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={paperTheme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <View style={[styles.settingItem, dynamicStyles.card]}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, dynamicStyles.text]}>Version</Text>
              <Text style={[styles.settingValue, dynamicStyles.textMuted]}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: mukokoTheme.colors.error }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={mukokoTheme.colors.error}
          />
          <Text style={[styles.signOutText, { color: mukokoTheme.colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.textMuted]}>
            Mukoko News
          </Text>
          <Text style={[styles.footerSubtext, dynamicStyles.textMuted]}>
            Zimbabwe's News Platform
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
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
    padding: 16,
    paddingBottom: 100,
  },

  // Profile Card
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {},
  avatarRing: {
    width: AVATAR_SIZE + 4,
    height: AVATAR_SIZE + 4,
    borderRadius: (AVATAR_SIZE + 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  settingValue: {
    fontSize: 13,
    marginTop: 2,
  },

  // Edit Form
  editForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: -4,
    borderWidth: 1,
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

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },

  // Error state styles
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: mukokoTheme.spacing.md,
    marginBottom: mukokoTheme.spacing.md,
    paddingHorizontal: mukokoTheme.spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: mukokoTheme.spacing.sm,
    paddingVertical: mukokoTheme.spacing.sm,
    paddingHorizontal: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    marginTop: mukokoTheme.spacing.sm,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
});
