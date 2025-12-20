/**
 * ProfileHeader - Reusable profile header component
 * WeChat-inspired design with avatar, name, ID, and QR button
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

const AVATAR_SIZE = mukokoTheme.layout.emojiXL + 36; // 100px

export default function ProfileHeader({
  displayName,
  username,
  bio,
  avatarUrl,
  showQrButton = true,
  onQrPress,
  style,
}) {
  const paperTheme = usePaperTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={[styles.profileHeader, { backgroundColor: paperTheme.colors.surface }, style]}>
      <View style={styles.profileRow}>
        {/* Avatar */}
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: paperTheme.colors.primaryContainer }]}>
            <Text style={[styles.avatarInitials, { color: paperTheme.colors.primary }]}>
              {getInitials(displayName)}
            </Text>
          </View>
        )}

        {/* Name and ID */}
        <View style={styles.profileInfo}>
          <Text style={[styles.displayName, { color: paperTheme.colors.onSurface }]}>
            {displayName}
          </Text>
          <Text style={[styles.mukokoId, { color: paperTheme.colors.onSurfaceVariant }]}>
            Mukoko ID: {username}
          </Text>
        </View>

        {/* QR Code Icon */}
        {showQrButton && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={onQrPress}
          >
            <MaterialCommunityIcons
              name="qrcode"
              size={mukokoTheme.layout.badgeMedium}
              color={paperTheme.colors.onSurface}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Bio */}
      {bio && (
        <Text style={[styles.bio, { color: paperTheme.colors.onSurfaceVariant }]}>
          {bio}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    padding: mukokoTheme.spacing.lg,
    marginBottom: mukokoTheme.spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mukokoTheme.spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: mukokoTheme.typography.displaySmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
  profileInfo: {
    flex: 1,
    marginLeft: mukokoTheme.spacing.lg,
  },
  displayName: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    marginBottom: mukokoTheme.spacing.xs,
  },
  mukokoId: {
    fontSize: mukokoTheme.typography.bodySmall,
  },
  qrButton: {
    width: mukokoTheme.touchTargets.minimum,
    height: mukokoTheme.touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bio: {
    fontSize: mukokoTheme.typography.bodyMedium,
    lineHeight: 20,
  },
});
