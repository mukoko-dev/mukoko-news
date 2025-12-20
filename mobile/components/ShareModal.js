import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform, Share as RNShare, Clipboard, Animated, PanResponder, Dimensions, ScrollView } from 'react-native';
import { Text, Portal, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ShareModal - Beautiful share modal for articles
 * On mobile: Uses native Share API
 * On web: Shows custom modal with share options
 */
export default function ShareModal({ visible, onDismiss, article }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        } else if (gestureState.dy < 0 && gestureState.dy > -50) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > mukokoTheme.modal.dragThreshold) {
          onDismiss();
          Animated.timing(panY, {
            toValue: 0,
            duration: mukokoTheme.animation.fast,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  if (!article) return null;

  const shareUrl = article.original_url || `https://mukoko.com/article/${article.id}`;
  const shareTitle = article.title;
  const shareText = `${shareTitle}\n\nRead on Mukoko News`;

  const handleNativeShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await RNShare.share({
        message: `${shareText}\n${shareUrl}`,
        title: shareTitle,
        url: shareUrl,
      });
      onDismiss();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        await Clipboard.setString(shareUrl);
      }
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onDismiss();
      }, 1500);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleShareTwitter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    if (Platform.OS === 'web') {
      window.open(twitterUrl, '_blank');
    }
    onDismiss();
  };

  const handleShareWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    }
    onDismiss();
  };

  const handleShareFacebook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (Platform.OS === 'web') {
      window.open(facebookUrl, '_blank');
    }
    onDismiss();
  };

  const handleShareLinkedIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    if (Platform.OS === 'web') {
      window.open(linkedinUrl, '_blank');
    }
    onDismiss();
  };

  // On mobile, use native share sheet
  if (Platform.OS !== 'web') {
    return (
      <Portal>
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={onDismiss}
        >
          <TouchableOpacity
            style={styles.mobileOverlay}
            activeOpacity={1}
            onPress={onDismiss}
          >
            <Animated.View
              style={[
                styles.mobileContent,
                {
                  backgroundColor: theme.colors.surface,
                  maxHeight: SCREEN_HEIGHT * mukokoTheme.modal.maxHeight,
                  minHeight: SCREEN_HEIGHT * mukokoTheme.modal.initialHeight,
                  borderColor: theme.colors.outline,
                },
                { transform: [{ translateY: panY }] }
              ]}
              onStartShouldSetResponder={() => true}
              {...panResponder.panHandlers}
            >
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.onSurfaceVariant }
                ]}
                {...panResponder.panHandlers}
              />

              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  Share Article
                </Text>

                <TouchableOpacity
                  style={[styles.shareOption, { borderColor: theme.colors.outline }]}
                  onPress={handleCopyLink}
                >
                  <MaterialCommunityIcons
                    name={copied ? 'check' : 'link-variant'}
                    size={24}
                    color={copied ? theme.colors.primary : theme.colors.onSurface}
                  />
                  <Text style={[styles.shareOptionText, { color: theme.colors.onSurface }]}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareOption, { borderColor: theme.colors.outline }]}
                  onPress={handleNativeShare}
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                  <Text style={[styles.shareOptionText, { color: theme.colors.onSurface }]}>
                    More Options
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </Portal>
    );
  }

  // On web, show full share modal (slide-up from bottom like mobile)
  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onDismiss}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
                maxHeight: SCREEN_HEIGHT * mukokoTheme.modal.maxHeight,
                minHeight: SCREEN_HEIGHT * mukokoTheme.modal.initialHeight,
              },
              { transform: [{ translateY: panY }] }
            ]}
            onStartShouldSetResponder={() => true}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.onSurfaceVariant }
              ]}
              {...panResponder.panHandlers}
            />

            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  Share Article
                </Text>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.shareGrid}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareTwitter}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#1DA1F2' }]}>
                  <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
                </View>
                <Text style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                  Twitter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareWhatsApp}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={28} color="#fff" />
                </View>
                <Text style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareFacebook}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#1877F2' }]}>
                  <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
                </View>
                <Text style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                  Facebook
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareLinkedIn}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#0A66C2' }]}>
                  <MaterialCommunityIcons name="linkedin" size={28} color="#fff" />
                </View>
                <Text style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                  LinkedIn
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleCopyLink}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons
                    name={copied ? 'check' : 'link-variant'}
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Text>
              </TouchableOpacity>
            </View>

              {article.source_name && (
                <View style={[styles.articlePreview, { borderTopColor: theme.colors.outline }]}>
                  <Text style={[styles.previewSource, { color: theme.colors.onSurfaceVariant }]}>
                    {article.source_name}
                  </Text>
                  <Text
                    style={[styles.previewTitle, { color: theme.colors.onSurface }]}
                    numberOfLines={2}
                  >
                    {article.title}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: mukokoTheme.modal.overlayColor,
    justifyContent: 'flex-end',
  },
  mobileOverlay: {
    flex: 1,
    backgroundColor: mukokoTheme.modal.overlayColor,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: mukokoTheme.modal.borderRadius,
    borderTopRightRadius: mukokoTheme.modal.borderRadius,
    borderTopWidth: 1,
  },
  mobileContent: {
    borderTopLeftRadius: mukokoTheme.modal.borderRadius,
    borderTopRightRadius: mukokoTheme.modal.borderRadius,
    borderTopWidth: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: mukokoTheme.spacing.xl,
    paddingBottom: mukokoTheme.spacing.xl,
  },
  handle: {
    width: mukokoTheme.modal.handleWidth,
    height: mukokoTheme.modal.handleHeight,
    borderRadius: mukokoTheme.modal.handleHeight / 2,
    alignSelf: 'center',
    marginTop: mukokoTheme.spacing.sm,
    marginBottom: mukokoTheme.spacing.lg,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  closeButton: {
    width: mukokoTheme.touchTargets.minimum,
    height: mukokoTheme.touchTargets.minimum,
    borderRadius: mukokoTheme.touchTargets.minimum / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: mukokoTheme.spacing.lg,
    marginBottom: mukokoTheme.spacing.xl,
  },
  shareButton: {
    alignItems: 'center',
    width: 80,
  },
  shareIconCircle: {
    width: mukokoTheme.touchTargets.large,
    height: mukokoTheme.touchTargets.large,
    borderRadius: mukokoTheme.touchTargets.large / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.sm,
  },
  shareButtonLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mukokoTheme.spacing.lg,
    borderRadius: mukokoTheme.roundness,
    borderWidth: 1,
    marginBottom: mukokoTheme.spacing.md,
    gap: mukokoTheme.spacing.lg,
    minHeight: mukokoTheme.touchTargets.large,
  },
  shareOptionText: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  articlePreview: {
    paddingTop: mukokoTheme.spacing.lg,
    borderTopWidth: 1,
    marginTop: mukokoTheme.spacing.md,
  },
  previewSource: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    lineHeight: 20,
  },
});
