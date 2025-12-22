/**
 * ArticleDetailScreen Tests
 * Basic test coverage for the article detail view
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ArticleDetailScreen from '../ArticleDetailScreen';

// Mock dependencies
jest.mock('../../api/client', () => ({
  articles: {
    getById: jest.fn().mockResolvedValue({
      data: {
        id: '1',
        title: 'Test Article',
        content: 'Test content',
        author: 'Test Author',
        publishedDate: '2025-01-15',
      },
    }),
    trackView: jest.fn().mockResolvedValue({}),
    toggleLike: jest.fn().mockResolvedValue({}),
    toggleBookmark: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
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
        'surface-variant': '#f5f4f1',
      },
    },
    isDark: false,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../../components/ShareModal', () => 'ShareModal');
jest.mock('../../components/ArticleEngagementBar', () => 'ArticleEngagementBar');
jest.mock('react-native-markdown-display', () => 'Markdown');

describe('ArticleDetailScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };
  const mockRoute = {
    params: { articleId: '1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { root } = render(
        <ArticleDetailScreen navigation={mockNavigation} route={mockRoute} />
      );
      expect(root).toBeTruthy();
    });
  });
});
