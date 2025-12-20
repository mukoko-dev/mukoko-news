/**
 * ProfileHeader - Reusable profile header component
 * WeChat-inspired design with avatar, name, ID, and QR button
 * shadcn-style with NativeWind + Lucide icons
 */

import React from 'react';
import { View, Pressable, Image, Text } from 'react-native';
import { QrCode } from 'lucide-react-native';

const AVATAR_SIZE = 100; // 64px (emojiXL) + 36px = 100px

export default function ProfileHeader({
  displayName,
  username,
  bio,
  avatarUrl,
  showQrButton = true,
  onQrPress,
  className = '',
}) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View className={`bg-surface p-lg mb-sm ${className}`}>
      <View className="flex-row items-center mb-md">
        {/* Avatar */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-[100px] h-[100px] rounded-full"
          />
        ) : (
          <View className="w-[100px] h-[100px] rounded-full bg-tanzanite-container items-center justify-center">
            <Text className="font-serif-bold text-display-small text-tanzanite">
              {getInitials(displayName)}
            </Text>
          </View>
        )}

        {/* Name and ID */}
        <View className="flex-1 ml-lg">
          <Text className="font-serif-bold text-headline-small text-on-surface mb-xs">
            {displayName}
          </Text>
          <Text className="font-sans text-body-small text-on-surface-variant">
            Mukoko ID: {username}
          </Text>
        </View>

        {/* QR Code Icon */}
        {showQrButton && (
          <Pressable
            className="w-touch h-touch items-center justify-center"
            onPress={onQrPress}
          >
            <QrCode size={24} color="#1C1B1F" />
          </Pressable>
        )}
      </View>

      {/* Bio */}
      {bio && (
        <Text className="font-sans text-body-medium text-on-surface-variant leading-5">
          {bio}
        </Text>
      )}
    </View>
  );
}
