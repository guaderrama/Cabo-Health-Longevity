module.exports = {
  // Entorno de testing
  testEnvironment: 'jsdom',
  
  // Directorio base para resolver módulos
  roots: ['<rootDir>/src'],
  
  // Patrones para archivos de test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  // Configuración para módulos
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.(css|less|scss|sass)$': 'jest-transform-stub'
  },
  
  // Módulos a ignorar
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@radix-ui|chart.js|lucide-react|clsx)/)',
  ],
  
  // Configuración de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Configuración del entorno JS
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // Configuración de archivos setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Configuración para coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Configuración para simular timers
  fakeTimers: {
    enableGlobally: false
  },
  
  // Configuración para archivos de prueba
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Configuración para archivos de test
  verbose: true,
  
  // Configuración para CSS Modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
