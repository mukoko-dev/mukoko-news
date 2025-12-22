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

// Mock React Native's native bridge configuration
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

// Mock NativeModules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({})),
    customBubblingEventTypes: {},
    customDirectEventTypes: {},
    AndroidTextInput: {
      Commands: {},
    },
  },
  RCTEventEmitter: {
    register: jest.fn(),
  },
  PlatformConstants: {
    reactNativeVersion: { major: 0, minor: 70, patch: 0 },
  },
  SourceCode: {
    scriptURL: null,
  },
}));

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock TurboModule Registry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => ({})),
}));

// Mock React Native Feature Flags
jest.mock('react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags', () => ({
  __esModule: true,
  default: {
    commonTestFlag: jest.fn(() => false),
    allowCollapsableChildren: jest.fn(() => true),
    allowRecursiveCommitsWithSynchronousMountOnAndroid: jest.fn(() => false),
    batchRenderingUpdatesInEventLoop: jest.fn(() => false),
    destroyFabricSurfacesInReactInstanceManager: jest.fn(() => false),
    enableBackgroundExecutor: jest.fn(() => false),
    enableCleanTextInputYogaNode: jest.fn(() => false),
    enableGranularShadowTreeStateReconciliation: jest.fn(() => false),
    enableMicrotasks: jest.fn(() => false),
    enableSynchronousStateUpdates: jest.fn(() => false),
    enableUIConsistency: jest.fn(() => false),
    forceBatchingMountItemsOnAndroid: jest.fn(() => false),
    fuseboxEnabledDebug: jest.fn(() => false),
    fuseboxEnabledRelease: jest.fn(() => false),
    lazyAnimationCallbacks: jest.fn(() => false),
    preventDoubleTextMeasure: jest.fn(() => true),
    useModernRuntimeScheduler: jest.fn(() => false),
    useNativeViewConfigsInBridgelessMode: jest.fn(() => false),
    useRuntimeShadowNodeReferenceUpdate: jest.fn(() => false),
    useRuntimeShadowNodeReferenceUpdateOnLayout: jest.fn(() => false),
    useStateAlignmentMechanism: jest.fn(() => false),
  },
  get: jest.fn(() => ({
    NativeReactNativeFeatureFlagsCxx: {
      commonTestFlag: () => false,
      allowCollapsableChildren: () => true,
      allowRecursiveCommitsWithSynchronousMountOnAndroid: () => false,
      batchRenderingUpdatesInEventLoop: () => false,
      destroyFabricSurfacesInReactInstanceManager: () => false,
      enableBackgroundExecutor: () => false,
      enableCleanTextInputYogaNode: () => false,
      enableGranularShadowTreeStateReconciliation: () => false,
      enableMicrotasks: () => false,
      enableSynchronousStateUpdates: () => false,
      enableUIConsistency: () => false,
      forceBatchingMountItemsOnAndroid: () => false,
      fuseboxEnabledDebug: () => false,
      fuseboxEnabledRelease: () => false,
      lazyAnimationCallbacks: () => false,
      preventDoubleTextMeasure: () => true,
      useModernRuntimeScheduler: () => false,
      useNativeViewConfigsInBridgelessMode: () => false,
      useRuntimeShadowNodeReferenceUpdate: () => false,
      useRuntimeShadowNodeReferenceUpdateOnLayout: () => false,
      useStateAlignmentMechanism: () => false,
    },
  })),
}));

// Global test utilities
global.fetch = jest.fn();
global.__DEV__ = true; // React Native development global

// Mock React Native Platform
const Platform = {
  OS: 'ios',
  Version: '14.0',
  isPad: false,
  isTVOS: false,
  isTV: false,
  select: (obj) => obj.ios || obj.default,
  constants: {},
};

jest.doMock('react-native/Libraries/Utilities/Platform', () => Platform);

// Mock React Native completely to avoid native module issues
jest.mock('react-native', () => ({
  // Core components as strings (for shallow rendering)
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  Image: 'Image',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  ActivityIndicator: 'ActivityIndicator',
  RefreshControl: 'RefreshControl',
  Modal: 'Modal',
  SafeAreaView: 'SafeAreaView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',

  // Platform
  Platform: {
    OS: 'ios',
    Version: '14.0',
    isPad: false,
    isTVOS: false,
    isTV: false,
    select: (obj) => obj.ios || obj.default,
  },

  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    compose: (style1, style2) => [style1, style2],
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },

  // Dimensions (already mocked separately but include here too)
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // PixelRatio
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (layoutSize) => layoutSize * 2,
    roundToNearestPixel: (layoutSize) => layoutSize,
  },

  // Other APIs
  Alert: {
    alert: jest.fn(),
  },
  AppRegistry: {
    registerComponent: jest.fn(),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    decay: jest.fn(() => ({ start: jest.fn() })),
    Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn() })),
    ValueXY: jest.fn(() => ({ x: 0, y: 0 })),
    event: jest.fn(),
    createAnimatedComponent: (comp) => comp,
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StatusBar: 'StatusBar',
}));

// Silence console during tests (optional - uncomment to enable)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
