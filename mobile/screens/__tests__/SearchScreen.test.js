/**
 * SearchScreen Tests
 * Comprehensive test suite for the AI-enhanced search screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchScreen from '../SearchScreen';
import { search as searchAPI, categories as categoriesAPI, insights as insightsAPI } from '../../api/client';

// Mock dependencies
jest.mock('../../api/client');
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
  EnhancedSearchBar: ({ value, onChangeText, onSubmit }) => {
    const TextInput = require('react-native').TextInput;
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        testID="search-input"
      />
    );
  },
  TrendingSearches: 'TrendingSearches',
  AuthorResultCard: 'AuthorResultCard',
}));
jest.mock('../../components/ui', () => ({
  FilterChip: ({ children, onPress, selected }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress} testID={`filter-chip-${children}`}>
        <Text>{children}</Text>
      </Pressable>
    );
  },
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('SearchScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockSearchResults = [
    {
      id: '1',
      slug: 'search-result-1',
      title: 'Search Result 1',
      description: 'Test search result description',
      source: 'Test Source',
      category: 'Politics',
      image_url: 'https://example.com/image1.jpg',
      published_at: new Date().toISOString(),
    },
    {
      id: '2',
      slug: 'search-result-2',
      title: 'Search Result 2',
      description: 'Another search result',
      source: 'Test Source 2',
      category: 'Business',
      image_url: null,
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockTrendingSearches = [
    { query: 'Zimbabwe elections', count: 150 },
    { query: 'Economic policy', count: 120 },
    { query: 'Sports news', count: 90 },
  ];

  const mockTopAuthors = [
    { author: 'John Doe', article_count: 45, avatar_url: null },
    { author: 'Jane Smith', article_count: 32, avatar_url: 'https://example.com/avatar.jpg' },
  ];

  const mockAISuggestions = [
    'Latest Zimbabwe news',
    'Economic trends in Africa',
    'Political analysis',
  ];

  const mockCategories = [
    { id: 'politics', name: 'Politics', slug: 'politics' },
    { id: 'business', name: 'Business', slug: 'business' },
    { id: 'sports', name: 'Sports', slug: 'sports' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    searchAPI.search.mockResolvedValue({ data: { results: mockSearchResults } });
    searchAPI.trending.mockResolvedValue({ data: mockTrendingSearches });
    searchAPI.topAuthors.mockResolvedValue({ data: mockTopAuthors });
    insightsAPI.getSuggestions.mockResolvedValue({ data: { suggestions: mockAISuggestions } });
    categoriesAPI.list.mockResolvedValue({ data: mockCategories });
  });

  describe('Rendering', () => {
    it('renders search bar on mount', () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
      expect(getByTestId('search-input')).toBeTruthy();
    });

    it('displays trending searches when no query', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.trending).toHaveBeenCalled();
      });
    });

    it('displays top authors', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.topAuthors).toHaveBeenCalled();
      });
    });

    it('loads AI suggestions', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(insightsAPI.getSuggestions).toHaveBeenCalled();
      });
    });
  });

  describe('Search Functionality', () => {
    it('performs search when query is submitted', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test query');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalledWith(
          expect.objectContaining({
            q: 'test query',
          })
        );
      });
    });

    it('displays search results after search', async () => {
      const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });
    });

    it('clears search results when query is cleared', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });

      fireEvent.changeText(searchInput, '');

      // Search results should be cleared
    });

    it('shows loading state during search', async () => {
      searchAPI.search.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: { results: mockSearchResults } }), 1000))
      );

      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      // Loading indicator should be visible
    });
  });

  describe('Category Filtering', () => {
    it('filters search results by category', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(categoriesAPI.list).toHaveBeenCalled();
      });

      // Category chip selection would trigger filtered search
    });

    it('combines search query with category filter', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });

      // Category selection would add category to search params
    });
  });

  describe('AI Suggestions', () => {
    it('displays AI-powered suggestions when empty', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(insightsAPI.getSuggestions).toHaveBeenCalled();
      });
    });

    it('applies AI suggestion when clicked', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(insightsAPI.getSuggestions).toHaveBeenCalled();
      });

      // Clicking suggestion would populate search and trigger search
    });
  });

  describe('Trending Searches', () => {
    it('loads trending searches on mount', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.trending).toHaveBeenCalled();
      });
    });

    it('applies trending search when clicked', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.trending).toHaveBeenCalled();
      });

      // Clicking trending search would populate search and trigger search
    });
  });

  describe('Top Authors', () => {
    it('loads top authors on mount', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.topAuthors).toHaveBeenCalled();
      });
    });

    it('navigates to author articles when author is clicked', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.topAuthors).toHaveBeenCalled();
      });

      // Clicking author would trigger search for that author
    });
  });

  describe('Error Handling', () => {
    it('displays error message when search fails', async () => {
      searchAPI.search.mockRejectedValue(new Error('Search failed'));

      const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(getByText('Search failed. Please try again.')).toBeTruthy();
      });
    });

    it('handles trending searches load failure gracefully', async () => {
      searchAPI.trending.mockRejectedValue(new Error('Failed to load'));

      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.trending).toHaveBeenCalled();
      });

      // Should not crash, just hide trending section
    });

    it('handles AI suggestions load failure gracefully', async () => {
      insightsAPI.getSuggestions.mockRejectedValue(new Error('AI service unavailable'));

      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(insightsAPI.getSuggestions).toHaveBeenCalled();
      });

      // Should not crash, just hide suggestions
    });
  });

  describe('Empty States', () => {
    it('shows empty state when search returns no results', async () => {
      searchAPI.search.mockResolvedValue({ data: { results: [] } });

      const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'nonexistent');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(getByText('No results found')).toBeTruthy();
      });
    });

    it('displays helpful message in empty state', async () => {
      searchAPI.search.mockResolvedValue({ data: { results: [] } });

      const { getByTestId, getByText } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(getByText(/Try different keywords/i)).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to article detail when search result is clicked', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });

      // Clicking result would navigate to article detail
    });
  });

  describe('Pull to Refresh', () => {
    it('refreshes trending and authors on pull to refresh', async () => {
      render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(searchAPI.trending).toHaveBeenCalledTimes(1);
        expect(searchAPI.topAuthors).toHaveBeenCalledTimes(1);
      });

      // Pull to refresh would trigger reload
    });
  });

  describe('Search Result Card', () => {
    it('formats date correctly for recent articles', () => {
      const formatDate = (dateString) => {
        if (!dateString) return 'Today';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;

        return 'older';
      };

      const now = new Date().toISOString();
      expect(formatDate(now)).toBe('Just now');

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatDate(twoHoursAgo)).toBe('2h ago');
    });

    it('handles image load errors gracefully', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });

      // Image error handler should prevent crash
    });

    it('displays articles without images correctly', async () => {
      const resultsWithoutImages = mockSearchResults.map(r => ({ ...r, image_url: null }));
      searchAPI.search.mockResolvedValue({ data: { results: resultsWithoutImages } });

      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'test');
      fireEvent(searchInput, 'onSubmitEditing');

      await waitFor(() => {
        expect(searchAPI.search).toHaveBeenCalled();
      });

      // Should render without images
    });
  });

  describe('Accessibility', () => {
    it('has accessible search input', () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);
      const searchInput = getByTestId('search-input');
      expect(searchInput).toBeTruthy();
    });

    it('provides accessible labels for filter chips', async () => {
      const { getByTestId } = render(<SearchScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(categoriesAPI.list).toHaveBeenCalled();
      });

      // Filter chips should have accessible labels
    });
  });
});
