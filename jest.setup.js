// Importar jest-dom para matchers adicionales
import '@testing-library/jest-dom';

// Configuración global para tests

// Mock para IntersectionObserver (usado por algunos componentes de UI)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock para window.matchMedia (usado por componentes responsive)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para ResizeObserver (usado por algunos componentes de UI)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Configuración para console en testing
const originalConsoleError = console.error;
console.error = (...args) => {
  // Silenciar warnings de React que no son errores críticos
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || 
     args[0].includes('useLayoutEffect') ||
     args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Configuración de timezone para fechas en tests
process.env.TZ = 'UTC';

// Configuración para fetch si es necesario
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Configuración para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Configuración para sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;
