/**
 * ScreenErrorBoundary Tests
 * Basic test coverage for screen-level error boundary
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenErrorBoundary from '../ScreenErrorBoundary';

describe('ScreenErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      const { getByText } = render(
        <ScreenErrorBoundary screenName="Test Screen">
          <Text>Hello World</Text>
        </ScreenErrorBoundary>
      );
      expect(getByText('Hello World')).toBeTruthy();
    });
  });
});
