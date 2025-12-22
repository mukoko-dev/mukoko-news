/**
 * ErrorBoundary Tests
 * Basic test coverage for root-level error boundary
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Hello World</Text>
        </ErrorBoundary>
      );
      expect(getByText('Hello World')).toBeTruthy();
    });
  });
});
