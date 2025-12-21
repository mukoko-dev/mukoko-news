/**
 * withScreenErrorBoundary - HOC to wrap screens with error boundary
 * Usage: const WrappedScreen = withScreenErrorBoundary(MyScreen, 'My Screen');
 */

import React from 'react';
import ScreenErrorBoundary from './ScreenErrorBoundary';

export function withScreenErrorBoundary(Component, screenName) {
  return function WrappedComponent(props) {
    return (
      <ScreenErrorBoundary
        screenName={screenName}
        navigation={props.navigation}
      >
        <Component {...props} />
      </ScreenErrorBoundary>
    );
  };
}

export default withScreenErrorBoundary;
