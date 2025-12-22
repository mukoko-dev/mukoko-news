/**
 * HomeScreen Tests
 * Basic test coverage for the main news feed screen
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

// Mock dependencies
jest.mock('../../api/client', () => ({
  articles: {
    getFeed: jest.fn().mockResolvedValue({ data: { articles: [] } }),
    getPersonalizedFeed: jest.fn().mockResolvedValue({ data: { articles: [] } }),
    collectFeed: jest.fn().mockResolvedValue({ data: { newArticles: 0 } }),
  },
  categories: {
    getAll: jest.fn().mockResolvedValue({ data: [] }),
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
        outline: '#e0dfdc',
        success: '#1B5E20',
        error: '#B3261E',
        tanzanite: '#4B0082',
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
jest.mock('../../components/layout', () => ({
  useLayout: () => ({ isMobile: true }),
  LeftSidebar: 'LeftSidebar',
  RightSidebar: 'RightSidebar',
  MainContent: 'MainContent',
  ResponsiveLayout: ({ children }) => children,
}));
jest.mock('../../components/Logo', () => 'Logo');
jest.mock('../../services/LocalPreferencesService', () => ({
  __esModule: true,
  default: {
    init: jest.fn().mockResolvedValue(undefined),
    getSelectedCountries: jest.fn().mockResolvedValue([]),
    getSelectedCategories: jest.fn().mockResolvedValue([]),
  },
  PREF_KEYS: {},
}));
jest.mock('../../components/CategoryChips', () => 'CategoryChips');
jest.mock('../../components/ArticleCard', () => 'ArticleCard');
jest.mock('../../components/LoginPromo', () => 'LoginPromo');
jest.mock('../../components/ui', () => ({
  ErrorState: 'ErrorState',
  EmptyState: 'EmptyState',
  Button: 'Button',
}));
jest.mock('../../services/CacheService', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };
  const mockRoute = { params: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { root } = render(
        <HomeScreen navigation={mockNavigation} route={mockRoute} />
      );
      expect(root).toBeTruthy();
    });
  });
});
