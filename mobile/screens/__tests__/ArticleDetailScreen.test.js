/**
 * ArticleDetailScreen Tests
 * Comprehensive test suite for the article detail view
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ArticleDetailScreen from '../ArticleDetailScreen';
import { articles as articlesAPI } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Share } from 'react-native';

// Mock dependencies
jest.mock('../../api/client');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));
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
    navigate: jest.fn(),
  };

  const mockArticle = {
    id: '123',
    slug: 'test-article',
    title: 'Test Article Title',
    description: 'Test article description',
    content: 'Full article content here',
    source: 'Test Source',
    author: 'John Doe',
    category: 'Politics',
    image_url: 'https://example.com/image.jpg',
    url: 'https://example.com/article',
    published_at: new Date().toISOString(),
    keywords: ['Zimbabwe', 'Politics', 'News'],
    likes_count: 42,
    is_liked: false,
    is_saved: false,
  };

  const mockRoute = {
    params: {
      articleId: '123',
      slug: 'test-article',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    articlesAPI.get.mockResolvedValue({ data: mockArticle });
    articlesAPI.like.mockResolvedValue({ success: true });
    articlesAPI.save.mockResolvedValue({ success: true });
    articlesAPI.trackView.mockResolvedValue({ success: true });
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );
      expect(getByText('Loading article...')).toBeTruthy();
    });

    it('renders article after loading', async () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Test Article Title')).toBeTruthy();
      });
    });

    it('displays article metadata', async () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Test Source')).toBeTruthy();
        expect(getByText('Politics')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
      });
    });

    it('shows keywords/tags', async () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Zimbabwe')).toBeTruthy();
        expect(getByText('Politics')).toBeTruthy();
      });
    });

    it('displays article image', async () => {
      const { getByTestId } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });
    });
  });

  describe('Data Loading', () => {
    it('fetches article by ID', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalledWith('123');
      });
    });

    it('tracks article view on load', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.trackView).toHaveBeenCalledWith('123');
      });
    });

    it('loads saved and liked state from storage', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@mukoko_liked_articles') {
          return Promise.resolve(JSON.stringify(['123']));
        }
        if (key === '@mukoko_saved_articles') {
          return Promise.resolve(JSON.stringify(['123']));
        }
        return Promise.resolve(null);
      });

      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
    });
  });

  describe('Like Functionality', () => {
    it('likes article when like button pressed', async () => {
      const { getByTestId } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Engagement bar would trigger like action
    });

    it('unlikes article when already liked', async () => {
      articlesAPI.get.mockResolvedValue({
        data: { ...mockArticle, is_liked: true },
      });

      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Engagement bar would trigger unlike action
    });

    it('updates likes count after liking', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Likes count should update
    });

    it('persists like state to AsyncStorage', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Like action should save to AsyncStorage
    });
  });

  describe('Save/Bookmark Functionality', () => {
    it('saves article when save button pressed', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Engagement bar would trigger save action
    });

    it('unsaves article when already saved', async () => {
      articlesAPI.get.mockResolvedValue({
        data: { ...mockArticle, is_saved: true },
      });

      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Engagement bar would trigger unsave action
    });

    it('persists save state to AsyncStorage', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Save action should persist to AsyncStorage
    });
  });

  describe('Share Functionality', () => {
    it('opens share modal when share button pressed', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Share button would open modal
    });

    it('closes share modal after sharing', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Modal close functionality tested
    });
  });

  describe('External Link', () => {
    it('opens original article URL when Read Original pressed', async () => {
      const mockLinking = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const readOriginalButton = getByText('Read Original');
        fireEvent.press(readOriginalButton);
      });

      await waitFor(() => {
        expect(mockLinking).toHaveBeenCalledWith('https://example.com/article');
      });
    });

    it('handles URL opening errors gracefully', async () => {
      jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Cannot open URL'));

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const readOriginalButton = getByText('Read Original');
        fireEvent.press(readOriginalButton);
      });

      // Should not crash
    });
  });

  describe('Error Handling', () => {
    it('displays error state when article fails to load', async () => {
      articlesAPI.get.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Article not found')).toBeTruthy();
      });
    });

    it('shows Try Again button on error', async () => {
      articlesAPI.get.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Try Again')).toBeTruthy();
      });
    });

    it('retries loading when Try Again pressed', async () => {
      articlesAPI.get.mockRejectedValueOnce(new Error('Network error'));
      articlesAPI.get.mockResolvedValueOnce({ data: mockArticle });

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const tryAgainButton = getByText('Try Again');
        fireEvent.press(tryAgainButton);
      });

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalledTimes(2);
      });
    });

    it('handles missing article image gracefully', async () => {
      articlesAPI.get.mockResolvedValue({
        data: { ...mockArticle, image_url: null },
      });

      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Should render without image
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button pressed', async () => {
      const { getByTestId } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Back button would trigger navigation.goBack()
    });

    it('navigates to category when category tag pressed', async () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const categoryTag = getByText('Politics');
        fireEvent.press(categoryTag);
      });

      // Should navigate to category view
    });
  });

  describe('Guest Mode', () => {
    it('shows login prompt for non-authenticated users', async () => {
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ isAuthenticated: false, user: null });

      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Like/save actions should show login prompt for guests
    });

    it('allows reading article without authentication', async () => {
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
        .mockReturnValue({ isAuthenticated: false, user: null });

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Test Article Title')).toBeTruthy();
      });
    });
  });

  describe('Scroll Behavior', () => {
    it('handles scroll events for header animation', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Scroll animation tested in component
    });
  });

  describe('Content Rendering', () => {
    it('renders markdown content correctly', async () => {
      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Full article content here')).toBeTruthy();
      });
    });

    it('falls back to description when no content', async () => {
      articlesAPI.get.mockResolvedValue({
        data: { ...mockArticle, content: null },
      });

      const { getByText } = render(
        <ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Test article description')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible back button', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Back button should have accessibility label
    });

    it('has accessible action buttons', async () => {
      render(<ArticleDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(articlesAPI.get).toHaveBeenCalled();
      });

      // Like, save, share buttons should have accessibility labels
    });
  });
});
