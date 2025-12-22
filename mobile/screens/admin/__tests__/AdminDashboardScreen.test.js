/**
 * AdminDashboardScreen Tests
 * Basic test coverage for admin dashboard
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AdminDashboardScreen from '../AdminDashboardScreen';

// Mock dependencies
jest.mock('../../../api/client', () => ({
  admin: {
    getStats: jest.fn().mockResolvedValue({ data: null }),
    getUserStats: jest.fn().mockResolvedValue({ data: null }),
  },
}));

// Mock auth context - admin by default
let mockIsAdmin = true;
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'Test Admin', username: 'admin' },
    isAdmin: mockIsAdmin,
  }),
}));

jest.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#FAF9F5',
      surface: '#FFFFFF',
      tanzanite: '#4B0082',
      'on-surface': '#1C1B1F',
      'on-surface-variant': '#4a4a4a',
      'on-primary': '#FFFFFF',
      outline: '#e0dfdc',
      success: '#1B5E20',
      warning: '#E65100',
      error: '#B3261E',
    },
  }),
}));

jest.mock('../../../components/AdminHeader', () => 'AdminHeader');
jest.mock('../../../components/AdminScreenWrapper', () => ({ children }) => children);

describe('AdminDashboardScreen', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAdmin = true;
  });

  describe('Authorization', () => {
    it('shows access denied for non-admin users', () => {
      mockIsAdmin = false;

      const { getByText } = render(<AdminDashboardScreen navigation={mockNavigation} />);

      expect(getByText('Access Denied')).toBeTruthy();
    });

    it('does not show access denied for admin users', () => {
      mockIsAdmin = true;

      const { queryByText } = render(<AdminDashboardScreen navigation={mockNavigation} />);

      expect(queryByText('Access Denied')).toBeNull();
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { root } = render(<AdminDashboardScreen navigation={mockNavigation} />);
      expect(root).toBeTruthy();
    });
  });
});
