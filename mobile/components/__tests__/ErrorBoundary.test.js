/**
 * ErrorBoundary Tests
 * Tests for root-level error boundary component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';

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

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      // Should render without error
    });

    it('renders multiple children without error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      // Should render without error
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays error UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Test error message" />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Mukoko News encountered an error')).toBeTruthy();
    });

    it('displays error details', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Custom error message" />
        </ErrorBoundary>
      );

      expect(getByText('Error Details:')).toBeTruthy();
      expect(getByText('Custom error message')).toBeTruthy();
    });

    it('displays reload button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Reload App')).toBeTruthy();
    });

    it('displays help text', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/try clearing your browser cache/i)).toBeTruthy();
    });
  });

  describe('Error Logging', () => {
    it('logs error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Logged error" />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('reload button has proper accessibility attributes', () => {
      const { getByLabelText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByLabelText('Reload application')).toBeTruthy();
    });
  });
});
