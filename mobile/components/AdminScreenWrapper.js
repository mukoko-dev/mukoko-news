import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MIN_WIDTH = 768; // Minimum width for admin access

/**
 * AdminScreenWrapper Component
 * Wraps admin screens and shows a "use larger device" message on mobile
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
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <MaterialCommunityIcons
              name="monitor"
              size={48}
              color={theme.colors.primary}
            />
          </View>

          <Text variant="headlineSmall" style={styles.title}>
            Desktop View Required
          </Text>

          <Text
            variant="bodyLarge"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            The admin dashboard is optimized for larger screens.
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.subMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            Please access this section from a tablet (landscape) or desktop device for the best experience.
          </Text>

          <View style={styles.requirements}>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="laptop"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
                Laptop or Desktop
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="tablet"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
                Tablet (Landscape Mode)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="arrow-expand-horizontal"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
                Minimum 768px width
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    textAlign: 'center',
    marginBottom: 32,
  },
  requirements: {
    alignSelf: 'stretch',
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
});
