/**
 * NewsBytesScreen Tests
 * Basic test coverage for the TikTok-style news bytes feed
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import NewsBytesScreen from '../NewsBytesScreen';

// Mock dependencies
jest.mock('../../api/client', () => ({
  newsBytes: {
    getFeed: jest.fn().mockResolvedValue({ data: [] }),
  },
  articles: {
    getFeed: jest.fn().mockResolvedValue({ data: { articles: [] } }),
    collectFeed: jest.fn().mockResolvedValue({ data: { newArticles: 0 } }),
    toggleLike: jest.fn().mockResolvedValue({}),
    toggleBookmark: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FAF9F5',
        surface: '#FFFFFF',
        primary: '#4B0082',
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
        'on-primary': '#FFFFFF',
        outline: '#e0dfdc',
        tanzanite: '#4B0082',
        cobalt: '#0047AB',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
    isDark: false,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }) => children,
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('../../components/ArticleEngagementBar', () => 'ArticleEngagementBar');
jest.mock('../../components/ShareModal', () => 'ShareModal');
jest.mock('../../components/SourceIcon', () => 'SourceIcon');
jest.mock('react-native-markdown-display', () => 'Markdown');
jest.mock('../../components/Logo', () => 'Logo');
jest.mock('../../components/layout', () => ({
  useLayout: () => ({ isMobile: true }),
  LeftSidebar: 'LeftSidebar',
  RightSidebar: 'RightSidebar',
  MainContent: 'MainContent',
  ResponsiveLayout: ({ children }) => children,
  CONTENT_WIDTHS: { narrow: 600, medium: 800, wide: 1200 },
}));
jest.mock('../../theme', () => ({
  colors: { tanzanite: '#4B0082', cobalt: '#0047AB' },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  fonts: { bold: { fontFamily: 'System' }, medium: { fontFamily: 'System' } },
}));

describe('NewsBytesScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { root } = render(
        <NewsBytesScreen navigation={mockNavigation} />
      );
      expect(root).toBeTruthy();
    });
  });
});
