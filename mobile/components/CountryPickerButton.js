import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform, Animated, PanResponder } from 'react-native';
import { Text, useTheme, ActivityIndicator, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { countries as countriesAPI } from '../api/client';
import mukokoTheme from '../theme';

/**
 * CountryPickerButton - Compact button showing current country with flag
 * Used in navigation tabs/sidebar to show and change the active country
 */
export default function CountryPickerButton({ compact = false, showLabel = true }) {
  const theme = useTheme();
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
        // If dragged more than 80px in any direction, close
        if (Math.abs(gestureState.dy) > 80) {
          setModalVisible(false);
          panY.setValue(0);
          opacity.setValue(1);
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
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          compact && styles.buttonCompact,
          { backgroundColor: theme.colors.glassCard || theme.colors.surface }
        ]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={`Selected country: ${selectedCountry.name}`}
        accessibilityHint="Tap to change country"
      >
        <Text style={styles.flag}>{selectedCountry.emoji}</Text>
        {showLabel && !compact && (
          <Text
            style={[styles.countryName, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {selectedCountry.name}
          </Text>
        )}
        <MaterialCommunityIcons
          name="chevron-down"
          size={compact ? 16 : 20}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <Animated.View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
                {
                  transform: [{ translateY: panY }],
                  opacity: opacity,
                }
              ]}
              onStartShouldSetResponder={() => true}
              {...panResponder.panHandlers}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  Select Country
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.countriesList}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.id}
                    style={[
                      styles.countryItem,
                      selectedCountry.id === country.id && {
                        backgroundColor: theme.colors.primaryContainer
                      }
                    ]}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={styles.countryFlag}>{country.emoji}</Text>
                    <View style={styles.countryInfo}>
                      <Text
                        style={[
                          styles.countryItemName,
                          { color: theme.colors.onSurface }
                        ]}
                      >
                        {country.name}
                      </Text>
                      {country.articleCount > 0 && (
                        <Text
                          style={[
                            styles.articleCount,
                            { color: theme.colors.onSurfaceVariant }
                          ]}
                        >
                          {country.articleCount} articles
                        </Text>
                      )}
                    </View>
                    {selectedCountry.id === country.id && (
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  containerCompact: {
    padding: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minHeight: 44,
  },
  buttonCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  flag: {
    fontSize: 20,
  },
  countryName: {
    fontSize: 14,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: mukokoTheme.fonts.bold.fontFamily,
  },
  closeButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countriesList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    minHeight: 44,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
  },
  countryItemName: {
    fontSize: 16,
    fontFamily: mukokoTheme.fonts.medium.fontFamily,
    marginBottom: 2,
  },
  articleCount: {
    fontSize: 12,
    fontFamily: mukokoTheme.fonts.regular.fontFamily,
  },
});
