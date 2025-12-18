/**
 * AuthMigrationModal Component
 * Informs users about ongoing authentication migration
 *
 * Two variants:
 * 1. 'migration' (default) - Shows on auth screens, allows full app access
 * 2. 'admin-locked' - Shows on admin-only features, requires going back
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Text, Button, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../styles/globalStyles';
import mukokoTheme from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Storage key for dismissal
const AUTH_MIGRATION_DISMISSED_KEY = '@mukoko_auth_migration_dismissed';

// Modal dimensions
const MODAL_MAX_WIDTH = 400;
const MODAL_PADDING = 24;

/**
 * AuthMigrationModal - Modal informing users about auth migration
 *
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onDismiss - Called when modal is dismissed
 * @param {function} onContinue - Called when user clicks continue/go back
 * @param {'migration'|'admin-locked'} variant - Modal variant type
 */
export default function AuthMigrationModal({
  visible,
  onDismiss,
  onContinue,
  variant = 'migration',
}) {
  const paperTheme = usePaperTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const isAdminLocked = variant === 'admin-locked';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleDismiss = async () => {
    if (!isAdminLocked) {
      try {
        await AsyncStorage.setItem(AUTH_MIGRATION_DISMISSED_KEY, 'true');
      } catch (error) {
        console.error('[AuthMigrationModal] Failed to save dismissal:', error);
      }
    }
    animateOut(onDismiss);
  };

  const handleContinue = async () => {
    if (!isAdminLocked) {
      try {
        await AsyncStorage.setItem(AUTH_MIGRATION_DISMISSED_KEY, 'true');
      } catch (error) {
        console.error('[AuthMigrationModal] Failed to save dismissal:', error);
      }
    }
    animateOut(onContinue);
  };

  if (!visible) return null;

  // Content based on variant
  const content = isAdminLocked
    ? {
        icon: 'lock',
        iconBgColor: mukokoTheme.colors.errorContainer || '#F9DEDC',
        iconColor: mukokoTheme.colors.error,
        title: 'Feature Locked',
        message:
          'This feature requires admin access and is currently unavailable during our authentication system upgrade.',
        features: [
          { icon: 'shield-lock', text: 'Admin-only feature' },
          { icon: 'clock-outline', text: 'Will be available after migration' },
        ],
        subtext: 'Please check back soon for access to admin features.',
        buttonText: 'Go Back',
        buttonIcon: 'arrow-left',
      }
    : {
        icon: 'account-convert',
        iconBgColor: mukokoTheme.colors.primaryContainer,
        iconColor: mukokoTheme.colors.primary,
        title: 'Account System Upgrade',
        message:
          "We're migrating to a new authentication system for improved security and features.",
        features: [
          { icon: 'check-circle', text: 'Full access to all news content', color: mukokoTheme.colors.success },
          { icon: 'check-circle', text: 'Personalize your news feed', color: mukokoTheme.colors.success },
          { icon: 'check-circle', text: 'Save articles for later', color: mukokoTheme.colors.success },
        ],
        subtext: 'Sign-in will be available soon. In the meantime, enjoy the full app!',
        buttonText: 'Continue to App',
        buttonIcon: null,
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={isAdminLocked ? handleContinue : handleDismiss}
          accessibilityLabel="Close modal"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Modal Content */}
      <View style={styles.modalWrapper}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: paperTheme.colors.surface,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button - only show for migration variant */}
          {!isAdminLocked && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={paperTheme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: content.iconBgColor }]}>
            <MaterialCommunityIcons
              name={content.icon}
              size={40}
              color={content.iconColor}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
            {content.title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: paperTheme.colors.onSurfaceVariant }]}>
            {content.message}
          </Text>

          {/* Features List */}
          <View style={styles.featureList}>
            {content.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={20}
                  color={feature.color || paperTheme.colors.onSurfaceVariant}
                />
                <Text style={[styles.featureText, { color: paperTheme.colors.onSurface }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Subtext */}
          <Text style={[styles.subtext, { color: paperTheme.colors.onSurfaceVariant }]}>
            {content.subtext}
          </Text>

          {/* Action Button */}
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={content.buttonIcon}
          >
            {content.buttonText}
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Hook to manage auth migration modal state
 * Shows modal automatically if user hasn't dismissed it before
 */
export function useAuthMigrationModal() {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkDismissal = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(AUTH_MIGRATION_DISMISSED_KEY);
        // Show modal if not previously dismissed
        if (!dismissed) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('[useAuthMigrationModal] Failed to check dismissal:', error);
      }
      setHasChecked(true);
    };

    checkDismissal();
  }, []);

  const dismissModal = () => {
    setShowModal(false);
  };

  return { showModal, dismissModal, hasChecked };
}

/**
 * Hook for admin-locked features
 * Always shows modal (doesn't persist dismissal)
 */
export function useAdminLockedModal() {
  const [showModal, setShowModal] = useState(true);

  const dismissModal = () => {
    setShowModal(false);
  };

  const showAgain = () => {
    setShowModal(true);
  };

  return { showModal, dismissModal, showAgain };
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MODAL_PADDING,
  },
  modalContainer: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: mukokoTheme.fonts.serifBold?.fontFamily,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  featureList: {
    width: '100%',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subtext: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
