import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text as RNText } from 'react-native';
import { Monitor, Laptop, Tablet, ArrowLeftRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const MIN_WIDTH = 768; // Minimum width for admin access

/**
 * AdminScreenWrapper Component
 * Wraps admin screens and shows a "use larger device" message on mobile
 *
 * Migration: NativeWind + Lucide only (NO React Native Paper, NO StyleSheet)
 */
export default function AdminScreenWrapper({ children }) {
  const theme = useTheme();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = dimensions.width < MIN_WIDTH;

  if (isMobile) {
    return (
      <View className="flex-1 justify-center items-center p-xl bg-background">
        <View className="items-center" style={{ maxWidth: 400 }}>
          <View className="w-[96px] h-[96px] rounded-full justify-center items-center mb-xl bg-tanzanite/10">
            <Monitor size={48} color={theme.colors.tanzanite} />
          </View>

          <RNText className="font-serif-bold text-headline-small text-on-surface text-center mb-md">
            Desktop View Required
          </RNText>

          <RNText className="font-sans text-body-large text-on-surface-variant text-center mb-sm">
            The admin dashboard is optimized for larger screens.
          </RNText>

          <RNText className="font-sans text-body-medium text-on-surface-variant text-center mb-xxl">
            Please access this section from a tablet (landscape) or desktop device for the best experience.
          </RNText>

          <View className="self-stretch gap-lg">
            <View className="flex-row items-center py-md px-lg rounded-button bg-surface-variant">
              <Laptop size={24} color={theme.colors.tanzanite} />
              <RNText className="font-sans text-body-medium text-on-surface ml-md">
                Laptop or Desktop
              </RNText>
            </View>
            <View className="flex-row items-center py-md px-lg rounded-button bg-surface-variant">
              <Tablet size={24} color={theme.colors.tanzanite} />
              <RNText className="font-sans text-body-medium text-on-surface ml-md">
                Tablet (Landscape Mode)
              </RNText>
            </View>
            <View className="flex-row items-center py-md px-lg rounded-button bg-surface-variant">
              <ArrowLeftRight size={24} color={theme.colors.tanzanite} />
              <RNText className="font-sans text-body-medium text-on-surface ml-md">
                Minimum 768px width
              </RNText>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return children;
}
