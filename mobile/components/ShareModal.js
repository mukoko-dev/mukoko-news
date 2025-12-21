import React, { useState, useRef } from 'react';
import { View, Pressable, Modal, Platform, Share as RNShare, Clipboard, Animated, PanResponder, Dimensions, ScrollView, Text as RNText, StyleSheet } from 'react-native';
import { Twitter, Share2, Link, Check, X, MessageCircle, Facebook, Linkedin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import mukokoTheme from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ShareModal - Beautiful share modal for articles
 * On mobile: Uses native Share API
 * On web: Shows custom modal with share options
 */
export default function ShareModal({ visible, onDismiss, article }) {
  const { theme } = useTheme();
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
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onDismiss}
      >
        <Pressable
          style={styles.mobileOverlay}
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
              <RNText style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Share Article
              </RNText>

              <Pressable
                style={[styles.shareOption, { borderColor: theme.colors.outline }]}
                onPress={handleCopyLink}
              >
                {copied ? (
                  <Check size={24} color={theme.colors.primary} />
                ) : (
                  <Link size={24} color={theme.colors.onSurface} />
                )}
                <RNText style={[styles.shareOptionText, { color: theme.colors.onSurface }]}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </RNText>
              </Pressable>

              <Pressable
                style={[styles.shareOption, { borderColor: theme.colors.outline }]}
                onPress={handleNativeShare}
              >
                <Share2 size={24} color={theme.colors.onSurface} />
                <RNText style={[styles.shareOptionText, { color: theme.colors.onSurface }]}>
                  More Options
                </RNText>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }

  // On web, show full share modal (slide-up from bottom like mobile)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable
        style={styles.overlay}
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
              <RNText style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Share Article
              </RNText>
              <Pressable
                onPress={onDismiss}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            <View style={styles.shareGrid}>
            <Pressable
              style={styles.shareButton}
              onPress={handleShareTwitter}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: theme.colors['brand-twitter'] }]}>
                <Twitter size={28} color="#fff" />
              </View>
              <RNText style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                Twitter
              </RNText>
            </Pressable>

            <Pressable
              style={styles.shareButton}
              onPress={handleShareWhatsApp}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: theme.colors['brand-whatsapp'] }]}>
                <MessageCircle size={28} color="#fff" />
              </View>
              <RNText style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                WhatsApp
              </RNText>
            </Pressable>

            <Pressable
              style={styles.shareButton}
              onPress={handleShareFacebook}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: theme.colors['brand-facebook'] }]}>
                <Facebook size={28} color="#fff" />
              </View>
              <RNText style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                Facebook
              </RNText>
            </Pressable>

            <Pressable
              style={styles.shareButton}
              onPress={handleShareLinkedIn}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: theme.colors['brand-linkedin'] }]}>
                <Linkedin size={28} color="#fff" />
              </View>
              <RNText style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                LinkedIn
              </RNText>
            </Pressable>

            <Pressable
              style={styles.shareButton}
              onPress={handleCopyLink}
            >
              <View style={[styles.shareIconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                {copied ? (
                  <Check size={28} color={theme.colors.primary} />
                ) : (
                  <Link size={28} color={theme.colors.primary} />
                )}
              </View>
              <RNText style={[styles.shareButtonLabel, { color: theme.colors.onSurface }]}>
                {copied ? 'Copied!' : 'Copy Link'}
              </RNText>
            </Pressable>
          </View>

            {article.source_name && (
              <View style={[styles.articlePreview, { borderTopColor: theme.colors.outline }]}>
                <RNText style={[styles.previewSource, { color: theme.colors.onSurfaceVariant }]}>
                  {article.source_name}
                </RNText>
                <RNText
                  style={[styles.previewTitle, { color: theme.colors.onSurface }]}
                  numberOfLines={2}
                >
                  {article.title}
                </RNText>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
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
