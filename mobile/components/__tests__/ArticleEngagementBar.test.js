/**
 * ArticleEngagementBar Tests
 * Basic test coverage for engagement actions component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
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
    it('renders like button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);
      expect(getByLabelText('Like article')).toBeTruthy();
    });

    it('renders bookmark button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);
      expect(getByLabelText('Bookmark article')).toBeTruthy();
    });

    it('renders share button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);
      expect(getByLabelText('Share article')).toBeTruthy();
    });

    it('renders comment button', () => {
      const { getByLabelText } = render(<ArticleEngagementBar {...defaultProps} />);
      expect(getByLabelText('View comments')).toBeTruthy();
    });
  });
});
