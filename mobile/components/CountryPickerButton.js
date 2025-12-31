import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, ScrollView, Platform, Animated, PanResponder, Dimensions, Text as RNText, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, X, Check } from 'lucide-react-native';
import { countries as countriesAPI } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CountryPickerButton - Compact button showing current country with flag
 * Used in navigation tabs/sidebar to show and change the active country
 */
export default function CountryPickerButton({ compact = false, showLabel = true }) {
  const { theme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow dragging in any direction
        panY.setValue(gestureState.dy);
        // Fade out as dragging
        const newOpacity = Math.max(0.3, 1 - Math.abs(gestureState.dy) / 300);
        opacity.setValue(newOpacity);
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 150px threshold, close
        if (gestureState.dy > 150) {
          setModalVisible(false);
          Animated.timing(panY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // Spring back
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Load countries and selected country
  useEffect(() => {
    loadCountries();
    loadSelectedCountry();
  }, []);

  const loadCountries = async () => {
    try {
      const result = await countriesAPI.getAll({ withStats: true });
      if (result.data?.countries) {
        const enabledCountries = result.data.countries
          .filter(c => c.enabled !== false)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setCountries(enabledCountries);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedCountry = async () => {
    try {
      // Try to get from storage first
      const stored = await AsyncStorage.getItem('selectedCountry');
      if (stored) {
        setSelectedCountry(JSON.parse(stored));
        return;
      }

      // Try to detect from device location
      const detected = await detectCountryFromLocation();
      if (detected) {
        setSelectedCountry(detected);
        await AsyncStorage.setItem('selectedCountry', JSON.stringify(detected));
        return;
      }

      // Default to Zimbabwe
      const defaultCountry = { id: 'ZW', name: 'Zimbabwe', emoji: '🇿🇼' };
      setSelectedCountry(defaultCountry);
      await AsyncStorage.setItem('selectedCountry', JSON.stringify(defaultCountry));
    } catch (error) {
      console.error('Failed to load selected country:', error);
      // Fallback to Zimbabwe
      setSelectedCountry({ id: 'ZW', name: 'Zimbabwe', emoji: '🇿🇼' });
    }
  };

  const detectCountryFromLocation = async () => {
    if (Platform.OS !== 'web') {
      // For native apps, we'd use expo-location here
      // For now, return null to use default
      return null;
    }

    try {
      // Try to get geolocation from browser
      if (!navigator.geolocation) return null;

      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(null), 5000); // 5s timeout

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(timeout);
            const { latitude, longitude } = position.coords;

            // Map coordinates to country (simplified - in production use a geocoding API)
            const detected = mapCoordsToCountry(latitude, longitude);
            resolve(detected);
          },
          () => {
            clearTimeout(timeout);
            resolve(null); // Geolocation denied or failed
          },
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      return null;
    }
  };

  const mapCoordsToCountry = (lat, lng) => {
    // Simplified mapping - in production, use a proper geocoding API
    // This covers approximate bounding boxes for African countries

    const countryMappings = [
      { id: 'ZW', name: 'Zimbabwe', emoji: '🇿🇼', lat: [-22, -15], lng: [25, 33] },
      { id: 'ZA', name: 'South Africa', emoji: '🇿🇦', lat: [-35, -22], lng: [16, 33] },
      { id: 'KE', name: 'Kenya', emoji: '🇰🇪', lat: [-5, 5], lng: [33, 42] },
      { id: 'NG', name: 'Nigeria', emoji: '🇳🇬', lat: [4, 14], lng: [2, 15] },
      { id: 'GH', name: 'Ghana', emoji: '🇬🇭', lat: [4, 12], lng: [-4, 2] },
      { id: 'TZ', name: 'Tanzania', emoji: '🇹🇿', lat: [-12, -1], lng: [29, 41] },
      { id: 'UG', name: 'Uganda', emoji: '🇺🇬', lat: [-2, 5], lng: [29, 35] },
      { id: 'RW', name: 'Rwanda', emoji: '🇷🇼', lat: [-3, -1], lng: [28, 31] },
      { id: 'ZM', name: 'Zambia', emoji: '🇿🇲', lat: [-18, -8], lng: [21, 34] },
      { id: 'BW', name: 'Botswana', emoji: '🇧🇼', lat: [-27, -17], lng: [19, 30] },
      { id: 'MW', name: 'Malawi', emoji: '🇲🇼', lat: [-17, -9], lng: [32, 36] },
      { id: 'MZ', name: 'Mozambique', emoji: '🇲🇿', lat: [-27, -10], lng: [30, 41] },
      { id: 'NA', name: 'Namibia', emoji: '🇳🇦', lat: [-29, -16], lng: [11, 26] },
      { id: 'ET', name: 'Ethiopia', emoji: '🇪🇹', lat: [3, 15], lng: [33, 48] },
      { id: 'EG', name: 'Egypt', emoji: '🇪🇬', lat: [22, 32], lng: [24, 37] },
      { id: 'MA', name: 'Morocco', emoji: '🇲🇦', lat: [27, 36], lng: [-13, -1] },
    ];

    for (const country of countryMappings) {
      if (lat >= country.lat[0] && lat <= country.lat[1] &&
          lng >= country.lng[0] && lng <= country.lng[1]) {
        return country;
      }
    }

    return null; // Outside supported countries
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    await AsyncStorage.setItem('selectedCountry', JSON.stringify(country));
  };

  if (loading || !selectedCountry) {
    return (
      <View className={`${compact ? 'p-xs' : 'p-sm'}`}>
        <ActivityIndicator size="small" color={theme.colors.tanzanite} />
      </View>
    );
  }

  return (
    <>
      <Pressable
        className={`flex-row items-center rounded-button gap-xs min-h-touch ${
          compact ? 'px-sm py-xs' : 'px-md py-sm'
        }`}
        style={{ backgroundColor: theme.colors.surface }}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={`Selected country: ${selectedCountry.name}`}
        accessibilityHint="Tap to change country"
        accessibilityRole="button"
      >
        <RNText className="text-[20px]">{selectedCountry.emoji}</RNText>
        {showLabel && !compact && (
          <RNText
            className="font-sans-medium text-[14px]"
            style={{ color: theme.colors['on-surface'] }}
            numberOfLines={1}
          >
            {selectedCountry.name}
          </RNText>
        )}
        <ChevronDown
          size={compact ? 16 : 20}
          color={theme.colors['on-surface-variant']}
          strokeWidth={1.5}
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <Pressable
            className="absolute inset-0"
            onPress={() => setModalVisible(false)}
          />
          <Animated.View
            className="w-full rounded-t-card border-t"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              maxHeight: SCREEN_HEIGHT * 0.85,
              minHeight: SCREEN_HEIGHT * 0.5,
              transform: [{ translateY: panY }],
              opacity: opacity,
            }}
            onStartShouldSetResponder={() => true}
            {...panResponder.panHandlers}
          >
            <View
              className="w-[36px] h-[4px] rounded-full self-center mt-sm mb-lg opacity-30"
              style={{ backgroundColor: theme.colors['on-surface-variant'] }}
              {...panResponder.panHandlers}
            />

            <View className="flex-row justify-between items-center mx-lg mb-lg">
              <RNText className="text-[20px] font-sans-bold" style={{ color: theme.colors['on-surface'] }}>
                Select Country
              </RNText>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="p-xs min-w-touch min-h-touch items-center justify-center"
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <X
                  size={24}
                  color={theme.colors['on-surface']}
                  strokeWidth={1.5}
                />
              </Pressable>
            </View>

            <ScrollView className="px-lg" showsVerticalScrollIndicator={false}>
              {countries.map((country) => (
                <Pressable
                  key={country.id}
                  className={`flex-row items-center p-md rounded-button mb-sm gap-md min-h-touch ${
                    selectedCountry.id === country.id ? 'bg-tanzanite-container' : ''
                  }`}
                  onPress={() => handleCountrySelect(country)}
                  accessibilityLabel={`${country.name}${country.articleCount ? `, ${country.articleCount} articles` : ''}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCountry.id === country.id }}
                >
                  <RNText className="text-[28px]">{country.emoji}</RNText>
                  <View className="flex-1">
                    <RNText
                      className="font-sans-medium text-[16px] mb-[2px]"
                      style={{ color: theme.colors['on-surface'] }}
                    >
                      {country.name}
                    </RNText>
                    {country.articleCount > 0 && (
                      <RNText
                        className="font-sans text-[12px]"
                        style={{ color: theme.colors['on-surface-variant'] }}
                      >
                        {country.articleCount} articles
                      </RNText>
                    )}
                  </View>
                  {selectedCountry.id === country.id && (
                    <Check
                      size={24}
                      color={theme.colors.tanzanite}
                      strokeWidth={2}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
