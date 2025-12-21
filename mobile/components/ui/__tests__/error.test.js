/**
 * Error Component Tests
 * Tests for shadcn-style error state components
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState, ErrorBanner } from '../error';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

describe('Error Components', () => {
  describe('ErrorState', () => {
    it('renders with default title', () => {
      const { getByText } = render(<ErrorState />);
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('renders with custom title', () => {
      const { getByText } = render(<ErrorState title="Custom Error" />);
      expect(getByText('Custom Error')).toBeTruthy();
    });

    it('renders with message', () => {
      const { getByText } = render(
        <ErrorState message="Failed to load data" />
      );
      expect(getByText('Failed to load data')).toBeTruthy();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<ErrorState onRetry={onRetry} />);
      expect(getByText('Try Again')).toBeTruthy();
    });

    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = render(<ErrorState onRetry={onRetry} />);

      fireEvent.press(getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render retry button when showRetryButton is false', () => {
      const onRetry = jest.fn();
      const { queryByText } = render(
        <ErrorState onRetry={onRetry} showRetryButton={false} />
      );
      expect(queryByText('Try Again')).toBeNull();
    });

    it('does not render retry button when onRetry is not provided', () => {
      const { queryByText } = render(<ErrorState />);
      expect(queryByText('Try Again')).toBeNull();
    });

    it('renders with custom icon', () => {
      const CustomIcon = () => null;
      const { root } = render(<ErrorState icon={CustomIcon} />);
      expect(root).toBeTruthy();
    });

    it('renders with default icon', () => {
      const { root } = render(<ErrorState />);
      expect(root).toBeTruthy();
    });

    it('applies custom className', () => {
      const { root } = render(<ErrorState className="custom-error" />);
      expect(root).toBeTruthy();
    });
  });

  describe('ErrorBanner', () => {
    it('renders with message', () => {
      const { getByText } = render(<ErrorBanner message="Error occurred" />);
      expect(getByText('Error occurred')).toBeTruthy();
    });

    it('renders dismiss button when onDismiss is provided', () => {
      const onDismiss = jest.fn();
      const { getByText } = render(
        <ErrorBanner message="Error" onDismiss={onDismiss} />
      );
      expect(getByText('Dismiss')).toBeTruthy();
    });

    it('calls onDismiss when dismiss button is pressed', () => {
      const onDismiss = jest.fn();
      const { getByText } = render(
        <ErrorBanner message="Error" onDismiss={onDismiss} />
      );

      fireEvent.press(getByText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not render dismiss button when onDismiss is not provided', () => {
      const { queryByText } = render(<ErrorBanner message="Error" />);
      expect(queryByText('Dismiss')).toBeNull();
    });

    it('applies custom className', () => {
      const { root } = render(
        <ErrorBanner message="Error" className="custom-banner" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Complete Error Scenarios', () => {
    it('renders complete error state with all props', () => {
      const onRetry = jest.fn();
      const CustomIcon = () => null;

      const { getByText } = render(
        <ErrorState
          title="Network Error"
          message="Unable to connect to server"
          onRetry={onRetry}
          icon={CustomIcon}
          showRetryButton={true}
          className="custom-error"
        />
      );

      expect(getByText('Network Error')).toBeTruthy();
      expect(getByText('Unable to connect to server')).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });

    it('renders complete error banner with all props', () => {
      const onDismiss = jest.fn();

      const { getByText } = render(
        <ErrorBanner
          message="Session expired"
          onDismiss={onDismiss}
          className="custom-banner"
        />
      );

      expect(getByText('Session expired')).toBeTruthy();
      expect(getByText('Dismiss')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message in ErrorState', () => {
      const { root } = render(<ErrorState message="" />);
      expect(root).toBeTruthy();
    });

    it('handles empty message in ErrorBanner', () => {
      const { root } = render(<ErrorBanner message="" />);
      expect(root).toBeTruthy();
    });

    it('handles long error messages', () => {
      const longMessage = 'This is a very long error message that should wrap properly and not overflow the container boundaries.';
      const { getByText } = render(<ErrorState message={longMessage} />);
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('handles onRetry being undefined', () => {
      const { root } = render(<ErrorState onRetry={undefined} />);
      expect(root).toBeTruthy();
    });
  });
});
