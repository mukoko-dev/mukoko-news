module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-vector-icons|@react-navigation|expo|@expo|expo-.*|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
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
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
