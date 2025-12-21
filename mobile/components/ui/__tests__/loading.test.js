/**
 * Loading Component Tests
 * Tests for shadcn-style loading state components
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState, LoadingSpinner } from '../loading';

describe('Loading Components', () => {
  describe('LoadingState', () => {
    it('renders fullscreen variant by default', () => {
      const { root } = render(<LoadingState />);
      expect(root).toBeTruthy();
    });

    it('renders with message', () => {
      const { getByText } = render(<LoadingState message="Loading articles..." />);
      expect(getByText('Loading articles...')).toBeTruthy();
    });

    it('renders inline variant', () => {
      const { getByText } = render(
        <LoadingState variant="inline" message="Loading..." />
      );
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders fullscreen variant', () => {
      const { getByText } = render(
        <LoadingState variant="fullscreen" message="Loading..." />
      );
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders without message', () => {
      const { root } = render(<LoadingState variant="inline" />);
      expect(root).toBeTruthy();
    });

    it('applies custom className', () => {
      const { root } = render(<LoadingState className="custom-class" />);
      expect(root).toBeTruthy();
    });

    it('applies custom className to inline variant', () => {
      const { root } = render(
        <LoadingState variant="inline" className="custom-inline" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      const { root } = render(<LoadingSpinner />);
      expect(root).toBeTruthy();
    });

    it('renders with small size', () => {
      const { root } = render(<LoadingSpinner size="sm" />);
      expect(root).toBeTruthy();
    });

    it('renders with default size string', () => {
      const { root } = render(<LoadingSpinner size="default" />);
      expect(root).toBeTruthy();
    });

    it('applies custom className', () => {
      const { root } = render(<LoadingSpinner className="custom-spinner" />);
      expect(root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message gracefully', () => {
      const { root } = render(<LoadingState message="" />);
      expect(root).toBeTruthy();
    });

    it('handles long message', () => {
      const longMessage = 'Loading a very long message that might wrap to multiple lines...';
      const { getByText } = render(<LoadingState message={longMessage} />);
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('handles invalid variant gracefully', () => {
      const { root } = render(<LoadingState variant="invalid" />);
      expect(root).toBeTruthy();
    });
  });
});
