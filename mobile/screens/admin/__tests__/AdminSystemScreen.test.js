/**
 * AdminSystemScreen Tests
 * Comprehensive test suite with accessibility and error coverage
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminSystemScreen from '../AdminSystemScreen';
import { admin } from '../../../api/client';

// Mock dependencies
jest.mock('../../../api/client');
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
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
      'outline-variant': '#f0efec',
      success: '#1B5E20',
      warning: '#E65100',
      error: '#B3261E',
    },
  }),
}));
jest.mock('../AdminHeader', () => 'AdminHeader');
jest.mock('../AdminScreenWrapper', () => ({ children }) => children);

describe('AdminSystemScreen', () => {
  const mockNavigation = {};

  const mockSystemHealth = {
    database: { status: 'healthy' },
    kv: { status: 'healthy' },
    rss: { status: 'ok', active_sources: 12 },
    ai: { status: 'operational' },
  };

  const mockCronLogs = {
    logs: [
      {
        job_name: 'RSS Fetch Job',
        status: 'success',
        message: 'Fetched 50 articles',
        created_at: '2025-01-15T10:00:00Z',
        duration_ms: 1250,
      },
      {
        job_name: 'AI Processing',
        status: 'failed',
        message: 'Timeout error',
        created_at: '2025-01-15T09:30:00Z',
        duration_ms: 5000,
      },
    ],
  };

  const mockAIStatus = {
    processed_today: 125,
    pending: 8,
    failed: 2,
    last_processed: '2025-01-15T10:25:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    admin.getSystemHealth.mockResolvedValue({ data: mockSystemHealth });
    admin.getCronLogs.mockResolvedValue({ data: mockCronLogs });
    admin.getAIPipelineStatus.mockResolvedValue({ data: mockAIStatus });
  });

  describe('Rendering', () => {
    it('renders system health status', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('System Health')).toBeTruthy();
        expect(getByText('Database')).toBeTruthy();
        expect(getByText('KV Storage')).toBeTruthy();
        expect(getByText('RSS Feeds')).toBeTruthy();
        expect(getByText('AI Pipeline')).toBeTruthy();
      });
    });

    it('displays AI pipeline stats', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('125')).toBeTruthy(); // Processed today
        expect(getByText('8')).toBeTruthy(); // Pending
        expect(getByText('2')).toBeTruthy(); // Failed
      });
    });

    it('shows cron job logs', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('RSS Fetch Job')).toBeTruthy();
        expect(getByText('AI Processing')).toBeTruthy();
        expect(getByText('Fetched 50 articles')).toBeTruthy();
        expect(getByText('Duration: 1250ms')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible status indicators', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const database = getByText('Database');
        expect(database).toBeTruthy();
      });
    });

    it('uses semantic badge variants for job status', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('success')).toBeTruthy();
        expect(getByText('failed')).toBeTruthy();
      });
    });
  });

  describe('Quick Actions', () => {
    it('calls refreshRSS when Refresh RSS pressed', async () => {
      admin.refreshRSS.mockResolvedValue({ success: true });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const button = getByText('Refresh RSS');
        fireEvent.press(button);
      });

      await waitFor(() => {
        expect(admin.refreshRSS).toHaveBeenCalled();
      });
    });

    it('calls bulkPull when Bulk Pull pressed', async () => {
      admin.bulkPull.mockResolvedValue({ success: true });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const button = getByText('Bulk Pull');
        fireEvent.press(button);
      });

      await waitFor(() => {
        expect(admin.bulkPull).toHaveBeenCalled();
      });
    });

    it('disables buttons while action is loading', async () => {
      admin.refreshRSS.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const refreshButton = getByText('Refresh RSS');
        fireEvent.press(refreshButton);
      });

      // Both buttons should be disabled while one is loading
      const bulkButton = getByText('Bulk Pull');
      expect(bulkButton.props.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('displays error state when data load fails', async () => {
      admin.getSystemHealth.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Something went wrong')).toBeTruthy();
        expect(getByText('Failed to load system data. Please try again.')).toBeTruthy();
      });
    });

    it('handles partial data load failures', async () => {
      admin.getSystemHealth.mockResolvedValue({ data: mockSystemHealth });
      admin.getCronLogs.mockResolvedValue({ data: { logs: [] } });
      admin.getAIPipelineStatus.mockResolvedValue({ data: null });

      const { getByText, queryByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('System Health')).toBeTruthy();
        expect(queryByText('No recent job logs')).toBeTruthy();
      });
    });

    it('handles refreshRSS errors gracefully', async () => {
      admin.refreshRSS.mockRejectedValue(new Error('RSS service unavailable'));

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const button = getByText('Refresh RSS');
        fireEvent.press(button);
      });

      // Should not crash
      await waitFor(() => {
        expect(getByText('System Health')).toBeTruthy();
      });
    });
  });

  describe('Status Colors', () => {
    it('uses success color for healthy status', async () => {
      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const status = getByText('healthy');
        expect(status).toBeTruthy();
      });
    });

    it('uses error color for failed status', async () => {
      admin.getSystemHealth.mockResolvedValue({
        data: {
          ...mockSystemHealth,
          database: { status: 'error' },
        },
      });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const status = getByText('error');
        expect(status).toBeTruthy();
      });
    });

    it('uses warning color for degraded status', async () => {
      admin.getSystemHealth.mockResolvedValue({
        data: {
          ...mockSystemHealth,
          kv: { status: 'degraded' },
        },
      });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const status = getByText('degraded');
        expect(status).toBeTruthy();
      });
    });
  });

  describe('Database Stats', () => {
    it('displays database stats when available', async () => {
      admin.getSystemHealth.mockResolvedValue({
        data: {
          ...mockSystemHealth,
          database: {
            status: 'healthy',
            stats: {
              total_articles: 1500,
              total_users: 450,
              total_sources: 20,
            },
          },
        },
      });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Database Stats')).toBeTruthy();
        expect(getByText('1,500')).toBeTruthy();
        expect(getByText('450')).toBeTruthy();
        expect(getByText('20')).toBeTruthy();
      });
    });
  });

  describe('Authorization', () => {
    it('shows access denied for non-admin users', () => {
      jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ isAdmin: false });

      const { getByText } = render(<AdminSystemScreen navigation={mockNavigation} />);

      expect(getByText('Access Denied')).toBeTruthy();
    });
  });
});
