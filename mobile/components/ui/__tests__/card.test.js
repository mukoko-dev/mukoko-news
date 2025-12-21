/**
 * Card Component Tests
 * Tests for shadcn-style card components
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  describe('Card Component', () => {
    it('renders children correctly', () => {
      const { getByText } = render(<Card>Card Content</Card>);
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('renders as Pressable when onPress is provided', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Card onPress={onPress}>Pressable Card</Card>);

      fireEvent.press(getByText('Pressable Card'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders as View when no onPress is provided', () => {
      const { getByText } = render(<Card>Static Card</Card>);
      expect(getByText('Static Card')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<Card className="custom-class">Custom</Card>);
      expect(getByText('Custom')).toBeTruthy();
    });

    it('accepts additional props', () => {
      const { getByTestId } = render(
        <Card testID="test-card">Test Card</Card>
      );
      expect(getByTestId('test-card')).toBeTruthy();
    });
  });

  describe('CardHeader Component', () => {
    it('renders children correctly', () => {
      const { getByText } = render(<CardHeader>Header</CardHeader>);
      expect(getByText('Header')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<CardHeader className="custom">Header</CardHeader>);
      expect(getByText('Header')).toBeTruthy();
    });
  });

  describe('CardTitle Component', () => {
    it('renders title text', () => {
      const { getByText } = render(<CardTitle>Title Text</CardTitle>);
      expect(getByText('Title Text')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<CardTitle className="custom">Title</CardTitle>);
      expect(getByText('Title')).toBeTruthy();
    });
  });

  describe('CardDescription Component', () => {
    it('renders description text', () => {
      const { getByText } = render(<CardDescription>Description</CardDescription>);
      expect(getByText('Description')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<CardDescription className="custom">Desc</CardDescription>);
      expect(getByText('Desc')).toBeTruthy();
    });
  });

  describe('CardContent Component', () => {
    it('renders content correctly', () => {
      const { getByText } = render(<CardContent>Content</CardContent>);
      expect(getByText('Content')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<CardContent className="custom">Content</CardContent>);
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('CardFooter Component', () => {
    it('renders footer correctly', () => {
      const { getByText } = render(<CardFooter>Footer</CardFooter>);
      expect(getByText('Footer')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByText } = render(<CardFooter className="custom">Footer</CardFooter>);
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Composite Card', () => {
    it('renders complete card structure', () => {
      const { getByText } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(getByText('Card Title')).toBeTruthy();
      expect(getByText('Card Description')).toBeTruthy();
      expect(getByText('Card Content')).toBeTruthy();
      expect(getByText('Card Footer')).toBeTruthy();
    });

    it('handles interactive composite card', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card onPress={onPress}>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>Click me</CardContent>
        </Card>
      );

      fireEvent.press(getByText('Click me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty Card', () => {
      const { root } = render(<Card />);
      expect(root).toBeTruthy();
    });

    it('handles empty CardHeader', () => {
      const { root } = render(<CardHeader />);
      expect(root).toBeTruthy();
    });

    it('handles empty CardTitle', () => {
      const { root } = render(<CardTitle />);
      expect(root).toBeTruthy();
    });
  });
});
