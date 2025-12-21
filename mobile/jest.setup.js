/**
 * Jest Setup for Mukoko News Mobile App
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons',
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Heart: 'Heart',
  Bookmark: 'Bookmark',
  Share2: 'Share2',
  MessageCircle: 'MessageCircle',
  ChevronLeft: 'ChevronLeft',
  ExternalLink: 'ExternalLink',
  Loader2: 'Loader2',
  AlertCircle: 'AlertCircle',
  RefreshCw: 'RefreshCw',
  Tag: 'Tag',
  User: 'User',
  Twitter: 'Twitter',
  Link: 'Link',
  Check: 'Check',
  X: 'X',
  Facebook: 'Facebook',
  Linkedin: 'Linkedin',
  Sun: 'Sun',
  Moon: 'Moon',
  Bell: 'Bell',
  Newspaper: 'Newspaper',
  Search: 'Search',
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: () => ({
    isReady: jest.fn(() => true),
    getRootState: jest.fn(() => ({ index: 0, routes: [{ name: 'Home' }] })),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => false),
    getCurrentRoute: jest.fn(),
    getCurrentOptions: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
  DefaultTheme: { colors: {}, fonts: {} },
  DarkTheme: { colors: {}, fonts: {} },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock react-native-markdown-display
jest.mock('react-native-markdown-display', () => 'Markdown');

// Mock React Native Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Global test utilities
global.fetch = jest.fn();
global.__DEV__ = true; // React Native development global

// Silence console during tests (optional - uncomment to enable)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
