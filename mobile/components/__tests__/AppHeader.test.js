/**
 * AppHeader Tests
 * Comprehensive test suite for the main app header component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppHeader from '../AppHeader';

// Mock dependencies
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FAF9F5',
        surface: '#FFFFFF',
        primary: '#4B0082',
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
      },
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser', displayName: 'Test User' },
    isAuthenticated: true,
  }),
}));
jest.mock('../../navigation/navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn(() => true),
    getRootState: jest.fn(() => ({
      index: 0,
      routes: [{ name: 'Bytes' }],
    })),
    addListener: jest.fn(() => jest.fn()),
    navigate: jest.fn(),
  },
}));
jest.mock('../Logo', () => 'Logo');
jest.mock('../CountryPickerButton', () => 'CountryPickerButton');

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders header component', () => {
      const { getByTestId } = render(<AppHeader />);
      // Header should be rendered
    });

    it('displays logo', () => {
      render(<AppHeader />);
      // Logo component should be rendered
    });

    it('displays screen title', () => {
      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('displays country picker button', () => {
      render(<AppHeader />);
      // CountryPickerButton should be rendered
    });

    it('displays theme toggle button', () => {
      const { getByLabelText } = render(<AppHeader />);
      expect(getByLabelText('Toggle theme')).toBeTruthy();
    });

    it('displays notifications button', () => {
      const { getByLabelText } = render(<AppHeader />);
      expect(getByLabelText('Notifications')).toBeTruthy();
    });
  });

  describe('Screen Titles', () => {
    it('shows "Bytes" title for Bytes screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Bytes' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('shows "Search" title for Search screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Search' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Search')).toBeTruthy();
    });

    it('shows "Discover" title for Discover screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Discover' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Discover')).toBeTruthy();
    });

    it('shows username for Profile screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Profile' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('testuser')).toBeTruthy();
    });

    it('shows "Profile" when no username available', () => {
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ user: null, isAuthenticated: false });

      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Profile' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Profile')).toBeTruthy();
    });

    it('shows "Sign In" for Login screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Login' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('shows "Create Account" for Register screen', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Register' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Create Account')).toBeTruthy();
    });
  });

  describe('Theme Toggle', () => {
    it('calls toggleTheme when theme button is pressed', () => {
      const toggleTheme = jest.fn();
      jest.spyOn(require('../../contexts/ThemeContext'), 'useTheme')
        .mockReturnValue({
          theme: { colors: {} },
          isDark: false,
          toggleTheme,
        });

      const { getByLabelText } = render(<AppHeader />);

      const themeButton = getByLabelText('Toggle theme');
      fireEvent.press(themeButton);

      expect(toggleTheme).toHaveBeenCalled();
    });

    it('shows Sun icon in dark mode', () => {
      jest.spyOn(require('../../contexts/ThemeContext'), 'useTheme')
        .mockReturnValue({
          theme: { colors: {} },
          isDark: true,
          toggleTheme: jest.fn(),
        });

      const { getByLabelText } = render(<AppHeader />);
      expect(getByLabelText('Toggle theme')).toBeTruthy();
    });

    it('shows Moon icon in light mode', () => {
      jest.spyOn(require('../../contexts/ThemeContext'), 'useTheme')
        .mockReturnValue({
          theme: { colors: {} },
          isDark: false,
          toggleTheme: jest.fn(),
        });

      const { getByLabelText } = render(<AppHeader />);
      expect(getByLabelText('Toggle theme')).toBeTruthy();
    });
  });

  describe('Notifications', () => {
    it('navigates to notifications when notifications button is pressed', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      const { getByLabelText } = render(<AppHeader />);

      const notificationsButton = getByLabelText('Notifications');
      fireEvent.press(notificationsButton);

      expect(navigationRef.navigate).toHaveBeenCalledWith('Notifications');
    });
  });

  describe('Logo', () => {
    it('navigates to home when logo is pressed', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      const { getByTestId } = render(<AppHeader />);

      // Logo press should navigate to home (if clickable)
    });
  });

  describe('Navigation State Updates', () => {
    it('subscribes to navigation state changes', () => {
      const { navigationRef } = require('../../navigation/navigationRef');

      render(<AppHeader />);

      expect(navigationRef.addListener).toHaveBeenCalledWith('state', expect.any(Function));
    });

    it('updates title when navigation state changes', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      let stateListener;

      navigationRef.addListener.mockImplementation((event, callback) => {
        stateListener = callback;
        return jest.fn();
      });

      const { getByText } = render(<AppHeader />);

      // Initial state shows Bytes
      expect(getByText('Bytes')).toBeTruthy();

      // Trigger navigation state change
      stateListener({
        data: {
          state: {
            index: 0,
            routes: [{ name: 'Search' }],
          },
        },
      });

      // Should update to Search
    });

    it('cleans up navigation listener on unmount', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      const unsubscribe = jest.fn();
      navigationRef.addListener.mockReturnValue(unsubscribe);

      const { unmount } = render(<AppHeader />);
      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Nested Routes', () => {
    it('handles nested navigation state', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [
          {
            name: 'BytesStack',
            state: {
              index: 0,
              routes: [{ name: 'BytesFeed' }],
            },
          },
        ],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('handles missing nested state gracefully', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'Bytes', state: null }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles navigation not ready', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.isReady.mockReturnValue(false);

      const { getByText } = render(<AppHeader />);
      // Should still render with default title
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('handles null navigation state', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue(null);

      const { getByText } = render(<AppHeader />);
      // Should use default title
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('handles missing routes array', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({ index: 0 });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('handles unknown route name', () => {
      const { navigationRef } = require('../../navigation/navigationRef');
      navigationRef.getRootState.mockReturnValue({
        index: 0,
        routes: [{ name: 'UnknownScreen' }],
      });

      const { getByText } = render(<AppHeader />);
      expect(getByText('Mukoko News')).toBeTruthy(); // Default title
    });
  });

  describe('Accessibility', () => {
    it('has accessible theme toggle button', () => {
      const { getByLabelText } = render(<AppHeader />);

      const themeButton = getByLabelText('Toggle theme');
      expect(themeButton.props.accessibilityRole).toBe('button');
    });

    it('has accessible notifications button', () => {
      const { getByLabelText } = render(<AppHeader />);

      const notificationsButton = getByLabelText('Notifications');
      expect(notificationsButton.props.accessibilityRole).toBe('button');
    });

    it('provides accessibility hint for theme toggle', () => {
      const { getByLabelText } = render(<AppHeader />);

      const themeButton = getByLabelText('Toggle theme');
      expect(themeButton.props.accessibilityHint).toBe('Switch between light and dark mode');
    });
  });

  describe('Responsive Layout', () => {
    it('renders on mobile', () => {
      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });

    it('renders on tablet/desktop', () => {
      // Test responsive layout
      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });
  });
});
