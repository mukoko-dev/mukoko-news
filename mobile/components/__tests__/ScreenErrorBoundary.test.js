/**
 * ScreenErrorBoundary Tests
 * Tests for screen-level error boundary component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScreenErrorBoundary from '../ScreenErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return null;
};

// Suppress console.error for error boundary tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ScreenErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ScreenErrorBoundary screenName="Test Screen">
          <ThrowError shouldThrow={false} />
        </ScreenErrorBoundary>
      );
      // Should render without error
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays error UI', () => {
      const { getByText } = render(
        <ScreenErrorBoundary screenName="Test Screen">
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByText('Test Screen unavailable')).toBeTruthy();
    });

    it('displays default screen name if not provided', () => {
      const { getByText } = render(
        <ScreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByText('This screen unavailable')).toBeTruthy();
    });

    it('displays error message', () => {
      const { getByText } = render(
        <ScreenErrorBoundary screenName="Test Screen">
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByText(/having trouble loading this screen/i)).toBeTruthy();
    });

    it('displays retry button', () => {
      const { getByText } = render(
        <ScreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('displays home button when navigation is provided', () => {
      const mockNavigation = { navigate: jest.fn() };

      const { getByText } = render(
        <ScreenErrorBoundary navigation={mockNavigation}>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByText('Home')).toBeTruthy();
    });

    it('does not display home button when navigation is not provided', () => {
      const { queryByText } = render(
        <ScreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(queryByText('Home')).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    it('calls onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ScreenErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="Callback error" />
        </ScreenErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Callback error');
    });

    it('navigates home when home button is pressed', () => {
      const mockNavigation = { navigate: jest.fn() };

      const { getByText } = render(
        <ScreenErrorBoundary navigation={mockNavigation}>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      fireEvent.press(getByText('Home'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('Accessibility', () => {
    it('retry button has proper accessibility label', () => {
      const { getByLabelText } = render(
        <ScreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByLabelText('Retry loading screen')).toBeTruthy();
    });

    it('home button has proper accessibility label', () => {
      const mockNavigation = { navigate: jest.fn() };

      const { getByLabelText } = render(
        <ScreenErrorBoundary navigation={mockNavigation}>
          <ThrowError shouldThrow={true} />
        </ScreenErrorBoundary>
      );

      expect(getByLabelText('Go to home screen')).toBeTruthy();
    });
  });
});
