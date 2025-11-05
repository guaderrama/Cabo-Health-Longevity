import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';


// Mock del contexto de autenticación
const mockAuth = {
  user: null,
  userRole: null,
  userId: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn()
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockAuth
}));

describe('Flujo de Autenticación - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.user = null;
    mockAuth.userRole = null;
    mockAuth.userId = null;
    mockAuth.loading = false;
  });

  test('flujo completo de login para doctor', async () => {
    // Configurar respuesta exitosa de login
    mockAuth.signIn.mockResolvedValueOnce({
      error: null,
      data: {
        user: {
          id: 'doctor-123',
          email: 'doctor@example.com'
        }
      }
    });

    // Mock del perfil de usuario doctor
    const mockUserProfile = [{
      id: 'doctor-123',
      email: 'doctor@example.com',
      role: 'doctor',
      full_name: 'Dr. Juan Pérez'
    }];

    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: mockUserProfile, 
          error: null 
        }))
      }))
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar formulario inicial
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();

    // Completar formulario
    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'doctor@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Enviar formulario
    fireEvent.click(submitButton);

    // Verificar que se llama a signIn
    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalledWith('doctor@example.com', 'password123');
    });
  });

  test('flujo completo de login para paciente', async () => {
    // Configurar respuesta exitosa de login para paciente
    mockAuth.signIn.mockResolvedValueOnce({
      error: null,
      data: {
        user: {
          id: 'patient-123',
          email: 'paciente@example.com'
        }
      }
    });

    const mockUserProfile = [{
      id: 'patient-123',
      email: 'paciente@example.com',
      role: 'patient',
      full_name: 'María González'
    }];

    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: mockUserProfile, 
          error: null 
        }))
      }))
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'paciente@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalledWith('paciente@example.com', 'password123');
    });
  });

  test('maneja errores de login correctamente', async () => {
    // Configurar respuesta de error
    mockAuth.signIn.mockResolvedValueOnce({
      error: { message: 'Credenciales inválidas' },
      data: { user: null }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalled();
      // Verificar que se muestra mensaje de error
      expect(screen.getByText(/Credenciales inválidas/)).toBeInTheDocument();
    });
  });

  test('valida campos requeridos', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    // Intentar enviar sin completar campos
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verificar que se muestran errores de validación
      expect(screen.getByText(/El email es requerido/)).toBeInTheDocument();
      expect(screen.getByText(/La contraseña es requerida/)).toBeInTheDocument();
    });

    // Verificar que no se llama a signIn
    expect(mockAuth.signIn).not.toHaveBeenCalled();
  });

  test('valida formato de email', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'email-inválido' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email no válido/)).toBeInTheDocument();
    });

    expect(mockAuth.signIn).not.toHaveBeenCalled();
  });

  test('navega al registro desde login', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const registerLink = screen.getByText(/¿No tienes cuenta\? Registrarse/);
    expect(registerLink).toBeInTheDocument();

    // Verificar que es un enlace
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('mantiene estado de loading durante autenticación', async () => {
    // Mock que resuelve después de un delay
    let resolvePromise: (value: any) => void;
    const authPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockAuth.signIn.mockReturnValueOnce(authPromise);

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/);
    const passwordInput = screen.getByLabelText(/Contraseña/);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(emailInput, { target: { value: 'doctor@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verificar estado de loading
    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolver promesa
    resolvePromise!({ error: null, data: { user: null } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar Sesión/ })).not.toBeDisabled();
    });
  });
});
