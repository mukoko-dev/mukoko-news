import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';

/**
 * Responsive breakpoints matching Instagram-style layout
 * - Mobile: < 768px - Full width, bottom tab navigation
 * - Tablet: 768px - 1024px - Left sidebar + content + right sidebar
 * - Desktop: >= 1024px - Left sidebar + content + right sidebar
 */
export const BREAKPOINTS = {
  mobile: 768,    // Below this: mobile layout with bottom tabs
  tablet: 1024,   // 768-1024: tablet layout with both sidebars
  desktop: 1024,  // Above this: full desktop with both sidebars
};

// Sidebar widths matching Instagram proportions
export const SIDEBAR_WIDTHS = {
  left: 220,           // Left navigation sidebar
  leftCollapsed: 72,   // Collapsed icon-only sidebar (tablet portrait)
  right: 320,          // Right suggestions sidebar
  rightTablet: 280,    // Narrower right sidebar for tablet
};

// Content constraints for readability
export const CONTENT_WIDTHS = {
  maxWidth: 630,       // Instagram-style max content width
  mobileWidth: '100%', // Full width on mobile
};

// Layout context for child components to access layout info
const LayoutContext = createContext({
  layout: 'mobile',
  screenWidth: 375,
  isLeftSidebarVisible: false,
  isRightSidebarVisible: false,
  contentWidth: '100%',
});

export const useLayout = () => useContext(LayoutContext);

/**
 * ResponsiveLayout - Instagram-style responsive wrapper
 *
 * On Mobile (< 768px):
 * - Full-width content
 * - Bottom tab navigation (handled by AppNavigator)
 *
 * On Tablet (768px - 1024px):
 * - Left sidebar navigation (icons + labels)
 * - Centered content area
 * - Right sidebar with suggestions/trending (narrower)
 *
 * On Desktop (>= 1024px):
 * - Left sidebar navigation
 * - Centered content area with max-width
 * - Right sidebar with suggestions/trending
 */
export default function ResponsiveLayout({
  children,
  leftSidebar,
  rightSidebar,
  showLeftSidebar = true,
  showRightSidebar = true,
}) {
  const paperTheme = usePaperTheme();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // Listen for dimension changes (orientation, resize)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Determine layout type based on screen width
  const getLayout = () => {
    if (screenWidth < BREAKPOINTS.mobile) return 'mobile';
    if (screenWidth < BREAKPOINTS.desktop) return 'tablet';
    return 'desktop';
  };

  const layout = getLayout();
  const isMobile = layout === 'mobile';
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'desktop';

  // Sidebar visibility - both sidebars show on tablet and desktop
  const isLeftSidebarVisible = !isMobile && showLeftSidebar && leftSidebar;
  const isRightSidebarVisible = !isMobile && showRightSidebar && rightSidebar;

  // Right sidebar width - narrower on tablet
  const rightSidebarWidth = isTablet ? SIDEBAR_WIDTHS.rightTablet : SIDEBAR_WIDTHS.right;

  // Calculate content width
  const getContentWidth = () => {
    if (isMobile) return '100%';

    let availableWidth = screenWidth;
    if (isLeftSidebarVisible) availableWidth -= SIDEBAR_WIDTHS.left;
    if (isRightSidebarVisible) availableWidth -= rightSidebarWidth;

    // Limit content width for readability on very wide screens
    return Math.min(availableWidth, CONTENT_WIDTHS.maxWidth);
  };

  const contentWidth = getContentWidth();

  // Context value for child components
  const layoutContextValue = {
    layout,
    screenWidth,
    isLeftSidebarVisible,
    isRightSidebarVisible,
    contentWidth,
    rightSidebarWidth,
    isMobile,
    isTablet,
    isDesktop,
  };

  // Dynamic styles
  const dynamicStyles = {
    container: {
      backgroundColor: paperTheme.colors.background,
    },
    sidebar: {
      backgroundColor: paperTheme.colors.background,
      borderColor: paperTheme.colors.outline,
    },
    content: {
      backgroundColor: paperTheme.colors.background,
    },
  };

  // Mobile layout - just render children (bottom tabs handled elsewhere)
  if (isMobile) {
    return (
      <LayoutContext.Provider value={layoutContextValue}>
        <View style={[styles.container, dynamicStyles.container]}>
          {children}
        </View>
      </LayoutContext.Provider>
    );
  }

  // Tablet/Desktop layout - Instagram-style three-column
  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <View style={[styles.container, styles.desktopContainer, dynamicStyles.container]}>
        {/* Left Sidebar - Navigation */}
        {isLeftSidebarVisible && (
          <View style={[
            styles.leftSidebar,
            dynamicStyles.sidebar,
            { width: SIDEBAR_WIDTHS.left }
          ]}>
            {leftSidebar}
          </View>
        )}

        {/* Main Content Area */}
        <View style={[styles.contentArea, dynamicStyles.content]}>
          <View style={[
            styles.contentInner,
            isDesktop && { maxWidth: CONTENT_WIDTHS.maxWidth },
          ]}>
            {children}
          </View>
        </View>

        {/* Right Sidebar - Suggestions (Tablet and Desktop) */}
        {isRightSidebarVisible && (
          <View style={[
            styles.rightSidebar,
            dynamicStyles.sidebar,
            { width: rightSidebarWidth }
          ]}>
            {rightSidebar}
          </View>
        )}
      </View>
    </LayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopContainer: {
    flexDirection: 'row',
  },
  leftSidebar: {
    borderRightWidth: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
  },
  contentInner: {
    flex: 1,
    width: '100%',
  },
  rightSidebar: {
    borderLeftWidth: 1,
  },
});
