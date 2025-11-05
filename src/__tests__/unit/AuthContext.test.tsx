import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock de Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{auth.user ? 'has-user' : 'no-user'}</div>
      <div data-testid="user-role">{auth.userRole || 'no-role'}</div>
      <div data-testid="user-id">{auth.userId || 'no-id'}</div>
      <button 
        data-testid="signin-button"
        onClick={() => auth.signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        data-testid="signup-button"
        onClick={() => auth.signUp('test@example.com', 'password', 'doctor', {})}
      >
        Sign Up
      </button>
      <button 
        data-testid="signout-button"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('proporciona contexto inicial correcto', () => {
    // Mock de getUser que retorna usuario
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
    expect(screen.getByTestId('user-id')).toHaveTextContent('no-id');
  });

  test('maneja usuario autenticado', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'doctor@example.com'
    };

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('has-user');
  });

  test('maneja la función signIn', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByTestId('signin-button').click();

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('maneja la función signUp', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByTestId('signup-button').click();

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          role: 'doctor',
          additionalData: {}
        }
      }
    });
  });

  test('maneja la función signOut', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    mockSupabase.auth.signOut.mockResolvedValueOnce({
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByTestId('signout-button').click();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  test('escucha cambios de estado de autenticación', () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    const mockCallback = jest.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  test('carga el rol del usuario correctamente', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'doctor@example.com'
    };

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Verificar que se llama a la función para cargar el rol
    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
  });

  test('maneja errores de autenticación', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByTestId('signin-button').click();

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });
});
