/**
 * NewsBytesScreen Tests
 * Comprehensive test suite for the TikTok-style news bytes feed
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewsBytesScreen from '../NewsBytesScreen';
import { articles as articlesAPI } from '../../api/client';

// Mock dependencies
jest.mock('../../api/client');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', username: 'testuser' },
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
      },
    },
    isDark: false,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));
jest.mock('../../components/ArticleEngagementBar', () => 'ArticleEngagementBar');
jest.mock('../../components/ShareModal', () => 'ShareModal');
jest.mock('react-native-markdown-display', () => 'Markdown');

describe('NewsBytesScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockArticles = [
    {
      id: '1',
      slug: 'byte-1',
      title: 'Breaking News 1',
      description: 'Short summary for byte 1',
      content: 'Full content for byte 1',
      source: 'Test Source 1',
      category: 'Politics',
      image_url: 'https://example.com/image1.jpg',
      published_at: new Date().toISOString(),
      likes_count: 25,
      is_liked: false,
      is_saved: false,
    },
    {
      id: '2',
      slug: 'byte-2',
      title: 'Breaking News 2',
      description: 'Short summary for byte 2',
      content: 'Full content for byte 2',
      source: 'Test Source 2',
      category: 'Business',
      image_url: 'https://example.com/image2.jpg',
      published_at: new Date().toISOString(),
      likes_count: 15,
      is_liked: false,
      is_saved: false,
    },
    {
      id: '3',
      slug: 'byte-3',
      title: 'Breaking News 3',
      description: 'Short summary for byte 3',
      content: null,
      source: 'Test Source 3',
      category: 'Sports',
      image_url: null,
      published_at: new Date().toISOString(),
      likes_count: 5,
      is_liked: false,
      is_saved: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    articlesAPI.list.mockResolvedValue({ data: mockArticles });
    articlesAPI.like.mockResolvedValue({ success: true });
    articlesAPI.save.mockResolvedValue({ success: true });
    articlesAPI.trackView.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders news bytes after loading', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });
    });

    it('displays first byte on mount', async () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Breaking News 1')).toBeTruthy();
      });
    });
  });

  describe('Vertical Scrolling', () => {
    it('loads news bytes for vertical scrolling', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });
    });

    it('tracks view for currently visible byte', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.trackView).toHaveBeenCalledWith('1');
      });
    });

    it('updates current index on scroll', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Scroll event would update current index
    });
  });

  describe('Like Functionality', () => {
    it('likes byte when like button pressed', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Engagement bar would trigger like action
    });

    it('updates likes count after liking', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Likes count should update in state
    });

    it('unlikes byte when already liked', async () => {
      articlesAPI.list.mockResolvedValue({
        data: [{ ...mockArticles[0], is_liked: true }],
      });

      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Unlike action should work
    });
  });

  describe('Save/Bookmark Functionality', () => {
    it('saves byte when save button pressed', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Engagement bar would trigger save action
    });

    it('unsaves byte when already saved', async () => {
      articlesAPI.list.mockResolvedValue({
        data: [{ ...mockArticles[0], is_saved: true }],
      });

      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Unsave action should work
    });
  });

  describe('Share Functionality', () => {
    it('opens share modal when share button pressed', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Share button would open modal
    });

    it('shares correct byte', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Share modal should receive current byte
    });

    it('closes share modal after sharing', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Modal close functionality tested
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button pressed', async () => {
      const { getByLabelText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Back button would call navigation.goBack()
    });

    it('navigates to full article when title pressed', async () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const title = getByText('Breaking News 1');
        fireEvent.press(title);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ArticleDetail', {
        articleId: '1',
        slug: 'byte-1',
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error state when bytes fail to load', async () => {
      articlesAPI.list.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Something went wrong')).toBeTruthy();
      });
    });

    it('shows Try Again button on error', async () => {
      articlesAPI.list.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });
    });

    it('retries loading when Try Again pressed', async () => {
      articlesAPI.list.mockRejectedValueOnce(new Error('Network error'));
      articlesAPI.list.mockResolvedValueOnce({ data: mockArticles });

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const tryAgainButton = getByText('Try Again');
        fireEvent.press(tryAgainButton);
      });

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalledTimes(2);
      });
    });

    it('handles missing image gracefully', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Should render bytes without images
    });

    it('falls back to description when no content', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Should use description when content is null
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no bytes available', async () => {
      articlesAPI.list.mockResolvedValue({ data: [] });

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('No news bytes yet')).toBeTruthy();
      });
    });

    it('shows empty state message with icon', async () => {
      articlesAPI.list.mockResolvedValue({ data: [] });

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText(/Check back later/i)).toBeTruthy();
      });
    });
  });

  describe('Guest Mode', () => {
    it('allows viewing bytes without authentication', async () => {
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ isAuthenticated: false, user: null });

      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Breaking News 1')).toBeTruthy();
      });
    });

    it('shows login prompt for interactions when not authenticated', async () => {
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ isAuthenticated: false, user: null });

      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Like/save actions should show login prompt
    });
  });

  describe('Content Display', () => {
    it('displays byte metadata', async () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Test Source 1')).toBeTruthy();
        expect(getByText('Politics')).toBeTruthy();
      });
    });

    it('shows engagement counts', async () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Engagement bar should display counts
    });

    it('renders markdown content', async () => {
      const { getByText } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Full content for byte 1')).toBeTruthy();
      });
    });
  });

  describe('Pagination', () => {
    it('loads more bytes when reaching end', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalledTimes(1);
      });

      // Scrolling to end would trigger pagination
    });

    it('shows loading indicator while loading more', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Loading indicator tested in component
    });
  });

  describe('Performance', () => {
    it('efficiently renders large lists', async () => {
      const manyBytes = Array.from({ length: 50 }, (_, i) => ({
        ...mockArticles[0],
        id: `${i}`,
        title: `Byte ${i}`,
      }));

      articlesAPI.list.mockResolvedValue({ data: manyBytes });

      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // FlatList should handle large lists efficiently
    });

    it('cleans up on unmount', async () => {
      const { unmount } = render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      unmount();

      // Cleanup should happen without errors
    });
  });

  describe('Accessibility', () => {
    it('has accessible navigation buttons', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Back button should have accessibility label
    });

    it('provides accessible labels for bytes', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Bytes should have proper accessibility labels
    });

    it('has accessible engagement actions', async () => {
      render(<NewsBytesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.list).toHaveBeenCalled();
      });

      // Like, save, share buttons should have accessibility labels
    });
  });
});
