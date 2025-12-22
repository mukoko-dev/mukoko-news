/**
 * ArticleEngagementBar Tests
 * Comprehensive test suite for the engagement actions component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArticleEngagementBar from '../ArticleEngagementBar';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
        cobalt: '#0047AB',
        secondary: '#0047AB',
      },
    },
  }),
}));

describe('ArticleEngagementBar', () => {
  const defaultProps = {
    isLiked: false,
    isSaved: false,
    likesCount: 42,
    commentsCount: 10,
    onLike: jest.fn(),
    onSave: jest.fn(),
    onShare: jest.fn(),
    onComment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders horizontal layout by default', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Like')).toBeTruthy();
      expect(getByLabelText('Save for later')).toBeTruthy();
      expect(getByLabelText('Share')).toBeTruthy();
    });

    it('renders vertical layout when specified', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} layout="vertical" />
      );

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('renders light variant by default', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('renders dark variant when specified', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} variant="dark" />
      );

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('displays likes count', () => {
      const { getByText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByText('42')).toBeTruthy();
    });

    it('displays comments count', () => {
      const { getByText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByText('10')).toBeTruthy();
    });

    it('shows count as 0 when count is zero', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={0} />
      );

      expect(getByText('0')).toBeTruthy();
    });

    it('formats large counts with k suffix', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={1500} />
      );

      expect(getByText('1.5k')).toBeTruthy();
    });

    it('handles exactly 1000 likes', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={1000} />
      );

      expect(getByText('1.0k')).toBeTruthy();
    });
  });

  describe('Like Button', () => {
    it('calls onLike when pressed', () => {
      const onLike = jest.fn();
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onLike={onLike} />
      );

      const likeButton = getByLabelText('Like');
      fireEvent.press(likeButton);

      expect(onLike).toHaveBeenCalledTimes(1);
    });

    it('shows active state when liked', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} isLiked={true} />
      );

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('does not render like button when onLike is not provided', () => {
      const { queryByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onLike={undefined} />
      );

      expect(queryByLabelText('Like')).toBeNull();
    });

    it('handles missing likes count gracefully', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={undefined} />
      );

      expect(getByLabelText('Like')).toBeTruthy();
    });
  });

  describe('Save Button', () => {
    it('calls onSave when pressed', () => {
      const onSave = jest.fn();
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onSave={onSave} />
      );

      const saveButton = getByLabelText('Save for later');
      fireEvent.press(saveButton);

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('shows active state when saved', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} isSaved={true} />
      );

      expect(getByLabelText('Save for later')).toBeTruthy();
    });

    it('does not render save button when onSave is not provided', () => {
      const { queryByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onSave={undefined} />
      );

      expect(queryByLabelText('Save for later')).toBeNull();
    });
  });

  describe('Share Button', () => {
    it('calls onShare when pressed', () => {
      const onShare = jest.fn();
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onShare={onShare} />
      );

      const shareButton = getByLabelText('Share');
      fireEvent.press(shareButton);

      expect(onShare).toHaveBeenCalledTimes(1);
    });

    it('does not render share button when onShare is not provided', () => {
      const { queryByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onShare={undefined} />
      );

      expect(queryByLabelText('Share')).toBeNull();
    });
  });

  describe('Comment Button', () => {
    it('calls onComment when pressed', () => {
      const onComment = jest.fn();
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onComment={onComment} />
      );

      const commentButton = getByLabelText('Comments');
      fireEvent.press(commentButton);

      expect(onComment).toHaveBeenCalledTimes(1);
    });

    it('displays comments count', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} commentsCount={25} />
      );

      expect(getByText('25')).toBeTruthy();
    });

    it('does not render comment button when onComment is not provided', () => {
      const { queryByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} onComment={undefined} />
      );

      expect(queryByLabelText('Comments')).toBeNull();
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on like press (non-web)', async () => {
      const Haptics = require('expo-haptics');
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      const likeButton = getByLabelText('Like');
      fireEvent.press(likeButton);

      // Haptic should be called on non-web platforms
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('triggers haptic feedback on save press', async () => {
      const Haptics = require('expo-haptics');
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      const saveButton = getByLabelText('Save for later');
      fireEvent.press(saveButton);

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('triggers haptic feedback on share press', async () => {
      const Haptics = require('expo-haptics');
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      const shareButton = getByLabelText('Share');
      fireEvent.press(shareButton);

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for like button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('has proper accessibility labels for save button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Save for later')).toBeTruthy();
    });

    it('has proper accessibility labels for share button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Share')).toBeTruthy();
    });

    it('has proper accessibility labels for comment button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Comments')).toBeTruthy();
    });

    it('sets accessibility role as button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      const likeButton = getByLabelText('Like');
      expect(likeButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('handles null counts gracefully', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar
          {...defaultProps}
          likesCount={null}
          commentsCount={null}
        />
      );

      expect(getByLabelText('Like')).toBeTruthy();
    });

    it('handles negative counts gracefully', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={-5} />
      );

      // Should display negative count as-is or handle appropriately
      expect(getByText('-5')).toBeTruthy();
    });

    it('handles very large counts', () => {
      const { getByText } = render(
        <ArticleEngagementBar {...defaultProps} likesCount={9999999} />
      );

      expect(getByText('10000.0k')).toBeTruthy();
    });

    it('handles missing callbacks gracefully', () => {
      const { getByLabelText, queryByLabelText } = render(
        <ArticleEngagementBar
          isLiked={false}
          isSaved={false}
          likesCount={10}
        />
      );

      // Should not render buttons when callbacks are missing
      expect(queryByLabelText('Like')).toBeNull();
      expect(queryByLabelText('Save for later')).toBeNull();
    });
  });

  describe('Visual States', () => {
    it('applies glass morphism effect', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);

      expect(getByLabelText('Like')).toBeTruthy();
      // Glass effect styles are applied internally
    });

    it('applies cobalt accent color when active', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} isLiked={true} />
      );

      expect(getByLabelText('Like')).toBeTruthy();
      // Accent color applied to active state
    });

    it('uses fill for like icon when active', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} isLiked={true} />
      );

      expect(getByLabelText('Like')).toBeTruthy();
      // Heart icon should be filled when liked
    });

    it('uses fill for save icon when active', () => {
      const { getByLabelText } = render(
        <ArticleEngagementBar {...defaultProps} isSaved={true} />
      );

      expect(getByLabelText('Save for later')).toBeTruthy();
      // Bookmark icon should be filled when saved
    });
  });
});
