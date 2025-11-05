import type { Config } from 'jest';

const config: Config = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ]
  },
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/jest.transform-stub.js'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library)/)'
  ]
};

export default config;
