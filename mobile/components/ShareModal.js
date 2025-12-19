import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform, Share as RNShare, Clipboard, Animated, PanResponder } from 'react-native';
import { Text, Portal, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import mukokoTheme from '../theme';

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
        if (gestureState.dy > 100) {
          onDismiss();
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
                { backgroundColor: theme.colors.surface },
                { transform: [{ translateY: panY }] }
              ]}
              onStartShouldSetResponder={() => true}
              {...panResponder.panHandlers}
            >
              <View
                style={styles.handle}
                {...panResponder.panHandlers}
              />

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
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </Portal>
    );
  }

  // On web, show full share modal
  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Share Article
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                iconColor={theme.colors.onSurface}
              />
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
              <View style={styles.articlePreview}>
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
          </View>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  mobileContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderTopWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  shareButton: {
    alignItems: 'center',
    width: 80,
  },
  shareIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareButtonLabel: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  shareOptionText: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  articlePreview: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewSource: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    lineHeight: 20,
  },
});
