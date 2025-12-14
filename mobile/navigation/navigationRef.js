import { createNavigationContainerRef } from '@react-navigation/native';

// Navigation ref for use outside of React components or outside navigation tree
export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen from anywhere in the app.
 * Safe to call even if navigation isn't ready yet.
 * @param {string} name - Screen name to navigate to
 * @param {object} params - Optional navigation params
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * Check if navigation is ready
 * @returns {boolean}
 */
export function isNavigationReady() {
  return navigationRef.isReady();
}
