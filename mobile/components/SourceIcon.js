/**
 * SourceIcon Component
 *
 * Displays a news source favicon with fallback to initials.
 * Uses Google's Favicon API for reliable icon fetching.
 */

import React, { useState, memo } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import {
  getFaviconUrl,
  getSourceColors,
  getSourceInitials,
  isKnownSource,
} from '../services/FaviconService';

/**
 * SourceIcon - Displays source favicon with initials fallback
 *
 * @param {string} source - Source name
 * @param {number} size - Icon size (default: 20)
 * @param {object} style - Additional container styles
 * @param {boolean} showBorder - Show border around icon (default: true)
 */
function SourceIcon({ source, size = 20, style, showBorder = true }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const faviconUrl = getFaviconUrl(source, size * 2); // Request 2x for retina
  const colors = getSourceColors(source);
  const initials = getSourceInitials(source);
  const hasKnownSource = isKnownSource(source);

  // Show initials if no favicon URL or if image failed to load
  const showInitials = !faviconUrl || imageError;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: showInitials ? colors.primary : 'transparent',
    borderWidth: showBorder ? 1 : 0,
    borderColor: showBorder ? 'rgba(0,0,0,0.1)' : 'transparent',
  };

  const initialsStyle = {
    fontSize: size * 0.45,
    color: '#ffffff',
    fontWeight: '700',
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {!showInitials && (
        <>
          {/* Loading placeholder */}
          {!imageLoaded && (
            <View style={[styles.placeholder, { backgroundColor: colors.primary }]}>
              <Text style={initialsStyle}>{initials.charAt(0)}</Text>
            </View>
          )}
          <Image
            source={{ uri: faviconUrl }}
            style={[
              styles.favicon,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: imageLoaded ? 1 : 0,
              },
            ]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      )}
      {showInitials && (
        <Text style={initialsStyle} numberOfLines={1}>
          {initials.substring(0, 2)}
        </Text>
      )}
    </View>
  );
}

/**
 * SourceBadge - Source icon with name displayed next to it
 *
 * @param {string} source - Source name
 * @param {number} iconSize - Icon size (default: 16)
 * @param {number} fontSize - Text font size (default: 12)
 * @param {string} textColor - Text color
 * @param {object} style - Additional container styles
 */
export function SourceBadge({
  source,
  iconSize = 16,
  fontSize = 12,
  textColor = '#666',
  style,
}) {
  const colors = getSourceColors(source);

  return (
    <View style={[styles.badgeContainer, style]}>
      <SourceIcon source={source} size={iconSize} showBorder={false} />
      <Text
        style={[styles.badgeText, { fontSize, color: textColor }]}
        numberOfLines={1}
      >
        {source}
      </Text>
    </View>
  );
}

/**
 * SourceChip - Colored chip with source icon and name
 * Useful for category/filter displays
 *
 * @param {string} source - Source name
 * @param {boolean} selected - Whether chip is selected
 * @param {function} onPress - Press handler
 * @param {object} style - Additional styles
 */
export function SourceChip({ source, selected = false, onPress, style }) {
  const colors = getSourceColors(source);

  return (
    <View
      style={[
        styles.chipContainer,
        {
          backgroundColor: selected ? colors.primary : 'rgba(0,0,0,0.05)',
          borderColor: colors.primary,
        },
        style,
      ]}
    >
      <SourceIcon source={source} size={14} showBorder={false} />
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#ffffff' : colors.primary },
        ]}
        numberOfLines={1}
      >
        {source}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  favicon: {
    position: 'absolute',
  },

  // Badge styles
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontWeight: '500',
  },

  // Chip styles
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default memo(SourceIcon);
