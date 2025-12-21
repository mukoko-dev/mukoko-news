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
