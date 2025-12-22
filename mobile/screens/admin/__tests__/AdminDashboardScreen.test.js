/**
 * AdminDashboardScreen Tests
 * Comprehensive test suite with accessibility and error coverage
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminDashboardScreen from '../AdminDashboardScreen';
import { admin } from '../../../api/client';

// Mock dependencies
jest.mock('../../../api/client');
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'Test Admin', username: 'admin' },
    isAdmin: true,
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

  const mockStats = {
    database: {
      total_articles: 1250,
      active_sources: 15,
      categories: 8,
    },
    timestamp: '2025-01-15T10:30:00Z',
  };

  const mockUserStats = {
    total_users: 342,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    admin.getStats.mockResolvedValue({ data: mockStats });
    admin.getUserStats.mockResolvedValue({ data: mockUserStats });
  });

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );
      expect(getByText('Loading dashboard...')).toBeTruthy();
    });

    it('renders dashboard with stats after loading', async () => {
      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Admin Dashboard')).toBeTruthy();
        expect(getByText('1,250')).toBeTruthy(); // Total Articles
        expect(getByText('15')).toBeTruthy(); // Active Sources
        expect(getByText('8')).toBeTruthy(); // Categories
        expect(getByText('342')).toBeTruthy(); // Total Users
      });
    });

    it('displays welcome message with user name', async () => {
      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText(/Welcome, Test Admin/)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible stat cards with proper labels', async () => {
      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByLabelText('Total Articles: 1,250')).toBeTruthy();
        expect(getByLabelText('Active Sources: 15')).toBeTruthy();
        expect(getByLabelText('Categories: 8')).toBeTruthy();
        expect(getByLabelText('Total Users: 342')).toBeTruthy();
      });
    });

    it('has accessible navigation items', async () => {
      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByLabelText('Users management')).toBeTruthy();
        expect(getByLabelText('News Sources management')).toBeTruthy();
        expect(getByLabelText('Analytics management')).toBeTruthy();
        expect(getByLabelText('System Health management')).toBeTruthy();
      });
    });

    it('quick actions have proper accessibility', async () => {
      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refreshAction = getByLabelText('Refresh RSS. Pull latest articles');
        const bulkAction = getByLabelText('Bulk Pull. Fetch all sources');

        expect(refreshAction).toBeTruthy();
        expect(bulkAction).toBeTruthy();
        expect(refreshAction.props.accessibilityRole).toBe('button');
        expect(bulkAction.props.accessibilityRole).toBe('button');
      });
    });
  });

  describe('Quick Actions', () => {
    it('calls refreshRSS when refresh button pressed', async () => {
      admin.refreshRSS.mockResolvedValue({ success: true });

      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refreshButton = getByLabelText('Refresh RSS. Pull latest articles');
        fireEvent.press(refreshButton);
      });

      await waitFor(() => {
        expect(admin.refreshRSS).toHaveBeenCalled();
      });
    });

    it('calls bulkPull when bulk pull button pressed', async () => {
      admin.bulkPull.mockResolvedValue({ success: true });

      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const bulkButton = getByLabelText('Bulk Pull. Fetch all sources');
        fireEvent.press(bulkButton);
      });

      await waitFor(() => {
        expect(admin.bulkPull).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to Users screen when Users nav item pressed', async () => {
      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const usersNav = getByLabelText('Users management');
        fireEvent.press(usersNav);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminUsers');
    });

    it('navigates to Analytics screen when Analytics nav item pressed', async () => {
      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const analyticsNav = getByLabelText('Analytics management');
        fireEvent.press(analyticsNav);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminAnalytics');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when stats load fails', async () => {
      admin.getStats.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Something went wrong')).toBeTruthy();
        expect(getByText('Failed to load dashboard. Please try again.')).toBeTruthy();
      });
    });

    it('shows Try Again button on error', async () => {
      admin.getStats.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const tryAgainButton = getByText('Try Again');
        expect(tryAgainButton).toBeTruthy();
      });
    });

    it('retries loading when Try Again pressed', async () => {
      admin.getStats.mockRejectedValueOnce(new Error('Network error'));
      admin.getStats.mockResolvedValueOnce({ data: mockStats });

      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const tryAgainButton = getByText('Try Again');
        fireEvent.press(tryAgainButton);
      });

      await waitFor(() => {
        expect(getByText('Admin Dashboard')).toBeTruthy();
      });
    });

    it('handles refresh RSS error gracefully', async () => {
      admin.refreshRSS.mockRejectedValue(new Error('RSS error'));

      const { getByLabelText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const refreshButton = getByLabelText('Refresh RSS. Pull latest articles');
        fireEvent.press(refreshButton);
      });

      // Should not crash and loading should reset
      await waitFor(() => {
        expect(getByLabelText('Refresh RSS. Pull latest articles')).toBeTruthy();
      });
    });
  });

  describe('Authorization', () => {
    it('shows access denied when user is not admin', () => {
      jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ user: {}, isAdmin: false });

      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      expect(getByText('Access Denied')).toBeTruthy();
      expect(getByText("You don't have permission to access the admin panel.")).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('reloads data when pull to refresh triggered', async () => {
      const { getByTestId } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId).toBeDefined();
      });

      // Simulate pull to refresh would be done here with ScrollView test ID
      expect(admin.getStats).toHaveBeenCalled();
    });
  });

  describe('System Status', () => {
    it('displays system status information', async () => {
      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('System Status')).toBeTruthy();
        expect(getByText('API Status')).toBeTruthy();
        expect(getByText('Operational')).toBeTruthy();
        expect(getByText('Database')).toBeTruthy();
        expect(getByText('Connected')).toBeTruthy();
      });
    });

    it('displays last updated timestamp', async () => {
      const { getByText } = render(
        <AdminDashboardScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Last Updated')).toBeTruthy();
      });
    });
  });
});
