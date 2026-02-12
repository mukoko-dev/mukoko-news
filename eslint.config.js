import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default [
  // Base JavaScript config
  js.configs.recommended,
  
  // React specific config
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        // React Native / Expo globals
        __DEV__: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        alert: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Custom rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  // Cloudflare Workers specific config
  {
    files: ['workers/**/*.js', 'src/worker/**/*.js'],
    languageOptions: {
      globals: {
        addEventListener: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        ReadableStream: 'readonly',
        WritableStream: 'readonly',
        TransformStream: 'readonly',
        crypto: 'readonly',
        caches: 'readonly',
        KVNamespace: 'readonly',
        ExecutionContext: 'readonly',
        ScheduledController: 'readonly',
        DurableObjectNamespace: 'readonly',
        DurableObjectStorage: 'readonly',
        DurableObjectState: 'readonly',
        WebSocketPair: 'readonly',
        AnalyticsEngineDataset: 'readonly',
      },
    },
  },
  
  // Service Worker config
  {
    files: ['**/service-worker.js', '**/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        fetch: 'readonly',
        clients: 'readonly',
        skipWaiting: 'readonly',
        registration: 'readonly',
        addEventListener: 'readonly',
        importScripts: 'readonly',
      },
    },
  },

  // Test files config
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.wrangler/**',
      'coverage/**',
      '*.min.js',
      'public/**',
      '.vite/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      'src/__tests__/**',
    ],
  },
  
  // Prettier config (should be last to override other formatting rules)
  prettier,
]