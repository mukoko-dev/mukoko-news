module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-vector-icons|@react-navigation|expo|@expo|expo-.*|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS imports from NativeWind
    '\\.css$': '<rootDir>/jest.setup.js',
    // Mock React Native components
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
  },
  collectCoverageFrom: [
    'components/**/*.js',
    'screens/**/*.js',
    'services/**/*.js',
    'contexts/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'json', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
