/**
 * AppHeader Tests
 * Basic test coverage for the main app header component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AppHeader from '../AppHeader';

// Mock dependencies
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FAF9F5',
        'on-surface': '#1C1B1F',
      },
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser' },
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
    it('renders without crashing', () => {
      const { root } = render(<AppHeader />);
      expect(root).toBeTruthy();
    });

    it('displays screen title', () => {
      const { getByText } = render(<AppHeader />);
      expect(getByText('Bytes')).toBeTruthy();
    });
  });

  describe('Screen Titles', () => {
    it('shows "Bytes" title for Bytes screen', () => {
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
  });

  describe('Navigation Listener', () => {
    it('subscribes to navigation state changes', () => {
      const { navigationRef } = require('../../navigation/navigationRef');

      render(<AppHeader />);

      expect(navigationRef.addListener).toHaveBeenCalledWith('state', expect.any(Function));
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
});
