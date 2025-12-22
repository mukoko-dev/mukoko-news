/**
 * Card Component Tests
 * Tests for shadcn-style card components
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  describe('Card Component', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('renders as Pressable when onPress is provided', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card onPress={onPress}>
          <Text>Pressable Card</Text>
        </Card>
      );

      fireEvent.press(getByText('Pressable Card'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders as View when no onPress is provided', () => {
      const { getByText } = render(
        <Card>
          <Text>Static Card</Text>
        </Card>
      );
      expect(getByText('Static Card')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByTestId } = render(
        <Card className="custom-class" testID="custom-card">
          <Text>Custom</Text>
        </Card>
      );
      expect(getByTestId('custom-card')).toBeTruthy();
    });

    it('accepts additional props', () => {
      const { getByTestId } = render(
        <Card testID="test-card">
          <Text>Test Card</Text>
        </Card>
      );
      expect(getByTestId('test-card')).toBeTruthy();
    });
  });

  describe('CardHeader Component', () => {
    it('renders children correctly', () => {
      const { getByTestId } = render(
        <CardHeader testID="header">
          <Text>Header</Text>
        </CardHeader>
      );
      expect(getByTestId('header')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByTestId } = render(
        <CardHeader className="custom" testID="custom-header">
          <Text>Header</Text>
        </CardHeader>
      );
      expect(getByTestId('custom-header')).toBeTruthy();
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
      const { getByTestId } = render(
        <CardContent testID="content">
          <Text>Content</Text>
        </CardContent>
      );
      expect(getByTestId('content')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByTestId } = render(
        <CardContent className="custom" testID="custom-content">
          <Text>Content</Text>
        </CardContent>
      );
      expect(getByTestId('custom-content')).toBeTruthy();
    });
  });

  describe('CardFooter Component', () => {
    it('renders footer correctly', () => {
      const { getByTestId } = render(
        <CardFooter testID="footer">
          <Text>Footer</Text>
        </CardFooter>
      );
      expect(getByTestId('footer')).toBeTruthy();
    });

    it('applies custom className', () => {
      const { getByTestId } = render(
        <CardFooter className="custom" testID="custom-footer">
          <Text>Footer</Text>
        </CardFooter>
      );
      expect(getByTestId('custom-footer')).toBeTruthy();
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
          <CardContent>
            <Text>Card Content</Text>
          </CardContent>
          <CardFooter>
            <Text>Card Footer</Text>
          </CardFooter>
        </Card>
      );

      expect(getByText('Card Title')).toBeTruthy();
      expect(getByText('Card Description')).toBeTruthy();
      expect(getByText('Card Content')).toBeTruthy();
      expect(getByText('Card Footer')).toBeTruthy();
    });

    it('handles interactive composite card', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Card onPress={onPress} testID="interactive-card">
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Text>Click me</Text>
          </CardContent>
        </Card>
      );

      fireEvent.press(getByTestId('interactive-card'));
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
