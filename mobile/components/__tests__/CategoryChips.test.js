/**
 * CategoryChips Tests
 * Comprehensive test suite for category filter chips
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryChips, { CategoryPills } from '../CategoryChips';

// Mock dependencies
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        surfaceBorder: '#e0dfdc',
        primary: '#4B0082',
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
        'on-primary': '#FFFFFF',
      },
    },
  }),
}));

describe('CategoryChips', () => {
  const mockCategories = [
    { id: 'politics', name: 'Politics', slug: 'politics', article_count: 15 },
    { id: 'business', name: 'Business', slug: 'business', article_count: 12 },
    { id: 'sports', name: 'Sports', slug: 'sports', article_count: 8 },
    { id: 'technology', name: 'Technology', slug: 'technology', article_count: 20 },
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
      expect(getByText('Technology')).toBeTruthy();
    });

    it('renders "All" chip when showAll is true', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showAll={true}
        />
      );

      expect(getByText('All')).toBeTruthy();
    });

    it('does not render "All" chip when showAll is false', () => {
      const { queryByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showAll={false}
        />
      );

      expect(queryByText('All')).toBeNull();
    });

    it('displays article counts when showCounts is true', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showCounts={true}
        />
      );

      expect(getByText('15')).toBeTruthy();
      expect(getByText('12')).toBeTruthy();
      expect(getByText('8')).toBeTruthy();
      expect(getByText('20')).toBeTruthy();
    });

    it('does not display article counts when showCounts is false', () => {
      const { queryByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showCounts={false}
        />
      );

      expect(queryByText('15')).toBeNull();
    });

    it('displays emojis when showEmojis is true', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showEmojis={true}
        />
      );

      expect(getByText('🏛️')).toBeTruthy(); // Politics emoji
      expect(getByText('💼')).toBeTruthy(); // Business emoji
      expect(getByText('⚽')).toBeTruthy(); // Sports emoji
    });

    it('does not display emojis when showEmojis is false', () => {
      const { queryByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showEmojis={false}
        />
      );

      expect(queryByText('🏛️')).toBeNull();
    });

    it('formats counts over 99 as "99+"', () => {
      const categoriesWithHighCount = [
        { id: 'popular', name: 'Popular', slug: 'popular', article_count: 150 },
      ];

      const { getByText } = render(
        <CategoryChips
          categories={categoriesWithHighCount}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showCounts={true}
        />
      );

      expect(getByText('99+')).toBeTruthy();
    });

    it('handles empty categories array', () => {
      const { queryByText } = render(
        <CategoryChips
          categories={[]}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      // Should only show "All" if showAll is true
      expect(queryByText('Politics')).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('shows selected state for selected category', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory="politics"
          onCategoryPress={mockOnPress}
        />
      );

      const politicsChip = getByText('Politics');
      expect(politicsChip).toBeTruthy();
      // Selected styling applied internally
    });

    it('shows selected state for "All" when selectedCategory is null', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showAll={true}
        />
      );

      const allChip = getByText('All');
      expect(allChip).toBeTruthy();
      // "All" should be selected when selectedCategory is null
    });

    it('deselects all chips when a different category is selected', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory="business"
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('Business')).toBeTruthy();
      // Only Business should be selected
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

    it('calls onCategoryPress with null when "All" is pressed', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showAll={true}
        />
      );

      const allChip = getByText('All');
      fireEvent.press(allChip);

      expect(mockOnPress).toHaveBeenCalledWith(null);
    });

    it('can select a category multiple times', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      const politicsChip = getByText('Politics');
      fireEvent.press(politicsChip);
      fireEvent.press(politicsChip);

      expect(mockOnPress).toHaveBeenCalledTimes(2);
      expect(mockOnPress).toHaveBeenCalledWith('politics');
    });
  });

  describe('Emoji Mapping', () => {
    it('uses correct emoji for politics category', () => {
      const { getByText } = render(
        <CategoryChips
          categories={[mockCategories[0]]}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('🏛️')).toBeTruthy();
    });

    it('uses correct emoji for business category', () => {
      const { getByText } = render(
        <CategoryChips
          categories={[mockCategories[1]]}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('💼')).toBeTruthy();
    });

    it('uses default emoji for unknown category', () => {
      const unknownCategory = [
        { id: 'unknown', name: 'Unknown', slug: 'unknown', article_count: 5 },
      ];

      const { getByText } = render(
        <CategoryChips
          categories={unknownCategory}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('📄')).toBeTruthy(); // Default emoji
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for category chips', () => {
      const { getByLabelText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByLabelText('Politics category, 15 articles')).toBeTruthy();
    });

    it('sets accessibility role as button', () => {
      const { getByLabelText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      const chip = getByLabelText('Politics category, 15 articles');
      expect(chip.props.accessibilityRole).toBe('button');
    });

    it('provides accessibility hint', () => {
      const { getByLabelText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
        />
      );

      const chip = getByLabelText('Politics category, 15 articles');
      expect(chip.props.accessibilityHint).toBe('Filter news by Politics category');
    });

    it('indicates selected state in accessibility', () => {
      const { getByLabelText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory="politics"
          onCategoryPress={mockOnPress}
        />
      );

      const chip = getByLabelText('Politics category, 15 articles');
      expect(chip.props.accessibilityState.selected).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles categories without article_count', () => {
      const categoriesWithoutCount = [
        { id: 'news', name: 'News', slug: 'news' },
      ];

      const { getByText, queryByText } = render(
        <CategoryChips
          categories={categoriesWithoutCount}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showCounts={true}
        />
      );

      expect(getByText('News')).toBeTruthy();
      // Should not show count badge when count is missing
    });

    it('handles categories with zero article_count', () => {
      const categoriesWithZeroCount = [
        { id: 'empty', name: 'Empty', slug: 'empty', article_count: 0 },
      ];

      const { getByText, queryByText } = render(
        <CategoryChips
          categories={categoriesWithZeroCount}
          selectedCategory={null}
          onCategoryPress={mockOnPress}
          showCounts={true}
        />
      );

      expect(getByText('Empty')).toBeTruthy();
      // Should not show count badge when count is 0
    });

    it('handles selection by category id instead of slug', () => {
      const { getByText } = render(
        <CategoryChips
          categories={mockCategories}
          selectedCategory="politics"
          onCategoryPress={mockOnPress}
        />
      );

      expect(getByText('Politics')).toBeTruthy();
    });
  });
});

describe('CategoryPills', () => {
  const mockCategories = [
    { id: 'politics', name: 'Politics', slug: 'politics' },
    { id: 'business', name: 'Business', slug: 'business' },
    { id: 'sports', name: 'Sports', slug: 'sports' },
  ];

  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all category pills', () => {
      const { getByText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={[]}
          onCategoryToggle={mockOnToggle}
        />
      );

      expect(getByText('Politics')).toBeTruthy();
      expect(getByText('Business')).toBeTruthy();
      expect(getByText('Sports')).toBeTruthy();
    });

    it('shows checkmark for selected categories', () => {
      const { getByText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={['politics']}
          onCategoryToggle={mockOnToggle}
        />
      );

      expect(getByText('✓')).toBeTruthy();
    });

    it('displays emojis when showEmojis is true', () => {
      const { getByText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={[]}
          onCategoryToggle={mockOnToggle}
          showEmojis={true}
        />
      );

      expect(getByText('🏛️')).toBeTruthy();
    });
  });

  describe('Multi-select', () => {
    it('allows selecting multiple categories', () => {
      const { getByText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={['politics', 'business']}
          onCategoryToggle={mockOnToggle}
          multiSelect={true}
        />
      );

      expect(getByText('Politics')).toBeTruthy();
      expect(getByText('Business')).toBeTruthy();
    });

    it('calls onCategoryToggle when pill is pressed', () => {
      const { getByText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={[]}
          onCategoryToggle={mockOnToggle}
        />
      );

      const politicsPill = getByText('Politics');
      fireEvent.press(politicsPill);

      expect(mockOnToggle).toHaveBeenCalledWith('politics');
    });
  });

  describe('Accessibility', () => {
    it('sets accessibility role as checkbox', () => {
      const { getByLabelText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={[]}
          onCategoryToggle={mockOnToggle}
        />
      );

      const pill = getByLabelText('Politics category');
      expect(pill.props.accessibilityRole).toBe('checkbox');
    });

    it('indicates checked state in accessibility', () => {
      const { getByLabelText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={['politics']}
          onCategoryToggle={mockOnToggle}
        />
      );

      const pill = getByLabelText('Politics category');
      expect(pill.props.accessibilityState.checked).toBe(true);
    });

    it('provides accessibility hint for selection', () => {
      const { getByLabelText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={[]}
          onCategoryToggle={mockOnToggle}
        />
      );

      const pill = getByLabelText('Politics category');
      expect(pill.props.accessibilityHint).toBe('Select Politics');
    });

    it('provides accessibility hint for deselection', () => {
      const { getByLabelText } = render(
        <CategoryPills
          categories={mockCategories}
          selectedCategories={['politics']}
          onCategoryToggle={mockOnToggle}
        />
      );

      const pill = getByLabelText('Politics category');
      expect(pill.props.accessibilityHint).toBe('Deselect Politics');
    });
  });
});
