/**
 * AdminSystemScreen Tests
 * Basic test coverage for admin system screen
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AdminSystemScreen from '../AdminSystemScreen';

// Mock dependencies
jest.mock('../../../api/client', () => ({
  admin: {
    getSystemHealth: jest.fn().mockResolvedValue({ data: null }),
    getCronLogs: jest.fn().mockResolvedValue({ data: { logs: [] } }),
    getAIPipelineStatus: jest.fn().mockResolvedValue({ data: null }),
    refreshRSS: jest.fn().mockResolvedValue({ success: true }),
    bulkPull: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock auth context - admin by default
let mockIsAdmin = true;
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
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
      'outline-variant': '#f0efec',
      success: '#1B5E20',
      warning: '#E65100',
      error: '#B3261E',
    },
  }),
}));

jest.mock('../../../components/AdminHeader', () => 'AdminHeader');
jest.mock('../../../components/AdminScreenWrapper', () => ({ children }) => children);

describe('AdminSystemScreen', () => {
  const mockNavigation = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAdmin = true;
  });

  describe('Authorization', () => {
    it('shows access denied for non-admin users', () => {
      mockIsAdmin = false;

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      expect(getByText('Access Denied')).toBeTruthy();
    });

    it('does not show access denied for admin users', () => {
      mockIsAdmin = true;

      const { queryByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      expect(queryByText('Access Denied')).toBeNull();
    });
  });

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      const { root } = render(<AdminSystemScreen navigation={mockNavigation} />);
      expect(root).toBeTruthy();
    });
  });
});
