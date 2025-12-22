/**
 * SearchScreen Tests
 * Basic test coverage for the search screen
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import SearchScreen from '../SearchScreen';

// Mock dependencies
jest.mock('../../api/client', () => ({
  search: {
    query: jest.fn().mockResolvedValue({ data: { results: [] } }),
  },
  categories: {
    getAll: jest.fn().mockResolvedValue({ data: [] }),
  },
  insights: {
    getTrendingCategories: jest.fn().mockResolvedValue({ data: [] }),
    getTrendingAuthors: jest.fn().mockResolvedValue({ data: [] }),
  },
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
      },
    },
    isDark: false,
  }),
}));
jest.mock('../../components/layout', () => ({
  useLayout: () => ({ isMobile: true }),
}));
jest.mock('../../components/CategoryChips', () => 'CategoryChips');
jest.mock('../../components/ai', () => ({
  CuratedLabel: 'CuratedLabel',
  AISparkleIcon: 'AISparkleIcon',
  AIShimmerEffect: 'AIShimmerEffect',
}));
jest.mock('../../components/search', () => ({
  EnhancedSearchBar: 'EnhancedSearchBar',
}));

describe('SearchScreen', () => {
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
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      );
      expect(root).toBeTruthy();
    });
  });
});
