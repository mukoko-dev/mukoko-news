/**
 * CategoryChips Tests
 * Basic test coverage for category filter chips
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryChips from '../CategoryChips';

// Mock dependencies
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      surfaceVariant: '#F5F5F0',
      outline: '#CAC4D0',
      primary: '#4B0082',
      onSurface: '#1C1B1F',
      onSurfaceVariant: '#4a4a4a',
      onPrimary: '#FFFFFF',
    },
  }),
}));

describe('CategoryChips', () => {
  const mockCategories = [
    { id: 'politics', name: 'Politics', slug: 'politics', article_count: 15 },
    { id: 'business', name: 'Business', slug: 'business', article_count: 12 },
    { id: 'sports', name: 'Sports', slug: 'sports', article_count: 8 },
  ];

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all category chips', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('Politics')).toBeTruthy();
      expect(getByText('Business')).toBeTruthy();
      expect(getByText('Sports')).toBeTruthy();
    });

    it('handles empty categories array', () => {
      const { queryByText } = render(
        <CategoryChips
          categories={[]}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(queryByText('Politics')).toBeNull();
    });
  });

  describe('Interaction', () => {
    it('calls onCategoryPress when a chip is pressed', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      const politicsChip = getByText('Politics');
      fireEvent.press(politicsChip);

      expect(mockOnPress).toHaveBeenCalledWith('politics');
    });
  });
});
